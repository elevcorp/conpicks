/**
 * Data access facade. Server components + route handlers import from
 * here and never touch the store or Supabase directly.
 *
 * Two adapters:
 *   - seed (default)      -> lib/data/store.ts  (fully implemented)
 *   - supabase (opt-in)   -> requires NEXT_PUBLIC_USE_SUPABASE=true and a
 *                            provisioned project. Reference schema lives
 *                            in supabase/migrations + supabase/seed.
 *
 * The seed adapter is the reference implementation for this build; the
 * Supabase adapter is scaffolded (see DECISIONS.md).
 */
import { supabaseEnabled } from "@/lib/env";
import {
  DEFAULT_WEIGHTS,
  computeScore,
  rankAll,
  rankDelta,
} from "@/lib/ranking/score";
import type {
  Comment,
  FundingCampaign,
  Genre,
  Post,
  Profile,
  Season,
  Teaser,
  TeaserCardVM,
  TeaserStats,
  TeaserStatus,
} from "@/lib/types";
import { nextId, store } from "./store";

class SupabaseAdapterPending extends Error {
  constructor(op: string) {
    super(
      `Supabase data adapter not wired for "${op}". Set NEXT_PUBLIC_USE_SUPABASE=false to use the seed adapter, or implement lib/data/supabase.ts against supabase/migrations.`,
    );
  }
}
function assertSeed(op: string) {
  if (supabaseEnabled) throw new SupabaseAdapterPending(op);
}

const now = () => new Date();
const byNewest = (a: { created_at: string }, b: { created_at: string }) =>
  b.created_at.localeCompare(a.created_at);

// ------------------------------------------------------------------
//  Settings
// ------------------------------------------------------------------
export async function getAppSettings(): Promise<Record<string, string>> {
  assertSeed("getAppSettings");
  return Object.fromEntries(store.settings.map((s) => [s.key, s.value]));
}
export async function getSetting(key: string): Promise<string | undefined> {
  return (await getAppSettings())[key];
}
export async function getSettingInt(key: string, fallback: number): Promise<number> {
  const v = (await getAppSettings())[key];
  const n = v == null ? NaN : parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}
export async function updateSetting(key: string, value: string) {
  assertSeed("updateSetting");
  const row = store.settings.find((s) => s.key === key);
  if (row) row.value = value;
  else store.settings.push({ key, value, description: "" });
}

// ------------------------------------------------------------------
//  Seasons / ranking config
// ------------------------------------------------------------------
export async function getActiveSeason(): Promise<Season> {
  assertSeed("getActiveSeason");
  return (
    store.seasons.find((s) => s.status === "active") ?? store.seasons[0]
  );
}
export async function getRankingConfig(seasonId?: string) {
  assertSeed("getRankingConfig");
  const rc = store.rankingConfig;
  if (seasonId && rc.season_id && rc.season_id !== seasonId) return DEFAULT_WEIGHTS;
  return {
    w_like: rc.w_like,
    w_comment: rc.w_comment,
    w_share: rc.w_share,
    w_save: rc.w_save,
    w_complete: rc.w_complete,
    w_half: rc.w_half,
    half_life_hours: rc.half_life_hours,
  };
}
export async function updateRankingConfig(
  patch: Partial<Omit<import("@/lib/types").RankingConfig, "id">>,
  updatedBy?: string,
) {
  assertSeed("updateRankingConfig");
  Object.assign(store.rankingConfig, patch, {
    updated_by: updatedBy ?? store.rankingConfig.updated_by,
    updated_at: new Date().toISOString(),
  });
}

// ------------------------------------------------------------------
//  Teaser view-models
// ------------------------------------------------------------------
function statOf(teaserId: string): TeaserStats {
  return (
    store.stats.find((s) => s.teaser_id === teaserId) ?? {
      teaser_id: teaserId,
      like_count: 0,
      comment_count: 0,
      share_count: 0,
      save_count: 0,
      view_start: 0,
      view_half: 0,
      view_complete: 0,
      score: 0,
      rank: 0,
      prev_rank: null,
      updated_at: new Date().toISOString(),
    }
  );
}
function creatorOf(id: string) {
  const p =
    store.profiles.find((x) => x.id === id) ?? {
      id,
      nickname: "unknown",
      avatar_url: null,
      role: "creator" as const,
    };
  return {
    id: p.id,
    nickname: p.nickname,
    avatar_url: p.avatar_url ?? null,
    role: p.role,
  };
}
export function toCardVM(t: Teaser): TeaserCardVM {
  const stats = statOf(t.id);
  return {
    teaser: t,
    stats,
    creator: creatorOf(t.creator_id),
    rankDelta: rankDelta(stats.rank, stats.prev_rank),
  };
}

export type TeaserSort = "rank" | "new" | "share" | "save";

export interface ListTeasersParams {
  sort?: TeaserSort;
  genre?: Genre;
  season?: string;
  status?: TeaserStatus;
  q?: string;
  cursor?: string | null;
  limit?: number;
}

export async function listTeasers(
  params: ListTeasersParams = {},
): Promise<{ items: TeaserCardVM[]; nextCursor: string | null }> {
  assertSeed("listTeasers");
  const {
    sort = "rank",
    genre,
    season,
    status = "published",
    q,
    cursor,
    limit = 12,
  } = params;

  let rows = store.teasers.filter((t) => t.status === status);
  if (season) rows = rows.filter((t) => t.season_id === season);
  if (genre) rows = rows.filter((t) => t.genres.includes(genre));
  if (q) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter(
      (t) =>
        t.title.toLowerCase().includes(needle) ||
        t.tags.some((tag) => tag.toLowerCase().includes(needle)) ||
        creatorOf(t.creator_id).nickname.toLowerCase().includes(needle),
    );
  }

  const sorted = [...rows].sort((a, b) => {
    const sa = statOf(a.id);
    const sb = statOf(b.id);
    switch (sort) {
      case "new":
        return (b.published_at ?? b.created_at).localeCompare(
          a.published_at ?? a.created_at,
        );
      case "share":
        return sb.share_count - sa.share_count;
      case "save":
        return sb.save_count - sa.save_count;
      case "rank":
      default:
        return (sa.rank || 1e9) - (sb.rank || 1e9);
    }
  });

  const start = cursor ? Math.max(0, parseInt(cursor, 10) || 0) : 0;
  const page = sorted.slice(start, start + limit);
  const nextCursor =
    start + limit < sorted.length ? String(start + limit) : null;
  return { items: page.map(toCardVM), nextCursor };
}

export async function getTeaserBySlug(slug: string) {
  assertSeed("getTeaserBySlug");
  const candidates = new Set([slug]);
  try {
    candidates.add(decodeURIComponent(slug));
  } catch {
    /* malformed % sequence */
  }
  const t = store.teasers.find((x) => candidates.has(x.slug));
  if (!t) return null;
  return buildDetail(t);
}
export async function getTeaserById(id: string) {
  assertSeed("getTeaserById");
  const t = store.teasers.find((x) => x.id === id);
  return t ? buildDetail(t) : null;
}

function buildDetail(t: Teaser) {
  const card = toCardVM(t);
  const similar = store.teasers
    .filter(
      (x) =>
        x.id !== t.id &&
        x.status === "published" &&
        x.genres.some((g) => t.genres.includes(g)),
    )
    .slice(0, 8)
    .map(toCardVM);
  const season = store.seasons.find((s) => s.id === t.season_id) ?? null;
  return { ...card, season, similar };
}

// ------------------------------------------------------------------
//  Home bundle
// ------------------------------------------------------------------
export async function getHomeBundle() {
  assertSeed("getHomeBundle");
  const season = await getActiveSeason();
  const newWindowH = await getSettingInt("NEW_ROW_WINDOW_HOURS", 72);
  const genreOrder = JSON.parse(
    (await getSetting("HOME_GENRE_ORDER")) ?? "[]",
  ) as Genre[];

  const published = store.teasers.filter((t) => t.status === "published");
  const ranked = [...published].sort(
    (a, b) => (statOf(a.id).rank || 1e9) - (statOf(b.id).rank || 1e9),
  );

  const hero = ranked.slice(0, 3).map(toCardVM);
  const rankingTop10 = ranked.slice(0, 10).map(toCardVM);

  const cutoff = Date.now() - newWindowH * 3_600_000;
  const fresh = [...published]
    .filter((t) => t.published_at && Date.parse(t.published_at) >= cutoff)
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 12)
    .map(toCardVM);

  const mostShared = [...published]
    .sort((a, b) => statOf(b.id).share_count - statOf(a.id).share_count)
    .slice(0, 12)
    .map(toCardVM);

  const jimovieReviews = published
    .filter((t) => t.jimovie_review_url)
    .map(toCardVM);

  const byGenre = genreOrder
    .map((g) => ({
      genre: g,
      items: published
        .filter((t) => t.genres.includes(g))
        .sort((a, b) => (statOf(a.id).rank || 1e9) - (statOf(b.id).rank || 1e9))
        .slice(0, 12)
        .map(toCardVM),
    }))
    .filter((row) => row.items.length > 0);

  const funding = store.campaigns
    .filter((c) => c.status === "open")
    .map((c) => ({
      campaign: c,
      teaser: toCardVM(
        store.teasers.find((t) => t.id === c.teaser_id)!,
      ),
    }));

  return { season, hero, rankingTop10, fresh, mostShared, jimovieReviews, byGenre, funding };
}

// ------------------------------------------------------------------
//  Feed
// ------------------------------------------------------------------
export async function getFeed(params: {
  sort?: "rank" | "new" | "random";
  cursor?: string | null;
  limit?: number;
}) {
  assertSeed("getFeed");
  const { sort = "rank", cursor, limit = 8 } = params;
  let rows = store.teasers.filter((t) => t.status === "published");
  if (sort === "new")
    rows = rows.sort((a, b) =>
      (b.published_at ?? "").localeCompare(a.published_at ?? ""),
    );
  else if (sort === "random")
    rows = seededShuffle(rows, cursor ? parseInt(cursor, 10) || 1 : 1);
  else
    rows = rows.sort(
      (a, b) => (statOf(a.id).rank || 1e9) - (statOf(b.id).rank || 1e9),
    );

  const start = cursor && sort !== "random" ? parseInt(cursor, 10) || 0 : 0;
  const page = rows.slice(start, start + limit).map(toCardVM);
  const nextCursor =
    sort === "random"
      ? String((cursor ? parseInt(cursor, 10) || 1 : 1) + 1)
      : start + limit < rows.length
        ? String(start + limit)
        : null;
  return { items: page, nextCursor };
}
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------------
//  Comments
// ------------------------------------------------------------------
export async function listComments(
  teaserId: string,
  sort: "new" | "top" = "top",
) {
  assertSeed("listComments");
  const rows = store.comments.filter(
    (c) => c.teaser_id === teaserId && !c.is_hidden,
  );
  const roots = rows.filter((c) => !c.parent_id);
  roots.sort(sort === "top" ? (a, b) => b.like_count - a.like_count : byNewest);
  return roots.map((c) => ({
    comment: c,
    author: creatorOf(c.user_id),
    replies: rows
      .filter((r) => r.parent_id === c.id)
      .sort(byNewest)
      .map((r) => ({ comment: r, author: creatorOf(r.user_id) })),
  }));
}

export async function addComment(input: {
  teaserId: string;
  userId: string;
  body: string;
  parentId?: string | null;
}): Promise<Comment> {
  assertSeed("addComment");
  const c: Comment = {
    id: nextId("c"),
    teaser_id: input.teaserId,
    user_id: input.userId,
    parent_id: input.parentId ?? null,
    body: input.body.trim(),
    like_count: 0,
    is_hidden: false,
    created_at: new Date().toISOString(),
  };
  store.comments.push(c);
  syncStats(input.teaserId);
  const t = store.teasers.find((x) => x.id === input.teaserId);
  if (t && t.creator_id !== input.userId) {
    pushNotification(t.creator_id, "comment", {
      teaserId: t.id,
      commentId: c.id,
      preview: c.body.slice(0, 40),
    });
  }
  return c;
}
export async function toggleCommentLike(commentId: string, userId: string) {
  assertSeed("toggleCommentLike");
  const c = store.comments.find((x) => x.id === commentId);
  if (!c) throw new Error("comment not found");
  const i = store.commentLikes.findIndex(
    (l) => l.comment_id === commentId && l.user_id === userId,
  );
  if (i >= 0) {
    store.commentLikes.splice(i, 1);
    c.like_count = Math.max(0, c.like_count - 1);
    return { liked: false, count: c.like_count };
  }
  store.commentLikes.push({ comment_id: commentId, user_id: userId });
  c.like_count += 1;
  return { liked: true, count: c.like_count };
}

export async function deleteComment(id: string, userId: string) {
  assertSeed("deleteComment");
  const c = store.comments.find((x) => x.id === id);
  if (!c || c.user_id !== userId) return false;
  c.is_hidden = true;
  syncStats(c.teaser_id);
  return true;
}

// ------------------------------------------------------------------
//  Reactions
// ------------------------------------------------------------------
export async function toggleLike(teaserId: string, userId: string) {
  assertSeed("toggleLike");
  const i = store.likes.findIndex(
    (l) => l.teaser_id === teaserId && l.user_id === userId,
  );
  let liked: boolean;
  if (i >= 0) {
    store.likes.splice(i, 1);
    liked = false;
  } else {
    store.likes.push({
      teaser_id: teaserId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    liked = true;
  }
  syncStats(teaserId);
  return { liked, count: statOf(teaserId).like_count };
}
export async function toggleSave(teaserId: string, userId: string) {
  assertSeed("toggleSave");
  const i = store.saves.findIndex(
    (s) => s.teaser_id === teaserId && s.user_id === userId,
  );
  let saved: boolean;
  if (i >= 0) {
    store.saves.splice(i, 1);
    saved = false;
  } else {
    store.saves.push({
      teaser_id: teaserId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    saved = true;
  }
  syncStats(teaserId);
  return { saved, count: statOf(teaserId).save_count };
}
export async function addShare(
  teaserId: string,
  userId: string | null,
  channel: string,
) {
  assertSeed("addShare");
  store.shares.push({
    id: nextId("sh"),
    teaser_id: teaserId,
    user_id: userId,
    channel,
    created_at: new Date().toISOString(),
  });
  syncStats(teaserId);
  return { count: statOf(teaserId).share_count };
}
export async function addViewEvent(
  teaserId: string,
  sessionId: string,
  event: "start" | "half" | "complete",
  userId: string | null,
) {
  assertSeed("addViewEvent");
  store.viewEvents.push({
    id: nextId("v"),
    teaser_id: teaserId,
    session_id: sessionId,
    event,
    user_id: userId,
    created_at: new Date().toISOString(),
  });
  syncStats(teaserId);
}

export async function getUserReactions(userId: string, teaserId: string) {
  assertSeed("getUserReactions");
  return {
    liked: store.likes.some(
      (l) => l.user_id === userId && l.teaser_id === teaserId,
    ),
    saved: store.saves.some(
      (s) => s.user_id === userId && s.teaser_id === teaserId,
    ),
  };
}

// ------------------------------------------------------------------
//  Stats + ranking recompute
// ------------------------------------------------------------------
export function syncStats(teaserId: string) {
  const s = statOf(teaserId);
  const t = store.teasers.find((x) => x.id === teaserId);
  s.like_count = store.likes.filter((l) => l.teaser_id === teaserId).length;
  s.save_count = store.saves.filter((l) => l.teaser_id === teaserId).length;
  s.share_count = store.shares.filter((l) => l.teaser_id === teaserId).length;
  s.comment_count = store.comments.filter(
    (c) => c.teaser_id === teaserId && !c.is_hidden,
  ).length;
  s.view_start = store.viewEvents.filter(
    (v) => v.teaser_id === teaserId && v.event === "start",
  ).length;
  s.view_half = store.viewEvents.filter(
    (v) => v.teaser_id === teaserId && v.event === "half",
  ).length;
  s.view_complete = store.viewEvents.filter(
    (v) => v.teaser_id === teaserId && v.event === "complete",
  ).length;
  if (!store.stats.includes(s)) store.stats.push(s);
  if (t) {
    s.score = computeScore(
      { ...s, published_at: t.published_at },
      now(),
      store.rankingConfig,
    );
  }
  s.updated_at = new Date().toISOString();
}

/** Full recompute of score + rank for the active season (cron entrypoint). */
export async function recomputeRanking(opts: { rotatePrevRank?: boolean } = {}) {
  assertSeed("recomputeRanking");
  const season = await getActiveSeason();
  const published = store.teasers.filter(
    (t) => t.status === "published" && t.season_id === season.id,
  );
  for (const t of published) syncStats(t.id);
  const ranked = rankAll(
    published.map((t) => statOf(t.id)),
    (s) => s.score,
    (s) => s.like_count,
  );
  for (const r of ranked) {
    const s = r.item;
    const wasOutsideTop10 = !s.rank || s.rank > 10;
    if (opts.rotatePrevRank) s.prev_rank = s.rank || null;
    s.rank = r.rank;
    s.updated_at = new Date().toISOString();
    if (wasOutsideTop10 && r.rank <= 10) {
      const t = store.teasers.find((x) => x.id === s.teaser_id);
      if (t) pushNotification(t.creator_id, "rank_enter", { teaserId: t.id, rank: r.rank });
    }
  }
  return { season: season.id, ranked: ranked.length };
}

// ------------------------------------------------------------------
//  Profiles
// ------------------------------------------------------------------
export async function getProfile(userId: string): Promise<Profile | null> {
  assertSeed("getProfile");
  return store.profiles.find((p) => p.id === userId) ?? null;
}
export async function getProfileByNickname(nick: string): Promise<Profile | null> {
  assertSeed("getProfileByNickname");
  return store.profiles.find((p) => p.nickname === nick) ?? null;
}
export async function upsertProfile(userId: string, patch: Partial<Profile>) {
  assertSeed("upsertProfile");
  let p = store.profiles.find((x) => x.id === userId);
  if (!p) {
    p = {
      id: userId,
      nickname: patch.nickname ?? `user_${userId.slice(0, 6)}`,
      avatar_url: null,
      bio: null,
      role: "viewer",
      onboarded_at: null,
      creator_name: null,
      portfolio_url: null,
      creator_ai_tools: null,
      credit_balance: 0,
      created_at: new Date().toISOString(),
    };
    store.profiles.push(p);
  }
  Object.assign(p, patch);
  return p;
}

export async function getCreatorTeasers(creatorId: string) {
  assertSeed("getCreatorTeasers");
  return store.teasers
    .filter((t) => t.creator_id === creatorId)
    .sort(byNewest)
    .map((t) => ({
      teaser: t,
      stats: statOf(t.id),
      rejectionReason:
        store.reviews
          .filter((r) => r.teaser_id === t.id && r.decision === "reject")
          .sort(byNewest)[0]?.reason ?? null,
    }));
}

export async function getSavedTeasers(userId: string) {
  assertSeed("getSavedTeasers");
  const ids = new Set(
    store.saves.filter((s) => s.user_id === userId).map((s) => s.teaser_id),
  );
  return store.teasers.filter((t) => ids.has(t.id)).map(toCardVM);
}
export async function getLikedTeasers(userId: string) {
  assertSeed("getLikedTeasers");
  const ids = new Set(
    store.likes.filter((l) => l.user_id === userId).map((l) => l.teaser_id),
  );
  return store.teasers.filter((t) => ids.has(t.id)).map(toCardVM);
}
export async function getUserComments(userId: string) {
  assertSeed("getUserComments");
  return store.comments
    .filter((c) => c.user_id === userId && !c.is_hidden)
    .sort(byNewest)
    .map((c) => ({
      comment: c,
      teaser: store.teasers.find((t) => t.id === c.teaser_id) ?? null,
    }));
}

// ------------------------------------------------------------------
//  Reviewer
// ------------------------------------------------------------------
export async function getReviewQueue() {
  assertSeed("getReviewQueue");
  return store.teasers
    .filter((t) => t.status === "submitted" || t.status === "in_review" || t.status === "approved")
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((t) => ({
      teaser: t,
      creator: creatorOf(t.creator_id),
      reviews: store.reviews.filter((r) => r.teaser_id === t.id),
    }));
}

export async function decideReview(input: {
  teaserId: string;
  reviewerId: string;
  decision: "approve" | "reject" | "hold";
  reason?: string;
  scores?: { story?: number; visual?: number; polish?: number };
}) {
  assertSeed("decideReview");
  const t = store.teasers.find((x) => x.id === input.teaserId);
  if (!t) throw new Error("teaser not found");

  const existing = store.reviews.find(
    (r) => r.teaser_id === input.teaserId && r.reviewer_id === input.reviewerId,
  );
  const rec = {
    id: existing?.id ?? nextId("rv"),
    teaser_id: input.teaserId,
    reviewer_id: input.reviewerId,
    decision: input.decision,
    reason: input.reason ?? null,
    score_story: input.scores?.story ?? null,
    score_visual: input.scores?.visual ?? null,
    score_polish: input.scores?.polish ?? null,
    created_at: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, rec);
  else store.reviews.push(rec);

  const required = await getSettingInt("REVIEW_APPROVALS_REQUIRED", 2);
  const decisions = store.reviews.filter((r) => r.teaser_id === input.teaserId);
  const approvals = decisions.filter((r) => r.decision === "approve").length;
  const rejects = decisions.filter((r) => r.decision === "reject").length;

  if (rejects >= 1) {
    t.status = "rejected";
  } else if (approvals >= required) {
    t.status = "published";
    t.published_at = new Date().toISOString();
    pushNotification(t.creator_id, "review_approved", { teaserId: t.id });
    syncStats(t.id);
  } else {
    t.status = "in_review";
  }
  t.updated_at = new Date().toISOString();

  if (t.status === "rejected") {
    pushNotification(t.creator_id, "review_rejected", {
      teaserId: t.id,
      reason: input.reason ?? "",
    });
  }
  return { status: t.status, approvals, required };
}

// ------------------------------------------------------------------
//  Teaser submit (creator upload)
// ------------------------------------------------------------------
export async function submitTeaser(input: {
  creatorId: string;
  title: string;
  logline: string;
  synopsis: string;
  genres: Genre[];
  tags: string[];
  durationSec: number;
  aiTools: string[];
  credits: string;
  posterUrl: string;
  thumbnailUrl: string;
  playbackUrl: string;
  videoProvider: string;
  videoId: string;
}) {
  assertSeed("submitTeaser");
  const season = await getActiveSeason();
  const minD = await getSettingInt("TEASER_MIN_DURATION_SEC", 90);
  const maxD = await getSettingInt("TEASER_MAX_DURATION_SEC", 240);
  if (input.durationSec < minD || input.durationSec > maxD) {
    throw new Error(
      `영상 길이는 ${minD}~${maxD}초여야 합니다 (현재 ${input.durationSec}초).`,
    );
  }
  const base = slugify(input.title);
  let slug = base;
  let n = 2;
  while (store.teasers.some((t) => t.slug === slug)) slug = `${base}-${n++}`;

  const t: Teaser = {
    id: nextId("t"),
    slug,
    season_id: season.id,
    creator_id: input.creatorId,
    title: input.title,
    logline: input.logline,
    synopsis: input.synopsis,
    genres: input.genres,
    tags: input.tags,
    duration_sec: input.durationSec,
    video_provider: input.videoProvider,
    video_id: input.videoId,
    playback_url: input.playbackUrl,
    poster_url: input.posterUrl,
    thumbnail_url: input.thumbnailUrl,
    ai_tools: input.aiTools,
    credits: input.credits,
    status: "submitted",
    published_at: null,
    jimovie_review_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.teasers.push(t);
  store.stats.push({
    teaser_id: t.id,
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    save_count: 0,
    view_start: 0,
    view_half: 0,
    view_complete: 0,
    score: 0,
    rank: 0,
    prev_rank: null,
    updated_at: new Date().toISOString(),
  });
  return t;
}

// ------------------------------------------------------------------
//  Community
// ------------------------------------------------------------------
export async function listPosts(params: {
  category?: Post["category"] | "전체";
  sort?: "hot" | "new";
  cursor?: string | null;
  limit?: number;
}) {
  assertSeed("listPosts");
  const { category = "전체", sort = "hot", cursor, limit = 20 } = params;
  let rows = store.posts.filter((p) => !p.is_hidden);
  if (category !== "전체") rows = rows.filter((p) => p.category === category);
  rows = rows.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    if (sort === "new") return byNewest(a, b);
    const recency = (p: Post) =>
      Date.now() - Date.parse(p.created_at) < 24 * 3_600_000 ? 1 : 0;
    return (
      recency(b) - recency(a) ||
      b.like_count + b.comment_count - (a.like_count + a.comment_count)
    );
  });
  const start = cursor ? parseInt(cursor, 10) || 0 : 0;
  const page = rows.slice(start, start + limit).map((p) => ({
    post: p,
    author: creatorOf(p.author_id),
    attachedTeaser: p.attached_teaser_id
      ? toCardVM(store.teasers.find((t) => t.id === p.attached_teaser_id)!)
      : null,
  }));
  return {
    items: page,
    nextCursor: start + limit < rows.length ? String(start + limit) : null,
  };
}
export async function getPost(id: string) {
  assertSeed("getPost");
  const p = store.posts.find((x) => x.id === id);
  if (!p) return null;
  return {
    post: p,
    author: creatorOf(p.author_id),
    attachedTeaser: p.attached_teaser_id
      ? toCardVM(store.teasers.find((t) => t.id === p.attached_teaser_id)!)
      : null,
    comments: store.postComments
      .filter((c) => c.post_id === id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => ({ comment: c, author: creatorOf(c.user_id) })),
  };
}
export async function createPost(input: {
  authorId: string;
  category: Post["category"];
  title: string;
  bodyMd: string;
  images?: string[];
  attachedTeaserId?: string | null;
}) {
  assertSeed("createPost");
  const p: Post = {
    id: nextId("p"),
    author_id: input.authorId,
    category: input.category,
    title: input.title,
    body_md: input.bodyMd,
    images: input.images ?? [],
    attached_teaser_id: input.attachedTeaserId ?? null,
    like_count: 0,
    comment_count: 0,
    is_pinned: false,
    is_hidden: false,
    created_at: new Date().toISOString(),
  };
  store.posts.unshift(p);
  return p;
}
export async function togglePostLike(postId: string, userId: string) {
  assertSeed("togglePostLike");
  const i = store.postLikes.findIndex(
    (l) => l.post_id === postId && l.user_id === userId,
  );
  const p = store.posts.find((x) => x.id === postId);
  if (!p) throw new Error("post not found");
  if (i >= 0) {
    store.postLikes.splice(i, 1);
    p.like_count = Math.max(0, p.like_count - 1);
    return { liked: false, count: p.like_count };
  }
  store.postLikes.push({ post_id: postId, user_id: userId });
  p.like_count += 1;
  return { liked: true, count: p.like_count };
}
export async function addPostComment(input: {
  postId: string;
  userId: string;
  body: string;
  parentId?: string | null;
}) {
  assertSeed("addPostComment");
  const c: PostCommentRow = {
    id: nextId("pc"),
    post_id: input.postId,
    user_id: input.userId,
    parent_id: input.parentId ?? null,
    body: input.body.trim(),
    created_at: new Date().toISOString(),
  };
  store.postComments.push(c);
  const p = store.posts.find((x) => x.id === input.postId);
  if (p) p.comment_count += 1;
  return c;
}
type PostCommentRow = import("@/lib/types").PostComment;

// ------------------------------------------------------------------
//  Reports
// ------------------------------------------------------------------
export async function createReport(input: {
  reporterId: string;
  targetType: "teaser" | "comment" | "post" | "post_comment";
  targetId: string;
  reason: string;
}) {
  assertSeed("createReport");
  pushNotification(store.profiles.find((p) => p.role === "admin")!.id, "funding", {
    kind: "report",
    ...input,
  });
  return { ok: true };
}

// ------------------------------------------------------------------
//  Funding
// ------------------------------------------------------------------
export async function listFundingCampaigns(status?: FundingCampaign["status"]) {
  assertSeed("listFundingCampaigns");
  return store.campaigns
    .filter((c) => !status || c.status === status)
    .map((c) => ({
      campaign: c,
      teaser: toCardVM(store.teasers.find((t) => t.id === c.teaser_id)!),
      pledgeCount: store.pledges.filter((p) => p.campaign_id === c.id).length,
    }));
}
export async function getCampaign(id: string) {
  assertSeed("getCampaign");
  const c = store.campaigns.find((x) => x.id === id);
  if (!c) return null;
  return {
    campaign: c,
    teaser: toCardVM(store.teasers.find((t) => t.id === c.teaser_id)!),
    pledges: store.pledges.filter((p) => p.campaign_id === c.id),
    revenue: store.revenueEntries.filter((r) => r.teaser_id === c.teaser_id),
    payouts: store.payouts.filter((p) => p.campaign_id === c.id),
  };
}
export async function createPledge(input: {
  campaignId: string;
  userId: string;
  amountKrw: number;
}) {
  assertSeed("createPledge");
  const min = await getSettingInt("FUNDING_MIN_PLEDGE_KRW", 10000);
  if (input.amountKrw < min)
    throw new Error(`최소 ${min.toLocaleString()}원부터 참여할 수 있습니다.`);
  const c = store.campaigns.find((x) => x.id === input.campaignId);
  if (!c || c.status !== "open") throw new Error("진행 중인 캠페인이 아닙니다.");
  const pledge = {
    id: nextId("fp"),
    campaign_id: input.campaignId,
    user_id: input.userId,
    amount_krw: input.amountKrw,
    payment_ref: null,
    status: "pending" as const,
    created_at: new Date().toISOString(),
  };
  store.pledges.push(pledge);
  c.raised_krw += input.amountKrw; // MVP: reflected immediately, admin confirms deposit
  pushNotification(input.userId, "funding", {
    kind: "pledge_created",
    campaignId: c.id,
  });
  return pledge;
}
export async function getUserPledges(userId: string) {
  assertSeed("getUserPledges");
  return store.pledges
    .filter((p) => p.user_id === userId)
    .map((p) => {
      const c = store.campaigns.find((x) => x.id === p.campaign_id)!;
      const payout = store.payouts.find(
        (x) => x.campaign_id === c.id && x.user_id === userId,
      );
      return {
        pledge: p,
        campaign: c,
        teaser: store.teasers.find((t) => t.id === c.teaser_id) ?? null,
        payout: payout ?? null,
      };
    });
}

// ------------------------------------------------------------------
//  Admin: revenue / payouts
// ------------------------------------------------------------------
export async function addRevenueEntry(input: {
  teaserId: string;
  source: string;
  amountKrw: number;
  memo?: string;
}) {
  assertSeed("addRevenueEntry");
  const e = {
    id: nextId("re"),
    teaser_id: input.teaserId,
    source: input.source,
    amount_krw: input.amountKrw,
    occurred_at: new Date().toISOString(),
    memo: input.memo ?? "",
  };
  store.revenueEntries.push(e);
  return e;
}
/** Split `sharePct` of net revenue across confirmed pledges, pro-rata. */
export async function generatePayouts(campaignId: string, sharePct: number) {
  assertSeed("generatePayouts");
  const c = store.campaigns.find((x) => x.id === campaignId);
  if (!c) throw new Error("campaign not found");
  const totalRevenue = store.revenueEntries
    .filter((r) => r.teaser_id === c.teaser_id)
    .reduce((s, r) => s + r.amount_krw, 0);
  const pool = Math.floor((totalRevenue * sharePct) / 100);
  const confirmed = store.pledges.filter(
    (p) => p.campaign_id === campaignId && p.status !== "refunded",
  );
  const totalPledged = confirmed.reduce((s, p) => s + p.amount_krw, 0) || 1;
  store.payouts = store.payouts.filter((p) => p.campaign_id !== campaignId);
  for (const p of confirmed) {
    store.payouts.push({
      id: nextId("po"),
      campaign_id: campaignId,
      user_id: p.user_id,
      amount_krw: Math.floor((pool * p.amount_krw) / totalPledged),
      status: "pending",
      paid_at: null,
    });
  }
  return { pool, count: confirmed.length };
}
export async function markPayoutPaid(payoutId: string) {
  assertSeed("markPayoutPaid");
  const p = store.payouts.find((x) => x.id === payoutId);
  if (p) {
    p.status = "paid";
    p.paid_at = new Date().toISOString();
  }
  return p;
}

// ------------------------------------------------------------------
//  Admin: seasons / users / dashboard
// ------------------------------------------------------------------
export async function listAllTeasersAdmin() {
  assertSeed("listAllTeasersAdmin");
  return store.teasers
    .sort(byNewest)
    .map((t) => ({ teaser: t, stats: statOf(t.id), creator: creatorOf(t.creator_id) }));
}
export async function updateTeaserAdmin(id: string, patch: Partial<Teaser>) {
  assertSeed("updateTeaserAdmin");
  const t = store.teasers.find((x) => x.id === id);
  if (!t) throw new Error("not found");
  Object.assign(t, patch, { updated_at: new Date().toISOString() });
  return t;
}
export async function listSeasons() {
  assertSeed("listSeasons");
  return [...store.seasons].sort((a, b) => b.starts_at.localeCompare(a.starts_at));
}
export async function listUsersAdmin() {
  assertSeed("listUsersAdmin");
  return [...store.profiles].sort((a, b) => a.created_at.localeCompare(b.created_at));
}
export async function setUserRole(userId: string, role: Profile["role"]) {
  assertSeed("setUserRole");
  const p = store.profiles.find((x) => x.id === userId);
  if (p) p.role = role;
  return p;
}
export async function getAdminDashboard() {
  assertSeed("getAdminDashboard");
  return {
    users: store.profiles.length,
    creators: store.profiles.filter((p) => p.role === "creator").length,
    uploads: store.teasers.length,
    published: store.teasers.filter((t) => t.status === "published").length,
    submitted: store.teasers.filter(
      (t) => t.status === "submitted" || t.status === "in_review",
    ).length,
    rejected: store.teasers.filter((t) => t.status === "rejected").length,
    totalLikes: store.likes.length,
    totalShares: store.shares.length,
    totalComments: store.comments.length,
    fundingRaised: store.campaigns.reduce((s, c) => s + c.raised_krw, 0),
  };
}

// ------------------------------------------------------------------
//  Notifications
// ------------------------------------------------------------------
export function pushNotification(
  userId: string,
  type: import("@/lib/types").AppNotification["type"],
  payload: Record<string, unknown>,
) {
  store.notifications.unshift({
    id: nextId("n"),
    user_id: userId,
    type,
    payload,
    read_at: null,
    created_at: new Date().toISOString(),
  });
}
export async function getNotifications(userId: string) {
  assertSeed("getNotifications");
  return store.notifications.filter((n) => n.user_id === userId);
}
export async function markNotificationsRead(userId: string) {
  assertSeed("markNotificationsRead");
  const t = new Date().toISOString();
  store.notifications
    .filter((n) => n.user_id === userId && !n.read_at)
    .forEach((n) => (n.read_at = t));
}

// ------------------------------------------------------------------
//  Collections (curation)
// ------------------------------------------------------------------
export async function listCollections() {
  assertSeed("listCollections");
  return store.collections.map((c) => ({
    ...c,
    items: c.teaser_ids
      .map((id) => store.teasers.find((t) => t.id === id))
      .filter((t): t is Teaser => !!t && t.status === "published")
      .map(toCardVM),
  }));
}

function slugify(s: string): string {
  return (
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^가-힣a-z0-9-]/g, "") || "teaser"
  );
}

/** Seed profiles offered as one-tap logins in mock mode. */
export async function getMockLoginProfiles() {
  const order: Record<string, number> = { admin: 0, reviewer: 1, creator: 2, viewer: 3 };
  return [...store.profiles]
    .sort((a, b) => order[a.role] - order[b.role])
    .map((p) => ({
      id: p.id,
      nickname: p.nickname,
      role: p.role,
      avatar_url: p.avatar_url,
      onboarded: !!p.onboarded_at,
    }));
}

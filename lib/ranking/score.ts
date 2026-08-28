/**
 * Ranking algorithm — pure functions only. No IO, no Date.now() reads
 * (callers pass `now`). Weights come from ranking_config; defaults here
 * match the spec (CONPICKS_개발지시서.md §4).
 */

export interface RankingWeights {
  w_like: number;
  w_comment: number;
  w_share: number;
  w_save: number;
  w_complete: number;
  w_half: number;
  half_life_hours: number;
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  w_share: 10,
  w_save: 6,
  w_like: 3,
  w_comment: 4,
  w_complete: 2,
  w_half: 0.5,
  half_life_hours: 72,
};

export interface ScoreInput {
  like_count: number;
  comment_count: number;
  share_count: number;
  save_count: number;
  view_complete: number;
  view_half: number;
  published_at: string | Date | null;
}

/** raw = Σ weightᵢ · metricᵢ */
export function rawScore(input: ScoreInput, w: RankingWeights): number {
  return (
    w.w_share * input.share_count +
    w.w_save * input.save_count +
    w.w_like * input.like_count +
    w.w_comment * input.comment_count +
    w.w_complete * input.view_complete +
    w.w_half * input.view_half
  );
}

/** decay = 0.5 ^ (hoursSincePublished / halfLife), clamped to [0,1] */
export function timeDecay(
  publishedAt: string | Date | null,
  now: Date,
  halfLifeHours: number,
): number {
  if (!publishedAt) return 1;
  const published = new Date(publishedAt);
  const hours = (now.getTime() - published.getTime()) / 3_600_000;
  if (hours <= 0) return 1;
  if (halfLifeHours <= 0) return 0;
  return Math.pow(0.5, hours / halfLifeHours);
}

/**
 * score = raw · (0.4 + 0.6·decay)
 * Fresh work is boosted, but the floor never drops below 40% of raw.
 */
export function computeScore(
  input: ScoreInput,
  now: Date,
  weights: RankingWeights = DEFAULT_WEIGHTS,
): number {
  const raw = rawScore(input, weights);
  const decay = timeDecay(input.published_at, now, weights.half_life_hours);
  return raw * (0.4 + 0.6 * decay);
}

export interface Ranked<T> {
  item: T;
  score: number;
  rank: number;
}

/**
 * Rank a list by score, descending. Ties break by the provided
 * `tiebreak` (higher wins) then by a stable index so the result is
 * deterministic. Ranks are 1-based and dense (1,2,3,…).
 */
export function rankAll<T>(
  items: T[],
  score: (t: T) => number,
  tiebreak: (t: T) => number = () => 0,
): Ranked<T>[] {
  return items
    .map((item, i) => ({ item, score: score(item), _i: i }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        tiebreak(b.item) - tiebreak(a.item) ||
        a._i - b._i,
    )
    .map(({ item, score }, idx) => ({ item, score, rank: idx + 1 }));
}

/**
 * Spam / abuse dampening multiplier applied to a single reaction event
 * before it is counted (spec §4).
 *  - brand-new accounts (< 24h) count at 0.5×
 *  - shares beyond 3 per user per day count at 0×
 */
export function reactionWeight(opts: {
  accountAgeHours: number;
  kind: "like" | "save" | "comment" | "share" | "view";
  userShareCountToday?: number;
}): number {
  let w = 1;
  if (opts.accountAgeHours < 24) w *= 0.5;
  if (opts.kind === "share" && (opts.userShareCountToday ?? 0) >= 3) w = 0;
  return w;
}

/** prev_rank - rank ; positive = climbed, negative = fell, null = NEW */
export function rankDelta(rank: number, prevRank: number | null): number | null {
  if (prevRank == null) return null;
  return prevRank - rank;
}

/**
 * Deterministic in-memory seed dataset.
 *
 * Drives the whole app when NEXT_PUBLIC_USE_SUPABASE=false and is also
 * the source rendered into supabase/seed/seed.sql. Every value is
 * derived from a fixed PRNG seed so builds / screenshots are stable.
 */
import {
  DEFAULT_WEIGHTS,
  computeScore,
  rankAll,
  rankDelta,
} from "@/lib/ranking/score";
import type {
  AppSetting,
  Comment,
  FundingCampaign,
  FundingPledge,
  Genre,
  Payout,
  Post,
  Profile,
  RankingConfig,
  RevenueEntry,
  Review,
  Season,
  Teaser,
  TeaserStats,
} from "@/lib/types";
import { GENRES } from "@/lib/types";

/** Fixed "now" for the seed world so decay / ranking are reproducible. */
export const SEED_NOW = new Date("2026-08-28T09:00:00.000Z");

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260828);
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const int = (min: number, max: number) =>
  Math.floor(rnd() * (max - min + 1)) + min;
const hoursAgo = (h: number) =>
  new Date(SEED_NOW.getTime() - h * 3_600_000).toISOString();

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
const poster = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/900`;
const thumb = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/960/540`;

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

const AI_TOOLS = ["Sora", "Runway Gen-3", "Kling", "Luma", "Midjourney", "Pika", "Veo"];

// ------------------------------------------------------------------
//  Profiles
// ------------------------------------------------------------------
const NICKS = [
  "달빛서랍",
  "novaframe",
  "김레이",
  "pixelmoth",
  "정하늬",
  "cutdeep",
  "오로라킴",
  "renderghost",
  "한지우",
  "midnight_reel",
  "지무비",
  "MCN_리원",
];

export const seedProfiles: Profile[] = NICKS.map((nickname, i) => {
  const role =
    i === 10
      ? "admin"
      : i === 11
        ? "reviewer"
        : i < 6
          ? "creator"
          : "viewer";
  return {
    id: `u_${String(i + 1).padStart(2, "0")}`,
    nickname,
    avatar_url: avatar(nickname),
    bio:
      role === "creator"
        ? "AI로 이야기를 만듭니다."
        : role === "reviewer"
          ? "지무비 / MCN 심사위원"
          : role === "admin"
            ? "CONPICKS 운영팀"
            : null,
    role,
    onboarded_at: hoursAgo(24 * (30 - i)),
    creator_name: role === "creator" ? `${nickname} studio` : null,
    portfolio_url: role === "creator" ? "https://example.com/portfolio" : null,
    creator_ai_tools: role === "creator" ? [pick(AI_TOOLS), pick(AI_TOOLS)] : null,
    credit_balance: role === "viewer" ? int(0, 80000) : 0,
    created_at: hoursAgo(24 * (30 - i)),
  };
});

const creators = seedProfiles.filter((p) => p.role === "creator");
export const seedReviewer = seedProfiles.find((p) => p.role === "reviewer")!;
export const seedAdmin = seedProfiles.find((p) => p.role === "admin")!;

// ------------------------------------------------------------------
//  Season
// ------------------------------------------------------------------
export const seedSeasons: Season[] = [
  {
    id: "s_01",
    name: "시즌 1 — 첫 번째 상영관",
    starts_at: hoursAgo(24 * 40),
    ends_at: new Date(SEED_NOW.getTime() + 24 * 20 * 3_600_000).toISOString(),
    prize_krw: 30_000_000,
    rules_md:
      "## 시즌 1 규정\n- 2~3분 AI 티저\n- 1차 심사 통과작만 공개\n- 좋아요·댓글·공유·저장·완주로 랭킹 산정\n- 시즌 종료 시 1위에게 상금 + 제작지원",
    status: "active",
    winner_teaser_id: null,
  },
];

// ------------------------------------------------------------------
//  Teasers  (24)
// ------------------------------------------------------------------
const TITLES: [string, string, Genre[]][] = [
  ["마지막 정거장", "지구를 떠난 마지막 열차, 그 안의 낯선 승객.", ["SF", "스릴러"]],
  ["의뢰인", "완벽한 알리바이를 파는 남자에게 걸려온 전화.", ["스릴러"]],
  ["여름의 잔상", "헤어진 그날로 계속 돌아오는 8월.", ["로맨스", "판타지"]],
  ["문 너머의 정원", "매일 밤 자라나는 문, 그 안엔 죽은 자들의 정원.", ["판타지", "공포"]],
  ["13번째 관객", "빈 극장에 늘 앉아 있는 누군가.", ["공포"]],
  ["아버지의 언어", "치매에 걸린 아버지가 갑자기 쓰는 낯선 말.", ["드라마"]],
  ["로봇이 꾼 꿈", "폐기 전날, 안드로이드가 처음으로 꿈을 꾼다.", ["SF", "애니메이션"]],
  ["소각로 도시", "쓰레기를 태워 빛을 만드는 도시의 비밀.", ["SF", "다큐"]],
  ["연애 시뮬레이터 v9", "AI 연인이 이별을 거부하기 시작했다.", ["로맨스", "SF"]],
  ["붉은 방", "온라인에 떠도는 그 영상을 끝까지 본 사람들.", ["공포", "스릴러"]],
  ["할머니의 냉장고", "열 때마다 다른 계절이 들어 있는 냉장고.", ["판타지", "드라마"]],
  ["궤도 이탈", "우주 정거장에 홀로 남은 정비공의 72시간.", ["SF", "스릴러"]],
  ["춤추는 그림자", "가로등 아래에서만 살아나는 그림자 극단.", ["판타지", "애니메이션"]],
  ["소음", "옆집에서 나는 소리가 내 목소리와 똑같다.", ["공포"]],
  ["재회 알고리즘", "죽은 연인을 복원해 주는 스타트업의 첫 고객.", ["로맨스", "SF"]],
  ["백야 다이어리", "해가 지지 않는 도시에서 잠들지 못하는 형사.", ["스릴러", "드라마"]],
  ["종이 비행기 부대", "전쟁을 멈추려는 아이들의 비밀 편대.", ["애니메이션", "드라마"]],
  ["심해 우편함", "6천 미터 아래로 편지를 보내는 우체국.", ["판타지", "다큐"]],
  ["복제된 오후", "같은 오후를 100번 사는 카페 알바생.", ["SF", "로맨스"]],
  ["가면 무도회 살인", "얼굴을 바꿔주는 가면이 등장한 파티.", ["스릴러", "판타지"]],
  ["엄마의 유튜브", "돌아가신 엄마 채널에 새 영상이 올라왔다.", ["공포", "드라마"]],
  ["화성 세탁소", "화성 이주민의 옷을 대신 빨아주는 노부부.", ["드라마", "SF"]],
  ["춘몽", "조선의 화공이 그린 그림 속으로 걸어 들어가다.", ["판타지", "로맨스"]],
  ["라스트 테이크", "AI 배우가 감독을 협박하며 시작된 촬영.", ["스릴러", "SF"]],
];

const STATUS_PLAN: Teaser["status"][] = [
  ...Array(19).fill("published"),
  "in_review",
  "in_review",
  "submitted",
  "rejected",
  "approved",
];

export const seedTeasers: Teaser[] = TITLES.map(([title, logline, genres], i) => {
  const status = STATUS_PLAN[i];
  const creator = creators[i % creators.length];
  const publishedHoursAgo = int(2, 24 * 30);
  const isPublished = status === "published";
  return {
    id: `t_${String(i + 1).padStart(2, "0")}`,
    slug: `${slugify(title)}-${i + 1}`,
    season_id: "s_01",
    creator_id: creator.id,
    title,
    logline,
    synopsis: `${logline}\n\n${title}은(는) AI 파이프라인만으로 완성한 2~3분 분량의 티저입니다. 실제 장편화를 전제로 세계관과 톤을 압축해 보여줍니다.`,
    genres,
    tags: [genres[0], "AI단편", pick(AI_TOOLS), "시즌1", "콘픽스"].slice(0, 5),
    duration_sec: int(95, 235),
    video_provider: "mock",
    video_id: `sample_${i % SAMPLE_VIDEOS.length}`,
    playback_url: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
    poster_url: poster(`${title}-poster`),
    thumbnail_url: thumb(`${title}-thumb`),
    ai_tools: [pick(AI_TOOLS), pick(AI_TOOLS)],
    credits: `연출·편집 ${creator.nickname} · 음악 Suno`,
    status,
    published_at: isPublished ? hoursAgo(publishedHoursAgo) : null,
    jimovie_review_url:
      isPublished && i < 4 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
    created_at: hoursAgo(publishedHoursAgo + 48),
    updated_at: hoursAgo(publishedHoursAgo),
  };
});

function slugify(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^가-힣a-zA-Z0-9-]/g, "");
}

// ------------------------------------------------------------------
//  Reactions + stats
// ------------------------------------------------------------------
export const seedLikes: { user_id: string; teaser_id: string; created_at: string }[] = [];
export const seedSaves: { user_id: string; teaser_id: string; created_at: string }[] = [];
export const seedShares: {
  id: string;
  user_id: string | null;
  teaser_id: string;
  channel: string;
  created_at: string;
}[] = [];
export const seedComments: Comment[] = [];
export const seedViewEvents: {
  id: string;
  user_id: string | null;
  session_id: string;
  teaser_id: string;
  event: "start" | "half" | "complete";
  created_at: string;
}[] = [];

const COMMENT_BODIES = [
  "이걸 진짜 AI로 만들었다고?",
  "톤 미쳤다… 장편 나오면 무조건 본다",
  "3분이 너무 짧게 느껴짐",
  "음악이 다 했다",
  "중반부 편집 리듬 좋네요",
  "포스터부터 극장 걸릴 각",
  "세계관 더 보고 싶다",
  "이 감독 다음 작품 기다림",
];

let commentSeq = 0;
let shareSeq = 0;
let viewSeq = 0;

for (const t of seedTeasers) {
  const popularity = rnd(); // 0..1 base popularity for this teaser
  const base = t.status === "published" ? 1 : 0.15;
  const nLikes = Math.round(base * popularity * 900 + int(0, 40));
  const nSaves = Math.round(nLikes * (0.3 + rnd() * 0.3));
  const nShares = Math.round(nLikes * (0.05 + rnd() * 0.15));
  const nComments = Math.round(nLikes * (0.04 + rnd() * 0.08));
  const nStart = Math.round(nLikes * (2 + rnd() * 3));
  const nHalf = Math.round(nStart * (0.55 + rnd() * 0.2));
  const nComplete = Math.round(nHalf * (0.45 + rnd() * 0.25));

  // A handful of real join rows for the first users (enough for "my/liked" etc.)
  seedProfiles.slice(0, 10).forEach((u, idx) => {
    if (idx / 10 < popularity && u.id !== t.creator_id) {
      seedLikes.push({ user_id: u.id, teaser_id: t.id, created_at: hoursAgo(int(1, 200)) });
      if (rnd() < 0.5)
        seedSaves.push({ user_id: u.id, teaser_id: t.id, created_at: hoursAgo(int(1, 200)) });
    }
  });

  for (let c = 0; c < Math.min(nComments, 6); c++) {
    const u = pick(seedProfiles.slice(0, 10));
    if (u.id === t.creator_id) continue;
    seedComments.push({
      id: `c_${String(++commentSeq).padStart(4, "0")}`,
      teaser_id: t.id,
      user_id: u.id,
      parent_id: null,
      body: pick(COMMENT_BODIES),
      like_count: int(0, 25),
      is_hidden: false,
      created_at: hoursAgo(int(1, 240)),
    });
  }
  for (let s = 0; s < Math.min(nShares, 3); s++) {
    seedShares.push({
      id: `sh_${String(++shareSeq).padStart(4, "0")}`,
      user_id: pick(seedProfiles).id,
      teaser_id: t.id,
      channel: pick(["kakao", "link", "x", "instagram"]),
      created_at: hoursAgo(int(1, 200)),
    });
  }
  seedViewEvents.push({
    id: `v_${String(++viewSeq).padStart(5, "0")}`,
    user_id: null,
    session_id: "seed",
    teaser_id: t.id,
    event: "start",
    created_at: hoursAgo(int(1, 100)),
  });

  // stash aggregate targets on the teaser object for stats build below
  (t as unknown as Record<string, number>).__nLikes = nLikes;
  (t as unknown as Record<string, number>).__nSaves = nSaves;
  (t as unknown as Record<string, number>).__nShares = nShares;
  (t as unknown as Record<string, number>).__nComments = nComments;
  (t as unknown as Record<string, number>).__nStart = nStart;
  (t as unknown as Record<string, number>).__nHalf = nHalf;
  (t as unknown as Record<string, number>).__nComplete = nComplete;
}

export const seedRankingConfig: RankingConfig = {
  id: "rc_01",
  season_id: "s_01",
  ...DEFAULT_WEIGHTS,
  updated_by: seedAdmin.id,
  updated_at: hoursAgo(48),
};

function statFor(t: Teaser): TeaserStats {
  const g = t as unknown as Record<string, number>;
  const like_count = g.__nLikes ?? 0;
  const comment_count = g.__nComments ?? 0;
  const share_count = g.__nShares ?? 0;
  const save_count = g.__nSaves ?? 0;
  const view_start = g.__nStart ?? 0;
  const view_half = g.__nHalf ?? 0;
  const view_complete = g.__nComplete ?? 0;
  const score = computeScore(
    {
      like_count,
      comment_count,
      share_count,
      save_count,
      view_complete,
      view_half,
      published_at: t.published_at,
    },
    SEED_NOW,
    DEFAULT_WEIGHTS,
  );
  return {
    teaser_id: t.id,
    like_count,
    comment_count,
    share_count,
    save_count,
    view_start,
    view_half,
    view_complete,
    score,
    rank: 0,
    prev_rank: null,
    updated_at: SEED_NOW.toISOString(),
  };
}

const publishedTeasers = seedTeasers.filter((t) => t.status === "published");
const rankedPublished = rankAll(
  publishedTeasers.map(statFor),
  (s) => s.score,
  (s) => s.like_count,
);

export const seedTeaserStats: TeaserStats[] = seedTeasers.map((t) => {
  const s = statFor(t);
  const r = rankedPublished.find((x) => x.item.teaser_id === t.id);
  if (r) {
    s.rank = r.rank;
    // fabricate a plausible previous rank so arrows / NEW show up
    const jitter = int(-3, 3);
    s.prev_rank =
      r.rank <= 3 && rnd() < 0.3 ? null : Math.max(1, r.rank + jitter);
  }
  return s;
});

export function seedRankDelta(teaserId: string): number | null {
  const s = seedTeaserStats.find((x) => x.teaser_id === teaserId);
  if (!s) return null;
  return rankDelta(s.rank, s.prev_rank);
}

// ------------------------------------------------------------------
//  Reviews (for the two in_review + rejected + approved teasers)
// ------------------------------------------------------------------
export const seedReviews: Review[] = [
  {
    id: "rv_01",
    teaser_id: "t_24", // 라스트 테이크 — approved (1 approval so far, needs 2)
    reviewer_id: seedReviewer.id,
    decision: "approve",
    reason: null,
    score_story: 4,
    score_visual: 5,
    score_polish: 4,
    created_at: hoursAgo(12),
  },
  {
    id: "rv_02",
    teaser_id: "t_23", // 춘몽 — rejected
    reviewer_id: seedReviewer.id,
    decision: "reject",
    reason: "저작권 확인 필요 — 배경음악 라이선스 증빙을 첨부해 재제출 바랍니다.",
    score_story: 3,
    score_visual: 3,
    score_polish: 2,
    created_at: hoursAgo(30),
  },
];

// ------------------------------------------------------------------
//  Community posts
// ------------------------------------------------------------------
export const seedPosts: Post[] = [
  {
    id: "p_01",
    author_id: seedAdmin.id,
    category: "공지",
    title: "시즌 1 오픈 — 우승 상금 3,000만원 + 장편 제작지원",
    body_md:
      "CONPICKS 시즌 1이 시작됐습니다. 좋아요·공유·저장·완주가 곧 흥행 신호입니다.\n\n마음에 드는 티저를 친구에게 공유해 주세요.",
    images: [],
    attached_teaser_id: null,
    like_count: 210,
    comment_count: 18,
    is_pinned: true,
    is_hidden: false,
    created_at: hoursAgo(24 * 20),
  },
  {
    id: "p_02",
    author_id: creators[0].id,
    category: "크리에이터 라운지",
    title: "'마지막 정거장' 제작기 — 열차 내부는 어떻게 만들었나",
    body_md:
      "레퍼런스 → 콘티 → 샷 생성 → 리타이밍 순서로 작업했습니다. 질문 환영!",
    images: [thumb("making-of-1")],
    attached_teaser_id: "t_01",
    like_count: 96,
    comment_count: 12,
    is_pinned: false,
    is_hidden: false,
    created_at: hoursAgo(72),
  },
  {
    id: "p_03",
    author_id: seedProfiles[6].id,
    category: "작품 토론",
    title: "너 이거 봤어? '13번째 관객' 결말 해석 좀",
    body_md: "마지막 컷의 빈 좌석… 관객이 곧 우리라는 뜻인가?",
    images: [],
    attached_teaser_id: "t_05",
    like_count: 143,
    comment_count: 27,
    is_pinned: false,
    is_hidden: false,
    created_at: hoursAgo(30),
  },
  {
    id: "p_04",
    author_id: creators[2].id,
    category: "AI 제작 팁",
    title: "일관된 캐릭터 얼굴 유지하는 워크플로 정리",
    body_md: "레퍼런스 시트 + 로라 + 후반 페이스 스왑. 표는 본문 참고.",
    images: [],
    attached_teaser_id: null,
    like_count: 175,
    comment_count: 21,
    is_pinned: false,
    is_hidden: false,
    created_at: hoursAgo(50),
  },
];

// ------------------------------------------------------------------
//  Funding (revenue-share campaign on the current #1, in draft)
// ------------------------------------------------------------------
const topTeaserId =
  seedTeaserStats.find((s) => s.rank === 1)?.teaser_id ?? "t_01";

export const seedFundingCampaigns: FundingCampaign[] = [
  {
    id: "fc_01",
    teaser_id: topTeaserId,
    type: "revenue_share",
    goal_krw: 20_000_000,
    raised_krw: 8_450_000,
    starts_at: hoursAgo(24 * 6),
    ends_at: new Date(SEED_NOW.getTime() + 24 * 8 * 3_600_000).toISOString(),
    status: "open",
    terms_md:
      "리워드형이 아닌 **수익배분형** 캠페인입니다. 참여자는 지분·IP 권리가 없으며, 발생 순수익의 20%를 참여금 비례로 분배합니다. (자본시장법 검토 대상 — 운영 메모 참조)",
  },
];

export const seedFundingPledges: FundingPledge[] = seedProfiles
  .filter((p) => p.role === "viewer")
  .slice(0, 4)
  .map((p, i) => ({
    id: `fp_${String(i + 1).padStart(2, "0")}`,
    campaign_id: "fc_01",
    user_id: p.id,
    amount_krw: [10000, 20000, 50000, 20000][i],
    payment_ref: null,
    status: i === 3 ? "pending" : "confirmed",
    created_at: hoursAgo(int(4, 120)),
  }));

export const seedRevenueEntries: RevenueEntry[] = [
  {
    id: "re_01",
    teaser_id: topTeaserId,
    source: "숏폼 광고 수익 (7월)",
    amount_krw: 1_250_000,
    occurred_at: hoursAgo(24 * 30),
    memo: "정산 대기",
  },
];

export const seedPayouts: Payout[] = [];

// ------------------------------------------------------------------
//  app_settings — nothing hard-coded lives outside this table
// ------------------------------------------------------------------
export const seedAppSettings: AppSetting[] = [
  { key: "REVIEW_APPROVALS_REQUIRED", value: "2", description: "1차 심사 자동 공개에 필요한 승인 인원" },
  { key: "TEASER_MIN_DURATION_SEC", value: "90", description: "업로드 최소 길이(초)" },
  { key: "TEASER_MAX_DURATION_SEC", value: "240", description: "업로드 최대 길이(초)" },
  { key: "TEASER_MAX_UPLOAD_MB", value: "500", description: "업로드 최대 용량(MB)" },
  { key: "FUNDING_MIN_PLEDGE_KRW", value: "10000", description: "펀딩 최소 참여 금액" },
  { key: "NEW_ROW_WINDOW_HOURS", value: "72", description: "'새로 올라온 작품' 노출 기간" },
  { key: "RANKING_RECOMPUTE_MINUTES", value: "5", description: "랭킹 재계산 주기" },
  { key: "HOME_GENRE_ORDER", value: JSON.stringify(GENRES), description: "홈 장르 로우 순서" },
];

export const seedCollections = [
  {
    id: "col_01",
    title: "지무비 PICK",
    teaser_ids: publishedTeasers.slice(0, 6).map((t) => t.id),
  },
  {
    id: "col_02",
    title: "숨은 명작",
    teaser_ids: publishedTeasers.slice(6, 12).map((t) => t.id),
  },
];

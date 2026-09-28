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
/** [title, logline, genres, coverFile] — cover lives in /public/covers.
 *  Portrait covers (poster-N) fill 2:3 natively; landscape covers (thumb-N)
 *  fill 16:9 natively. The other orientation is object-cover cropped. */
const TITLES: [string, string, Genre[], string][] = [
  // --- 공개작 (t_01 ~ t_19) ---
  ["재회 알고리즘", "죽은 연인을 손바닥만 한 큐브에 복원해 주는 스타트업, 그 첫 고객.", ["SF", "로맨스"], "thumb-7"],
  ["디지즈 X", "탈출이 시작되는 순간, 인류의 시간은 끝난다.", ["스릴러", "공포"], "thumb-4"],
  ["달이 정한 연(緣)", "달이 짝지어 준 두 사람, 그러나 서로의 이름을 부르면 사라진다.", ["로맨스", "판타지"], "thumb-6"],
  ["더 글리치", "폐기 전날 밤, 안드로이드가 처음으로 꿈을 꾼다.", ["SF", "애니메이션"], "poster-11"],
  ["빛의 정원", "물 위로 열리는 문, 그 너머엔 빛으로 자란 정원이 있다.", ["판타지", "드라마"], "thumb-3"],
  ["무명(無名)", "울주의 등잔불을 지킨, 이름 없는 사람들의 기록.", ["드라마", "다큐"], "poster-5"],
  ["한복 입은 남자", "장영실, 별을 접어 다빈치를 만나러 간다.", ["판타지", "SF"], "poster-10"],
  ["선과 악", "선을 저울질하던 천사에게 처음으로 감정이 생겼다.", ["판타지"], "poster-8"],
  ["폴링 인투 파라다이스", "천국으로 오르는 계단 아래, 무언가가 오래 기다리고 있었다.", ["공포", "판타지"], "thumb-8"],
  ["타임 워", "같은 전투를 백 번 되풀이하는 소녀 병사의 마지막 72시간.", ["SF", "스릴러"], "thumb-10"],
  ["시간을 넘어", "헌책방에서 주운 이어폰에, 1919년의 목소리가 흐른다.", ["드라마", "SF"], "poster-6"],
  ["역병: 붉은 징조", "눈 내리는 조선의 마을, 붉은 깃털이 떨어진 집마다 사람이 사라진다.", ["공포", "스릴러"], "thumb-11"],
  ["어제의 무게", "매일 아침 지하철에서, 지우지 못한 어제가 머리 위로 쌓인다.", ["드라마"], "thumb-12"],
  ["백야 다이어리", "해가 지지 않는 도시에서 잠들지 못하는 형사.", ["스릴러", "드라마"], "poster-2"],
  ["연애 시뮬레이터 v9", "AI 연인이 이별을 거부하기 시작했다.", ["로맨스", "SF"], "poster-3"],
  ["플레이 위드 나스", "말 한마디 통하지 않는 반려견과 남겨진 서른 날.", ["드라마"], "poster-7"],
  ["정원의 문장가", "정원에 앉아, 남의 마지막 문장을 대신 써 주는 남자.", ["드라마", "다큐"], "thumb-5"],
  ["도씨(DOSSY)", "모두가 잠든 호텔, 5층의 불 꺼지지 않는 방.", ["스릴러", "드라마"], "thumb-1"],
  ["끝까지 지킨다", "AI 편대장과 인간 파일럿의 마지막 출격.", ["SF", "스릴러"], "poster-9"],
  // --- 심사 파이프라인 (t_20 ~ t_24) ---
  ["커튼콜", "무대에 오르는 순간에만 목소리가 나오는 배우.", ["드라마"], "thumb-2"],
  ["오늘도 택배", "택배 회사 최고 배송왕은, 사실 카피바라였다.", ["드라마", "애니메이션"], "poster-4"],
  ["은밀한 계절", "옆방에서 시작된 관계, 그리고 사라진 투숙객.", ["로맨스"], "poster-1"],
  ["흰파리", "아무도 초대하지 않은 잔칫상에 매일 나타나는 사내.", ["드라마"], "poster-12"],
  ["사위의 자격", "따님을 사랑합니다. 그리고 6년째 통장을 모으고 있습니다.", ["드라마"], "thumb-9"],
];

const STATUS_PLAN: Teaser["status"][] = [
  ...Array(19).fill("published"),
  "in_review",
  "in_review",
  "submitted",
  "rejected",
  "approved",
];

export const seedTeasers: Teaser[] = TITLES.map(([title, logline, genres, cover], i) => {
  const status = STATUS_PLAN[i];
  const creator = creators[i % creators.length];
  const publishedHoursAgo = int(2, 24 * 30);
  const isPublished = status === "published";
  const coverUrl = `/covers/${cover}.png`;
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
    poster_url: coverUrl,
    thumbnail_url: coverUrl,
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
  "친구한테 바로 공유함",
  "이번 시즌 다크호스",
];

/** Synthetic voters — real join rows, so counts survive recompute. */
const syntheticVoters = Array.from(
  { length: 260 },
  (_, i) => `sv_${String(i + 1).padStart(4, "0")}`,
);
const realVoters = seedProfiles.slice(0, 10).map((p) => p.id);

let commentSeq = 0;
let shareSeq = 0;
let viewSeq = 0;

for (const t of seedTeasers) {
  const popularity = rnd(); // 0..1 base popularity
  const base = t.status === "published" ? 1 : 0.12;
  const nLikes = Math.round(base * (25 + popularity * popularity * 150));
  const nSaves = Math.round(nLikes * (0.3 + rnd() * 0.3));
  const nShares = Math.round(nLikes * (0.06 + rnd() * 0.16));
  const nComments = Math.min(14, Math.round(nLikes * (0.05 + rnd() * 0.08)));
  const nStart = Math.round(nLikes * (2 + rnd() * 3));
  const nHalf = Math.round(nStart * (0.55 + rnd() * 0.2));
  const nComplete = Math.round(nHalf * (0.45 + rnd() * 0.25));

  const voters = [...realVoters, ...syntheticVoters].filter(
    (v) => v !== t.creator_id,
  );

  for (let i = 0; i < Math.min(nLikes, voters.length); i++) {
    seedLikes.push({
      user_id: voters[i],
      teaser_id: t.id,
      created_at: hoursAgo(int(1, 240)),
    });
  }
  for (let i = 0; i < Math.min(nSaves, voters.length); i++) {
    seedSaves.push({
      user_id: voters[i],
      teaser_id: t.id,
      created_at: hoursAgo(int(1, 240)),
    });
  }
  for (let i = 0; i < nShares; i++) {
    seedShares.push({
      id: `sh_${String(++shareSeq).padStart(4, "0")}`,
      user_id: voters[i % voters.length],
      teaser_id: t.id,
      channel: pick(["kakao", "link", "x", "instagram"]),
      created_at: hoursAgo(int(1, 200)),
    });
  }
  for (let c = 0; c < nComments; c++) {
    seedComments.push({
      id: `c_${String(++commentSeq).padStart(4, "0")}`,
      teaser_id: t.id,
      user_id: realVoters[c % realVoters.length],
      parent_id: null,
      body: COMMENT_BODIES[c % COMMENT_BODIES.length],
      like_count: int(0, 25),
      is_hidden: false,
      created_at: hoursAgo(int(1, 240)),
    });
  }
  const pushViews = (n: number, event: "start" | "half" | "complete") => {
    for (let i = 0; i < n; i++)
      seedViewEvents.push({
        id: `v_${String(++viewSeq).padStart(6, "0")}`,
        user_id: null,
        session_id: `seed_${viewSeq}`,
        teaser_id: t.id,
        event,
        created_at: hoursAgo(int(1, 120)),
      });
  };
  pushViews(nStart, "start");
  pushViews(nHalf, "half");
  pushViews(nComplete, "complete");
}

export const seedRankingConfig: RankingConfig = {
  id: "rc_01",
  season_id: "s_01",
  ...DEFAULT_WEIGHTS,
  updated_by: seedAdmin.id,
  updated_at: hoursAgo(48),
};

const countBy = <T extends { teaser_id: string }>(
  rows: T[],
  id: string,
  pred: (r: T) => boolean = () => true,
) => rows.filter((r) => r.teaser_id === id && pred(r)).length;

/** Derive a stat row purely from the seeded reaction rows (same math
 *  as lib/data syncStats), so store + cron stay consistent. */
function statFor(t: Teaser): TeaserStats {
  const like_count = countBy(seedLikes, t.id);
  const save_count = countBy(seedSaves, t.id);
  const share_count = countBy(seedShares, t.id);
  const comment_count = countBy(seedComments, t.id, (c) => !c.is_hidden);
  const view_start = countBy(seedViewEvents, t.id, (v) => v.event === "start");
  const view_half = countBy(seedViewEvents, t.id, (v) => v.event === "half");
  const view_complete = countBy(
    seedViewEvents,
    t.id,
    (v) => v.event === "complete",
  );
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
    teaser_id: "t_24", // 사위의 자격 — approved (승인 1 / 2, 공개 대기)
    reviewer_id: seedReviewer.id,
    decision: "approve",
    reason: null,
    score_story: 4,
    score_visual: 4,
    score_polish: 5,
    created_at: hoursAgo(12),
  },
  {
    id: "rv_02",
    teaser_id: "t_23", // 흰파리 — rejected
    reviewer_id: seedReviewer.id,
    decision: "reject",
    reason:
      "제목·썸네일의 표현 수위가 커뮤니티 가이드라인 경계에 있습니다. 문구를 순화해 재제출 바랍니다.",
    score_story: 3,
    score_visual: 4,
    score_polish: 3,
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
    title: "'재회 알고리즘' 제작기 — 큐브 속 인물은 어떻게 합성했나",
    body_md:
      "레퍼런스 → 콘티 → 샷 생성 → 리타이밍 순서로 작업했습니다. 큐브 반사/굴절은 후반에 따로 합성. 질문 환영!",
    images: ["/covers/thumb-7.png"],
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
    title: "너 이거 봤어? '역병: 붉은 징조' 그 붉은 깃털의 의미",
    body_md: "집집마다 떨어지는 붉은 깃털… 예고편만 보고도 소름. 결말 예측 가보자.",
    images: [],
    attached_teaser_id: "t_12",
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

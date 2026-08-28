/**
 * Mutable in-memory store for seed / mock mode.
 *
 * Holds a deep copy of the seed dataset so reactions, comments, reviews,
 * uploads etc. performed during a dev session persist until the server
 * restarts. In a real deployment (NEXT_PUBLIC_USE_SUPABASE=true) this
 * module is never used — Postgres is the store.
 */
import * as seed from "./seed";
import type {
  AppSetting,
  Comment,
  FundingCampaign,
  FundingPledge,
  Payout,
  Post,
  PostComment,
  Profile,
  RankingConfig,
  RevenueEntry,
  Review,
  Season,
  Teaser,
  TeaserStats,
} from "@/lib/types";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

interface Store {
  profiles: Profile[];
  seasons: Season[];
  teasers: Teaser[];
  stats: TeaserStats[];
  rankingConfig: RankingConfig;
  reviews: Review[];
  likes: { user_id: string; teaser_id: string; created_at: string }[];
  saves: { user_id: string; teaser_id: string; created_at: string }[];
  shares: {
    id: string;
    user_id: string | null;
    teaser_id: string;
    channel: string;
    created_at: string;
  }[];
  comments: Comment[];
  commentLikes: { user_id: string; comment_id: string }[];
  viewEvents: {
    id: string;
    user_id: string | null;
    session_id: string;
    teaser_id: string;
    event: "start" | "half" | "complete";
    created_at: string;
  }[];
  posts: Post[];
  postComments: PostComment[];
  postLikes: { user_id: string; post_id: string }[];
  campaigns: FundingCampaign[];
  pledges: FundingPledge[];
  revenueEntries: RevenueEntry[];
  payouts: Payout[];
  settings: AppSetting[];
  collections: { id: string; title: string; teaser_ids: string[] }[];
  notifications: import("@/lib/types").AppNotification[];
  snapshots: {
    id: string;
    season_id: string;
    taken_at: string;
    payload: unknown;
  }[];
  seq: number;
}

// Persist across HMR in dev.
const g = globalThis as unknown as { __conpicksStore?: Store };

function build(): Store {
  return {
    profiles: clone(seed.seedProfiles),
    seasons: clone(seed.seedSeasons),
    teasers: clone(seed.seedTeasers).map((t: Teaser) => {
      // strip the private __n* aggregates used only during seed build
      const c = { ...t } as Record<string, unknown>;
      Object.keys(c)
        .filter((k) => k.startsWith("__"))
        .forEach((k) => delete c[k]);
      return c as unknown as Teaser;
    }),
    stats: clone(seed.seedTeaserStats),
    rankingConfig: clone(seed.seedRankingConfig),
    reviews: clone(seed.seedReviews),
    likes: clone(seed.seedLikes),
    saves: clone(seed.seedSaves),
    shares: clone(seed.seedShares),
    comments: clone(seed.seedComments),
    commentLikes: [],
    viewEvents: clone(seed.seedViewEvents),
    posts: clone(seed.seedPosts),
    postComments: [],
    postLikes: [],
    campaigns: clone(seed.seedFundingCampaigns),
    pledges: clone(seed.seedFundingPledges),
    revenueEntries: clone(seed.seedRevenueEntries),
    payouts: clone(seed.seedPayouts),
    settings: clone(seed.seedAppSettings),
    collections: clone(seed.seedCollections),
    notifications: [],
    snapshots: [],
    seq: 1,
  };
}

export const store: Store = (g.__conpicksStore ??= build());

export function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${(store.seq++).toString(36)}`;
}

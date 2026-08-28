/** Domain models — mirror the Postgres schema in supabase/migrations. */

export type Role = "viewer" | "creator" | "reviewer" | "admin";

export type Genre =
  | "SF"
  | "스릴러"
  | "로맨스"
  | "판타지"
  | "공포"
  | "드라마"
  | "애니메이션"
  | "다큐";

export const GENRES: Genre[] = [
  "SF",
  "스릴러",
  "로맨스",
  "판타지",
  "공포",
  "드라마",
  "애니메이션",
  "다큐",
];

export type TeaserStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected"
  | "hidden"
  | "published";

export type SeasonStatus = "draft" | "active" | "closed";

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
  onboarded_at: string | null;
  creator_name: string | null;
  portfolio_url: string | null;
  creator_ai_tools: string[] | null;
  credit_balance: number;
  created_at: string;
}

export interface Season {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  prize_krw: number;
  rules_md: string;
  status: SeasonStatus;
  winner_teaser_id: string | null;
}

export interface Teaser {
  id: string;
  slug: string;
  season_id: string;
  creator_id: string;
  title: string;
  logline: string;
  synopsis: string;
  genres: Genre[];
  tags: string[];
  duration_sec: number;
  video_provider: string;
  video_id: string;
  playback_url: string;
  poster_url: string;
  thumbnail_url: string;
  ai_tools: string[];
  credits: string;
  status: TeaserStatus;
  published_at: string | null;
  jimovie_review_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeaserStats {
  teaser_id: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  save_count: number;
  view_start: number;
  view_half: number;
  view_complete: number;
  score: number;
  rank: number;
  prev_rank: number | null;
  updated_at: string;
}

export interface RankingConfig {
  id: string;
  season_id: string | null;
  w_like: number;
  w_comment: number;
  w_share: number;
  w_save: number;
  w_complete: number;
  w_half: number;
  half_life_hours: number;
  updated_by: string | null;
  updated_at: string;
}

export interface Review {
  id: string;
  teaser_id: string;
  reviewer_id: string;
  decision: "approve" | "reject" | "hold";
  reason: string | null;
  score_story: number | null;
  score_visual: number | null;
  score_polish: number | null;
  created_at: string;
}

export interface Comment {
  id: string;
  teaser_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  like_count: number;
  is_hidden: boolean;
  created_at: string;
}

export type PostCategory =
  | "전체"
  | "작품 토론"
  | "AI 제작 팁"
  | "크리에이터 라운지"
  | "공지";

export interface Post {
  id: string;
  author_id: string;
  category: Exclude<PostCategory, "전체">;
  title: string;
  body_md: string;
  images: string[];
  attached_teaser_id: string | null;
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
}

export type FundingStatus =
  | "draft"
  | "open"
  | "success"
  | "failed"
  | "settling"
  | "closed";

export interface FundingCampaign {
  id: string;
  teaser_id: string;
  type: "reward" | "revenue_share";
  goal_krw: number;
  raised_krw: number;
  starts_at: string;
  ends_at: string;
  status: FundingStatus;
  terms_md: string;
}

export interface FundingPledge {
  id: string;
  campaign_id: string;
  user_id: string;
  amount_krw: number;
  payment_ref: string | null;
  status: "pending" | "confirmed" | "refunded";
  created_at: string;
}

export interface RevenueEntry {
  id: string;
  teaser_id: string;
  source: string;
  amount_krw: number;
  occurred_at: string;
  memo: string;
}

export interface Payout {
  id: string;
  campaign_id: string;
  user_id: string;
  amount_krw: number;
  status: "pending" | "paid";
  paid_at: string | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type:
    | "review_approved"
    | "review_rejected"
    | "comment"
    | "rank_enter"
    | "funding";
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: string;
  description: string;
}

/* --- View-model composites used across the UI --- */

export interface TeaserCardVM {
  teaser: Teaser;
  stats: TeaserStats;
  creator: Pick<Profile, "id" | "nickname" | "avatar_url" | "role">;
  rankDelta: number | null; // prev_rank - rank ; positive = moved up ; null = NEW
}

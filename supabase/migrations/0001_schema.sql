-- ============================================================
--  CONPICKS — core schema (0001)
--  Postgres / Supabase. Enums as text + CHECK per 개발지시서 §3.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------------------------------------
create table if not exists profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  nickname          text unique not null,
  avatar_url        text,
  bio               text,
  role              text not null default 'viewer'
                      check (role in ('viewer','creator','reviewer','admin')),
  onboarded_at      timestamptz,
  creator_name      text,
  portfolio_url     text,
  creator_ai_tools  text[],
  credit_balance    int not null default 0,
  created_at        timestamptz not null default now()
);

-- ---------- seasons ----------------------------------------
create table if not exists seasons (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  prize_krw        bigint not null default 0,
  rules_md         text not null default '',
  status           text not null default 'draft'
                     check (status in ('draft','active','closed')),
  winner_teaser_id uuid,
  created_at       timestamptz not null default now()
);

-- ---------- teasers ----------------------------------------
create table if not exists teasers (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  season_id          uuid not null references seasons(id),
  creator_id         uuid not null references profiles(id) on delete cascade,
  title              text not null,
  logline            text not null default '',
  synopsis           text not null default '',
  genres             text[] not null default '{}',
  tags               text[] not null default '{}',
  duration_sec       int not null default 0,
  video_provider     text not null default 'mock',
  video_id           text not null default '',
  playback_url       text not null default '',
  poster_url         text not null default '',
  thumbnail_url      text not null default '',
  ai_tools           text[] not null default '{}',
  credits            text not null default '',
  status             text not null default 'draft'
                       check (status in ('draft','submitted','in_review',
                              'approved','rejected','hidden','published')),
  published_at       timestamptz,
  jimovie_review_url text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists teasers_status_idx     on teasers(status);
create index if not exists teasers_season_idx     on teasers(season_id);
create index if not exists teasers_creator_idx    on teasers(creator_id);
create index if not exists teasers_published_idx  on teasers(published_at desc);

alter table seasons
  add constraint seasons_winner_fk
  foreign key (winner_teaser_id) references teasers(id) on delete set null
  deferrable initially deferred;

-- ---------- reviews ---------------------------------------
create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  teaser_id    uuid not null references teasers(id) on delete cascade,
  reviewer_id  uuid not null references profiles(id),
  decision     text not null check (decision in ('approve','reject','hold')),
  reason       text,
  score_story  int check (score_story between 1 and 5),
  score_visual int check (score_visual between 1 and 5),
  score_polish int check (score_polish between 1 and 5),
  created_at   timestamptz not null default now(),
  unique (teaser_id, reviewer_id)
);

-- ---------- reactions (append-only) ----------------------
create table if not exists likes (
  user_id    uuid not null references profiles(id) on delete cascade,
  teaser_id  uuid not null references teasers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, teaser_id)
);
create table if not exists saves (
  user_id    uuid not null references profiles(id) on delete cascade,
  teaser_id  uuid not null references teasers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, teaser_id)
);
create table if not exists shares (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete set null,
  teaser_id  uuid not null references teasers(id) on delete cascade,
  channel    text not null default 'link',
  created_at timestamptz not null default now()
);
create index if not exists shares_teaser_idx on shares(teaser_id);
create index if not exists shares_user_day_idx on shares(user_id, created_at);

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  teaser_id  uuid not null references teasers(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  parent_id  uuid references comments(id) on delete cascade,
  body       text not null,
  like_count int not null default 0,
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_teaser_idx on comments(teaser_id, created_at);

create table if not exists comment_likes (
  user_id    uuid not null references profiles(id) on delete cascade,
  comment_id uuid not null references comments(id) on delete cascade,
  primary key (user_id, comment_id)
);

create table if not exists view_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete set null,
  session_id text not null,
  teaser_id  uuid not null references teasers(id) on delete cascade,
  event      text not null check (event in ('start','half','complete')),
  created_at timestamptz not null default now()
);
create index if not exists view_events_teaser_idx on view_events(teaser_id, event);

-- ---------- aggregates & ranking ------------------------
create table if not exists teaser_stats (
  teaser_id     uuid primary key references teasers(id) on delete cascade,
  like_count    int not null default 0,
  comment_count int not null default 0,
  share_count   int not null default 0,
  save_count    int not null default 0,
  view_start    int not null default 0,
  view_half     int not null default 0,
  view_complete int not null default 0,
  score         numeric not null default 0,
  rank          int not null default 0,
  prev_rank     int,
  updated_at    timestamptz not null default now()
);
create index if not exists teaser_stats_rank_idx on teaser_stats(rank);

create table if not exists ranking_snapshots (
  id        uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  taken_at  timestamptz not null default now(),
  payload   jsonb not null
);

create table if not exists ranking_config (
  id              uuid primary key default gen_random_uuid(),
  season_id       uuid references seasons(id) on delete cascade,
  w_like          numeric not null default 3,
  w_comment       numeric not null default 4,
  w_share         numeric not null default 10,
  w_save          numeric not null default 6,
  w_complete      numeric not null default 2,
  w_half          numeric not null default 0.5,
  half_life_hours numeric not null default 72,
  updated_by      uuid references profiles(id),
  updated_at      timestamptz not null default now(),
  unique (season_id)
);

-- ---------- community ----------------------------------
create table if not exists posts (
  id                 uuid primary key default gen_random_uuid(),
  author_id          uuid not null references profiles(id) on delete cascade,
  category           text not null
                       check (category in ('작품 토론','AI 제작 팁','크리에이터 라운지','공지')),
  title              text not null,
  body_md            text not null default '',
  images             text[] not null default '{}',
  attached_teaser_id uuid references teasers(id) on delete set null,
  like_count         int not null default 0,
  comment_count      int not null default 0,
  is_pinned          boolean not null default false,
  is_hidden          boolean not null default false,
  created_at         timestamptz not null default now()
);
create index if not exists posts_category_idx on posts(category, created_at desc);

create table if not exists post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  parent_id  uuid references post_comments(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create table if not exists post_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  primary key (user_id, post_id)
);

create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('teaser','comment','post','post_comment')),
  target_id   uuid not null,
  reason      text not null,
  status      text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at  timestamptz not null default now()
);

-- ---------- funding & settlement ----------------------
create table if not exists funding_campaigns (
  id         uuid primary key default gen_random_uuid(),
  teaser_id  uuid not null references teasers(id) on delete cascade,
  type       text not null default 'revenue_share'
               check (type in ('reward','revenue_share')),
  goal_krw   bigint not null,
  raised_krw bigint not null default 0,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  status     text not null default 'draft'
               check (status in ('draft','open','success','failed','settling','closed')),
  terms_md   text not null default ''
);

create table if not exists funding_pledges (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references funding_campaigns(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  amount_krw  bigint not null check (amount_krw > 0),
  payment_ref text,
  status      text not null default 'pending'
                check (status in ('pending','confirmed','refunded')),
  created_at  timestamptz not null default now()
);

create table if not exists revenue_entries (
  id          uuid primary key default gen_random_uuid(),
  teaser_id   uuid not null references teasers(id) on delete cascade,
  source      text not null,
  amount_krw  bigint not null,
  occurred_at timestamptz not null default now(),
  memo        text not null default ''
);

create table if not exists payouts (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references funding_campaigns(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  amount_krw  bigint not null,
  status      text not null default 'pending' check (status in ('pending','paid')),
  paid_at     timestamptz
);

create table if not exists credit_transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null check (type in ('charge','pledge','refund','payout')),
  amount     int not null,
  ref_id     uuid,
  created_at timestamptz not null default now()
);

-- ---------- notifications ----------------------------
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null,
  payload    jsonb not null default '{}',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

-- ---------- app_settings (nothing hard-coded lives outside here) ----
create table if not exists app_settings (
  key         text primary key,
  value       text not null,
  description text not null default ''
);

-- ---------- collections (admin curation) -------------
create table if not exists collections (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  teaser_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- keep teasers.updated_at fresh
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists teasers_touch on teasers;
create trigger teasers_touch before update on teasers
  for each row execute function touch_updated_at();

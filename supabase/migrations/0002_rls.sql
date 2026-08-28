-- ============================================================
--  CONPICKS — Row Level Security (0002)
-- ============================================================

-- helper: current user's role
create or replace function current_role_name() returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_staff() returns boolean as $$
  select coalesce(current_role_name() in ('reviewer','admin'), false);
$$ language sql stable security definer;

create or replace function is_admin() returns boolean as $$
  select coalesce(current_role_name() = 'admin', false);
$$ language sql stable security definer;

alter table profiles            enable row level security;
alter table seasons             enable row level security;
alter table teasers             enable row level security;
alter table reviews             enable row level security;
alter table likes               enable row level security;
alter table saves               enable row level security;
alter table shares              enable row level security;
alter table comments            enable row level security;
alter table comment_likes       enable row level security;
alter table view_events         enable row level security;
alter table teaser_stats        enable row level security;
alter table ranking_snapshots   enable row level security;
alter table ranking_config      enable row level security;
alter table posts               enable row level security;
alter table post_comments       enable row level security;
alter table post_likes          enable row level security;
alter table reports             enable row level security;
alter table funding_campaigns   enable row level security;
alter table funding_pledges     enable row level security;
alter table revenue_entries     enable row level security;
alter table payouts             enable row level security;
alter table credit_transactions enable row level security;
alter table notifications       enable row level security;
alter table app_settings        enable row level security;
alter table collections         enable row level security;

-- ---------- profiles ----------
create policy profiles_read_all on profiles for select using (true);
create policy profiles_update_self on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_insert_self on profiles for insert
  with check (id = auth.uid());
create policy profiles_admin_all on profiles for all
  using (is_admin()) with check (is_admin());

-- ---------- seasons / settings / collections (public read, admin write) ----------
create policy seasons_read on seasons for select using (true);
create policy seasons_admin on seasons for all using (is_admin()) with check (is_admin());
create policy settings_read on app_settings for select using (true);
create policy settings_admin on app_settings for all using (is_admin()) with check (is_admin());
create policy collections_read on collections for select using (true);
create policy collections_admin on collections for all using (is_admin()) with check (is_admin());

-- ---------- teasers ----------
--  published -> everyone ; otherwise owner / staff only
create policy teasers_read_published on teasers for select
  using (
    status = 'published'
    or creator_id = auth.uid()
    or is_staff()
  );
create policy teasers_insert_creator on teasers for insert
  with check (creator_id = auth.uid() and current_role_name() in ('creator','admin'));
create policy teasers_update_owner on teasers for update
  using (creator_id = auth.uid() or is_staff())
  with check (creator_id = auth.uid() or is_staff());
create policy teasers_admin_delete on teasers for delete using (is_admin());

-- ---------- reviews (staff only) ----------
create policy reviews_staff_read on reviews for select using (is_staff());
create policy reviews_staff_write on reviews for insert
  with check (reviewer_id = auth.uid() and is_staff());
create policy reviews_staff_update on reviews for update
  using (reviewer_id = auth.uid() and is_staff())
  with check (reviewer_id = auth.uid() and is_staff());

-- ---------- reactions : insert self, read public ----------
create policy likes_read on likes for select using (true);
create policy likes_write on likes for insert with check (user_id = auth.uid());
create policy likes_delete on likes for delete using (user_id = auth.uid());

create policy saves_read on saves for select using (true);
create policy saves_write on saves for insert with check (user_id = auth.uid());
create policy saves_delete on saves for delete using (user_id = auth.uid());

create policy shares_read on shares for select using (true);
create policy shares_write on shares for insert
  with check (user_id = auth.uid() or user_id is null);

create policy view_events_read on view_events for select using (is_staff());
create policy view_events_write on view_events for insert
  with check (user_id = auth.uid() or user_id is null);

-- ---------- comments ----------
create policy comments_read on comments for select using (not is_hidden or user_id = auth.uid() or is_staff());
create policy comments_write on comments for insert with check (user_id = auth.uid());
create policy comments_update_self on comments for update
  using (user_id = auth.uid() or is_staff())
  with check (user_id = auth.uid() or is_staff());
create policy comment_likes_read on comment_likes for select using (true);
create policy comment_likes_write on comment_likes for insert with check (user_id = auth.uid());
create policy comment_likes_delete on comment_likes for delete using (user_id = auth.uid());

-- ---------- stats / snapshots (public read, service writes) ----------
create policy teaser_stats_read on teaser_stats for select using (true);
create policy snapshots_read on ranking_snapshots for select using (true);
create policy ranking_config_read on ranking_config for select using (true);
create policy ranking_config_admin on ranking_config for all
  using (is_admin()) with check (is_admin());
--  teaser_stats / ranking_snapshots writes go through the service-role
--  key (cron) which bypasses RLS; no anon write policy on purpose.

-- ---------- community ----------
create policy posts_read on posts for select using (not is_hidden or author_id = auth.uid() or is_admin());
create policy posts_write on posts for insert with check (author_id = auth.uid());
create policy posts_update_self on posts for update
  using (author_id = auth.uid() or is_admin())
  with check (author_id = auth.uid() or is_admin());
create policy post_comments_read on post_comments for select using (true);
create policy post_comments_write on post_comments for insert with check (user_id = auth.uid());
create policy post_likes_read on post_likes for select using (true);
create policy post_likes_write on post_likes for insert with check (user_id = auth.uid());
create policy post_likes_delete on post_likes for delete using (user_id = auth.uid());

create policy reports_insert on reports for insert with check (reporter_id = auth.uid());
create policy reports_staff_read on reports for select using (is_staff());
create policy reports_staff_update on reports for update using (is_staff()) with check (is_staff());

-- ---------- funding ----------
create policy campaigns_read on funding_campaigns for select using (true);
create policy campaigns_admin on funding_campaigns for all using (is_admin()) with check (is_admin());
create policy pledges_read_self on funding_pledges for select
  using (user_id = auth.uid() or is_admin());
create policy pledges_write_self on funding_pledges for insert with check (user_id = auth.uid());
create policy revenue_admin on revenue_entries for all using (is_admin()) with check (is_admin());
create policy revenue_read_participant on revenue_entries for select using (
  is_admin() or exists (
    select 1 from funding_pledges fp
    join funding_campaigns fc on fc.id = fp.campaign_id
    where fc.teaser_id = revenue_entries.teaser_id and fp.user_id = auth.uid()
  )
);
create policy payouts_read_self on payouts for select using (user_id = auth.uid() or is_admin());
create policy payouts_admin on payouts for all using (is_admin()) with check (is_admin());

create policy credit_tx_read_self on credit_transactions for select using (user_id = auth.uid() or is_admin());
create policy credit_tx_admin on credit_transactions for all using (is_admin()) with check (is_admin());

-- ---------- notifications ----------
create policy notifications_read_self on notifications for select using (user_id = auth.uid());
create policy notifications_update_self on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

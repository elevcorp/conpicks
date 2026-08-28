-- ============================================================
--  CONPICKS — count triggers keeping teaser_stats in sync (0003)
-- ============================================================

create or replace function ensure_stats_row(t uuid) returns void as $$
  insert into teaser_stats(teaser_id) values (t)
  on conflict (teaser_id) do nothing;
$$ language sql;

create or replace function recount_teaser(t uuid) returns void as $$
begin
  perform ensure_stats_row(t);
  update teaser_stats s set
    like_count    = (select count(*) from likes  where teaser_id = t),
    save_count    = (select count(*) from saves  where teaser_id = t),
    share_count   = (select count(*) from shares where teaser_id = t),
    comment_count = (select count(*) from comments where teaser_id = t and not is_hidden),
    view_start    = (select count(*) from view_events where teaser_id = t and event = 'start'),
    view_half     = (select count(*) from view_events where teaser_id = t and event = 'half'),
    view_complete = (select count(*) from view_events where teaser_id = t and event = 'complete'),
    updated_at    = now()
  where s.teaser_id = t;
end;
$$ language plpgsql;

-- generic trigger fn: NEW/OLD.teaser_id -> recount
create or replace function trg_recount() returns trigger as $$
begin
  perform recount_teaser(coalesce(new.teaser_id, old.teaser_id));
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists likes_recount    on likes;
drop trigger if exists saves_recount    on saves;
drop trigger if exists shares_recount   on shares;
drop trigger if exists comments_recount on comments;
drop trigger if exists views_recount    on view_events;

create trigger likes_recount    after insert or delete on likes
  for each row execute function trg_recount();
create trigger saves_recount    after insert or delete on saves
  for each row execute function trg_recount();
create trigger shares_recount   after insert or delete on shares
  for each row execute function trg_recount();
create trigger comments_recount after insert or update or delete on comments
  for each row execute function trg_recount();
create trigger views_recount    after insert or delete on view_events
  for each row execute function trg_recount();

-- comment_likes -> comments.like_count
create or replace function trg_comment_like_count() returns trigger as $$
begin
  update comments set like_count = (
    select count(*) from comment_likes where comment_id = coalesce(new.comment_id, old.comment_id)
  ) where id = coalesce(new.comment_id, old.comment_id);
  return coalesce(new, old);
end;
$$ language plpgsql;
drop trigger if exists comment_likes_count on comment_likes;
create trigger comment_likes_count after insert or delete on comment_likes
  for each row execute function trg_comment_like_count();

-- new teaser -> stats row
create or replace function trg_teaser_stats_row() returns trigger as $$
begin perform ensure_stats_row(new.id); return new; end;
$$ language plpgsql;
drop trigger if exists teasers_stats_row on teasers;
create trigger teasers_stats_row after insert on teasers
  for each row execute function trg_teaser_stats_row();

-- auto profile row on signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(split_part(new.email,'@',1), 'user_' || left(new.id::text, 6)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

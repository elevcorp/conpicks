-- ============================================================
--  CONPICKS — ranking recompute (0004)
--  Mirrors lib/ranking/score.ts. Invoked every 5 min by cron
--  (pg_cron or the /api/cron/recompute-ranking route with the
--  service-role key).
-- ============================================================

--  score = raw · (0.4 + 0.6 · decay)
--  raw   = Σ wᵢ·metricᵢ ; decay = 0.5 ^ (hours_since_pub / half_life)
create or replace function recompute_ranking(p_season uuid default null,
                                             p_rotate_prev boolean default false)
returns int as $$
declare
  v_season uuid;
  v_cfg    ranking_config%rowtype;
  v_now    timestamptz := now();
  v_count  int := 0;
begin
  select id into v_season from seasons
   where (p_season is not null and id = p_season)
      or (p_season is null and status = 'active')
   order by starts_at desc limit 1;
  if v_season is null then return 0; end if;

  select * into v_cfg from ranking_config where season_id = v_season;
  if not found then
    v_cfg.w_like := 3; v_cfg.w_comment := 4; v_cfg.w_share := 10;
    v_cfg.w_save := 6; v_cfg.w_complete := 2; v_cfg.w_half := 0.5;
    v_cfg.half_life_hours := 72;
  end if;

  if p_rotate_prev then
    update teaser_stats s set prev_rank = nullif(s.rank, 0)
      from teasers t where t.id = s.teaser_id and t.season_id = v_season;
  end if;

  with scored as (
    select
      s.teaser_id,
      (v_cfg.w_share*s.share_count + v_cfg.w_save*s.save_count
       + v_cfg.w_like*s.like_count + v_cfg.w_comment*s.comment_count
       + v_cfg.w_complete*s.view_complete + v_cfg.w_half*s.view_half)
      *
      (0.4 + 0.6 * power(0.5,
        greatest(extract(epoch from (v_now - coalesce(t.published_at, v_now)))/3600.0, 0)
        / nullif(v_cfg.half_life_hours,0)))
      as score
    from teaser_stats s
    join teasers t on t.id = s.teaser_id
    where t.season_id = v_season and t.status = 'published'
  ),
  ranked as (
    select teaser_id, score,
           row_number() over (order by score desc, teaser_id) as rnk
    from scored
  )
  update teaser_stats s
     set score = r.score, rank = r.rnk, updated_at = v_now
    from ranked r where r.teaser_id = s.teaser_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;

--  daily confirmed snapshot (also called on season close)
create or replace function snapshot_ranking(p_season uuid) returns uuid as $$
declare v_id uuid;
begin
  insert into ranking_snapshots(season_id, payload)
  select p_season, jsonb_agg(jsonb_build_object(
           'teaser_id', s.teaser_id, 'rank', s.rank, 'score', s.score)
         order by s.rank)
  from teaser_stats s join teasers t on t.id = s.teaser_id
  where t.season_id = p_season and t.status = 'published'
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

-- Schedule with pg_cron if available:
--   select cron.schedule('conpicks-ranking','*/5 * * * *',$$select recompute_ranking()$$);
--   select cron.schedule('conpicks-prevrank','0 0 * * *',$$select recompute_ranking(null,true)$$);

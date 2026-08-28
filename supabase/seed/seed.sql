-- ============================================================
--  CONPICKS — reference seed for a fresh Supabase project.
--  Run AFTER 0001–0004. Mirrors lib/data/seed.ts (abridged:
--  12 teasers instead of 24). The mock adapter is authoritative
--  for local dev; this is for provisioned environments.
-- ============================================================
begin;

-- ---- auth users + profiles -------------------------------
-- (Supabase local: inserting into auth.users is allowed. In hosted
--  projects create users via the Auth API instead, then upsert profiles.)
insert into auth.users (id, email, raw_user_meta_data, aud, role, email_confirmed_at)
values
 ('00000000-0000-0000-0000-000000000001','admin@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000002','reviewer@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000003','rey@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000004','moth@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000005','hani@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000006','cutdeep@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000007','viewer1@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000008','viewer2@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-000000000009','viewer3@conpicks.test','{}','authenticated','authenticated',now()),
 ('00000000-0000-0000-0000-00000000000a','viewer4@conpicks.test','{}','authenticated','authenticated',now())
on conflict (id) do nothing;

insert into profiles (id, nickname, avatar_url, role, onboarded_at, creator_name, creator_ai_tools, credit_balance)
values
 ('00000000-0000-0000-0000-000000000001','지무비',      'https://api.dicebear.com/9.x/thumbs/svg?seed=jimovie','admin',   now(), null, null, 0),
 ('00000000-0000-0000-0000-000000000002','MCN_리원',    'https://api.dicebear.com/9.x/thumbs/svg?seed=riwon','reviewer', now(), null, null, 0),
 ('00000000-0000-0000-0000-000000000003','김레이',      'https://api.dicebear.com/9.x/thumbs/svg?seed=rey','creator',  now(), '김레이 studio', array['Sora','Kling'], 0),
 ('00000000-0000-0000-0000-000000000004','pixelmoth',   'https://api.dicebear.com/9.x/thumbs/svg?seed=moth','creator',  now(), 'pixelmoth studio', array['Runway Gen-3','Midjourney'], 0),
 ('00000000-0000-0000-0000-000000000005','정하늬',      'https://api.dicebear.com/9.x/thumbs/svg?seed=hani','creator',  now(), '정하늬 studio', array['Kling','Luma'], 0),
 ('00000000-0000-0000-0000-000000000006','cutdeep',     'https://api.dicebear.com/9.x/thumbs/svg?seed=cutdeep','creator', now(), 'cutdeep studio', array['Veo','Pika'], 0),
 ('00000000-0000-0000-0000-000000000007','오로라킴',    'https://api.dicebear.com/9.x/thumbs/svg?seed=aurora','viewer', now(), null, null, 50000),
 ('00000000-0000-0000-0000-000000000008','renderghost', 'https://api.dicebear.com/9.x/thumbs/svg?seed=ghost','viewer',  now(), null, null, 20000),
 ('00000000-0000-0000-0000-000000000009','한지우',      'https://api.dicebear.com/9.x/thumbs/svg?seed=jiwoo','viewer',  now(), null, null, 30000),
 ('00000000-0000-0000-0000-00000000000a','midnight_reel','https://api.dicebear.com/9.x/thumbs/svg?seed=reel','viewer',  now(), null, null, 10000)
on conflict (id) do nothing;

-- ---- season + ranking config + settings ------------------
insert into seasons (id, name, starts_at, ends_at, prize_krw, rules_md, status)
values ('00000000-0000-0000-0000-000000009001'::uuid,
        '시즌 1 — 첫 번째 상영관',
        now() - interval '40 days', now() + interval '20 days',
        30000000, '## 시즌 1 규정\n- 2~3분 AI 티저\n- 1차 심사 통과작만 공개', 'active')
on conflict (id) do nothing;

insert into ranking_config (season_id, updated_by)
values ('00000000-0000-0000-0000-000000009001'::uuid, '00000000-0000-0000-0000-000000000001')
on conflict (season_id) do nothing;

insert into app_settings (key, value, description) values
 ('REVIEW_APPROVALS_REQUIRED','2','1차 심사 자동 공개에 필요한 승인 인원'),
 ('TEASER_MIN_DURATION_SEC','90','업로드 최소 길이(초)'),
 ('TEASER_MAX_DURATION_SEC','240','업로드 최대 길이(초)'),
 ('TEASER_MAX_UPLOAD_MB','500','업로드 최대 용량(MB)'),
 ('FUNDING_MIN_PLEDGE_KRW','10000','펀딩 최소 참여 금액'),
 ('NEW_ROW_WINDOW_HOURS','72','새로 올라온 작품 노출 기간'),
 ('RANKING_RECOMPUTE_MINUTES','5','랭킹 재계산 주기'),
 ('HOME_GENRE_ORDER','["SF","스릴러","로맨스","판타지","공포","드라마","애니메이션","다큐"]','홈 장르 로우 순서')
on conflict (key) do nothing;

-- ---- teasers --------------------------------------------
insert into teasers (id, slug, season_id, creator_id, title, logline, synopsis, genres, tags,
  duration_sec, playback_url, poster_url, thumbnail_url, ai_tools, credits, status, published_at, jimovie_review_url)
select
  ('00000000-0000-0000-0000-0000000010' || to_char(g,'FM00'))::uuid,
  'teaser-' || g,
  '00000000-0000-0000-0000-000000009001'::uuid,
  ('00000000-0000-0000-0000-00000000000' || (3 + (g % 4)))::uuid,
  (array['마지막 정거장','의뢰인','여름의 잔상','문 너머의 정원','13번째 관객','아버지의 언어',
         '로봇이 꾼 꿈','소각로 도시','연애 시뮬레이터 v9','붉은 방','할머니의 냉장고','궤도 이탈'])[g],
  '한 줄 로그라인 — ' || g,
  '시놉시스 텍스트. AI 파이프라인으로 완성한 2~3분 티저.',
  (array[array['SF','스릴러'],array['스릴러'],array['로맨스','판타지'],array['판타지','공포'],
         array['공포'],array['드라마'],array['SF','애니메이션'],array['SF','다큐'],
         array['로맨스','SF'],array['공포','스릴러'],array['판타지','드라마'],array['SF','스릴러']])[g],
  array['AI단편','시즌1','콘픽스'],
  120 + g * 7,
  (array['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'])[1 + (g % 6)],
  'https://picsum.photos/seed/teaser' || g || 'p/600/900',
  'https://picsum.photos/seed/teaser' || g || 't/960/540',
  array['Sora','Kling'],
  '연출·편집 크리에이터 · 음악 Suno',
  case when g <= 10 then 'published' when g = 11 then 'in_review' else 'submitted' end,
  case when g <= 10 then now() - (g || ' days')::interval else null end,
  case when g <= 3 then 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' else null end
from generate_series(1,12) g
on conflict (id) do nothing;

-- ---- reactions (spread) ---------------------------------
insert into teaser_stats (teaser_id) select id from teasers on conflict do nothing;

do $$
declare t record; u record; k int;
begin
  for t in select id, row_number() over (order by slug) rn from teasers where status='published' loop
    k := 0;
    for u in select id from profiles loop
      k := k + 1;
      if (k * t.rn) % 3 <> 0 then
        insert into likes(user_id,teaser_id) values (u.id,t.id) on conflict do nothing;
      end if;
      if (k + t.rn) % 4 = 0 then
        insert into saves(user_id,teaser_id) values (u.id,t.id) on conflict do nothing;
      end if;
      if (k + t.rn) % 5 = 0 then
        insert into shares(user_id,teaser_id,channel) values (u.id,t.id,'kakao');
      end if;
      if (k + t.rn) % 6 = 0 then
        insert into comments(teaser_id,user_id,body) values (t.id,u.id,'이걸 AI로 만들었다고?');
      end if;
    end loop;
    insert into view_events(teaser_id,session_id,event)
      select t.id,'seed','start'    from generate_series(1, 20 + t.rn*3);
    insert into view_events(teaser_id,session_id,event)
      select t.id,'seed','half'     from generate_series(1, 12 + t.rn*2);
    insert into view_events(teaser_id,session_id,event)
      select t.id,'seed','complete' from generate_series(1, 6 + t.rn);
  end loop;
end $$;

-- ---- review rows (11 in_review has one approval) ---------
insert into reviews (teaser_id, reviewer_id, decision, score_story, score_visual, score_polish)
values (('00000000-0000-0000-0000-000000001011')::uuid,
        '00000000-0000-0000-0000-000000000002','approve',4,5,4)
on conflict do nothing;

-- ---- community -----------------------------------------
insert into posts (author_id, category, title, body_md, attached_teaser_id, like_count, comment_count, is_pinned)
values
 ('00000000-0000-0000-0000-000000000001','공지','시즌 1 오픈 — 상금 3,000만원','좋아요·공유·저장이 곧 흥행 신호입니다.',null,210,18,true),
 ('00000000-0000-0000-0000-000000000003','크리에이터 라운지','''마지막 정거장'' 제작기','레퍼런스 → 콘티 → 샷 생성 → 리타이밍','00000000-0000-0000-0000-000000001001'::uuid,96,12,false),
 ('00000000-0000-0000-0000-000000000007','작품 토론','너 이거 봤어? ''13번째 관객'' 결말 해석','마지막 컷의 빈 좌석…','00000000-0000-0000-0000-000000001005'::uuid,143,27,false);

-- ---- funding ------------------------------------------
insert into funding_campaigns (id, teaser_id, type, goal_krw, raised_krw, starts_at, ends_at, status, terms_md)
values ('00000000-0000-0000-0000-0000000000f1'::uuid,
        '00000000-0000-0000-0000-000000001001'::uuid,'revenue_share',
        20000000, 8450000, now() - interval '6 days', now() + interval '8 days','open',
        '수익배분형 캠페인. 참여자는 지분·IP 권리 없음. 순수익 20%를 참여금 비례 배분.')
on conflict (id) do nothing;

insert into funding_pledges (campaign_id, user_id, amount_krw, status) values
 ('00000000-0000-0000-0000-0000000000f1'::uuid,'00000000-0000-0000-0000-000000000007',10000,'confirmed'),
 ('00000000-0000-0000-0000-0000000000f1'::uuid,'00000000-0000-0000-0000-000000000008',20000,'confirmed'),
 ('00000000-0000-0000-0000-0000000000f1'::uuid,'00000000-0000-0000-0000-000000000009',50000,'confirmed'),
 ('00000000-0000-0000-0000-0000000000f1'::uuid,'00000000-0000-0000-0000-00000000000a',20000,'pending');

insert into revenue_entries (teaser_id, source, amount_krw, memo)
values ('00000000-0000-0000-0000-000000001001'::uuid,'숏폼 광고 수익 (7월)',1250000,'정산 대기');

-- ---- compute initial ranking --------------------------
select recompute_ranking('00000000-0000-0000-0000-000000009001'::uuid, false);

commit;

# DECISIONS

Running log of choices made where the 개발지시서 left a gap or reality forced a
deviation. Newest at the bottom of each phase.

---

## Phase 1 — 기반

### Environment
- **D1. Node runtime.** The build machine had no Node toolchain. Installed
  Node v22.23.2 into `~/.local/node` and added it to `PATH` via `~/.zshenv`.
  `.nvmrc` pins `22` for contributors.
- **D2. No live Supabase.** No project / keys were available. The app is built
  to run with **zero external services** via a deterministic in-memory seed
  adapter (`lib/data/`), switched by `NEXT_PUBLIC_USE_SUPABASE` (default
  `false`). This matches the 지시서's own "env switch" philosophy (video
  provider) and keeps every phase demoable + screenshot-able.

### Stack specifics
- **D3. Tailwind v4.** `create-next-app@15` ships Tailwind v4, which has no
  `tailwind.config.js`. Design tokens (§5) live in `app/globals.css` under
  `@theme` + `:root`. All spec hex values preserved exactly.
- **D4. shadcn `base-nova` style.** `shadcn init` defaulted to the new
  `@base-ui/react` registry (not Radix). Kept it — it is the current official
  default. Consequence: `asChild` → not available; we compose with
  `buttonVariants()` on `<Link>` instead, and use base-ui prop names
  (`delay` not `delayDuration`, `render` not `asChild`).
- **D5. Fonts.** Pretendard is not on Google Fonts → loaded as a variable
  webfont via jsDelivr `@font-face` in `globals.css`; `next/font` provides
  the Inter Latin fallback. `--font-sans` = Pretendard → Inter → system.
- **D6. Auth in mock mode.** `cp_uid` cookie names a seed profile; the login
  screen offers one-tap sign-in as any seed user. Real email/Google/Kakao via
  Supabase Auth is wired (`OAuthButtons`, `/auth/callback`) and activates when
  `NEXT_PUBLIC_USE_SUPABASE=true`.
- **D7. Onboarding gate.** `middleware.ts` redirects authenticated-but-not-
  onboarded users to `/onboarding/role`. Onboarding state is mirrored to a
  `cp_onboarded` cookie so middleware stays edge-cheap (no DB call in mock
  mode). Protected prefixes: `/my /upload /community/write /reviewer /admin
  /funding`.
- **D8. Settings not hard-coded.** Approval count, video length limits, funding
  minimum, "new" window, genre order, recompute interval all live in
  `app_settings` (seed) / table (Supabase). Ranking weights live in
  `ranking_config`.
- **D9. Ranking engine.** `lib/ranking/score.ts` is pure + unit-tested
  (`score.test.ts`, 10 cases). The same formula is re-implemented in SQL
  (`0004_ranking.sql` `recompute_ranking()`), driven by cron (spec §4).
- **D10. Funding campaign `type`.** Added `type ∈ {reward, revenue_share}` to
  `funding_campaigns` now (spec §6 memo) so the revenue-share legal question
  can be isolated later. Legal caveat carried as a comment in the seed +
  campaign terms.
- **D11. `supabase/seed/seed.sql` is abridged** (12 teasers vs 24) and exists
  as a reference for provisioned environments. `lib/data/seed.ts` (24 teasers)
  is authoritative for local/demo.
- **D12. Data adapter.** Only the seed adapter is implemented. The Supabase
  read/write adapter throws a descriptive `SupabaseAdapterPending` error until
  built against the migrations — deferred because it cannot be verified
  without a live project.
- **D13. npm audit.** 2 advisories remain, both from `postcss` bundled inside
  `next@15`. Not fixable without upgrading to `next@16` (spec locks 15). Dev
  build-time only; accepted.

---

## Phase 2 — 시청 경험

- **D14. Teaser detail is a full page, not a Next intercepting route.** The
  spec asks for a mobile bottom sheet with an identical deep-link render.
  Intercepting routes across a route-group boundary (`app/(public)/@modal`
  → `app/t/[slug]`) are fragile. Instead `/t/[slug]` is always a full page
  whose chrome (`SheetChrome`) renders as a slide-up sheet on mobile and a
  centered card on desktop — identical render, deep-link safe, one code path.
- **D15. Seed reactions are real rows.** Earlier the seed fabricated large
  `like_count`s with only a few join rows, so the first `recompute_ranking`
  (which counts rows) collapsed every score. Now `lib/data/seed.ts` emits
  actual `likes/saves/shares/comments/view_events` rows (synthetic voter ids
  `sv_NNNN` for volume) and every stat is derived from them — store, cron and
  `syncStats` stay consistent indefinitely. Volumes kept modest (~25–180
  likes/teaser).
- **D16. Korean slugs.** `getTeaserBySlug` matches both the raw and
  `decodeURIComponent`-ed param so Hangul deep links resolve regardless of
  how the client encodes them.
- **D17. Ranking cron.** `GET|POST /api/cron/recompute-ranking` guarded by
  `CRON_SECRET` (bearer or `?secret=`). `?rotatePrev=1` (daily 00:00)
  snapshots `prev_rank`. `vercel.json` schedules both; pg_cron equivalents
  are in `0004_ranking.sql`.
- **D18. Comment likes** persist via `comment_likes` (added
  `/api/comments/[id]/like` + `toggleCommentLike`).

---

## Phase 3 — 창작 & 심사

- **D19. Upload duration is checked twice.** Client reads `HTMLVideoElement.
  duration` from the picked file and blocks "다음" outside 90–240s; the
  server re-validates in `submitTeaser` against `app_settings`
  (`TEASER_MIN/MAX_DURATION_SEC`). Nothing about the limit is hard-coded.
- **D20. Mock upload.** In `mock` video mode the wizard shows a simulated
  progress bar and `POST /api/video/upload-url` returns a sample playback
  URL; poster/thumbnail default to deterministic `picsum` URLs seeded by
  the title (real poster upload is a Phase-later polish). `cloudflare` /
  `supabase` providers return real direct-upload targets.
- **D21. Review auto-publish.** `decideReview` recomputes status on every
  decision: ≥1 reject → `rejected`; approvals ≥ `REVIEW_APPROVALS_REQUIRED`
  → `published` + `published_at` set + creator notified + stats initialised;
  otherwise `in_review`. Decisions are upserted per `(teaser, reviewer)` so
  the same reviewer can't stack approvals — reaching the threshold needs
  distinct reviewers (admins count).
- **D22. Notifications** are generated in the data layer:
  `review_approved` / `review_rejected` (decideReview), `comment` (addComment,
  not for self), `rank_enter` (recomputeRanking, on first entry into Top 10),
  `funding` (pledge). Read/consume via `GET|POST /api/my/notifications`; the
  MY-tab UI lands in Phase 4.
- **D23. Reviewer console** is its own route tree (`/reviewer`) with its own
  chrome + a role gate in `layout.tsx` (reviewer|admin), mirroring `/admin`.

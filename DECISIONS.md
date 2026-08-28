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

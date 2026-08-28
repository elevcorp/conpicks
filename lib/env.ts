/**
 * Central environment access. Never read `process.env` directly elsewhere.
 * All feature switches resolve to safe "runs with zero setup" defaults.
 */

function bool(v: string | undefined, fallback = false): boolean {
  if (v == null || v === "") return fallback;
  return v === "true" || v === "1";
}

export const env = {
  useSupabase: bool(process.env.NEXT_PUBLIC_USE_SUPABASE, false),

  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  videoProvider: (process.env.NEXT_PUBLIC_VIDEO_PROVIDER ?? "mock") as
    | "mock"
    | "supabase"
    | "cloudflare",
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
  cloudflareStreamToken: process.env.CLOUDFLARE_STREAM_API_TOKEN ?? "",
  supabaseVideoBucket: process.env.NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET ?? "teasers",

  enableGoogleOAuth: bool(process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH, true),
  enableKakaoOAuth: bool(process.env.NEXT_PUBLIC_ENABLE_KAKAO_OAUTH, true),

  cronSecret: process.env.CRON_SECRET ?? "dev-cron-secret",

  tossClientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "",
  tossSecretKey: process.env.TOSS_SECRET_KEY ?? "",

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** True when a real Supabase project is configured and enabled. */
export const supabaseEnabled =
  env.useSupabase && !!env.supabaseUrl && !!env.supabaseAnonKey;

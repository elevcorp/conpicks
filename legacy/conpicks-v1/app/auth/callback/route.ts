import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnabled } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** OAuth / magic-link return handler (Supabase mode only). */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (supabaseEnabled && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}

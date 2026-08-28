import "server-only";
import { cookies } from "next/headers";
import { supabaseEnabled } from "@/lib/env";
import { getProfile, upsertProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

export const MOCK_UID_COOKIE = "cp_uid";

/**
 * Resolve the current signed-in user's profile, or null.
 *
 * Mock mode: a `cp_uid` cookie names a seed profile id.
 * Supabase mode: reads the auth session, then the `profiles` row.
 */
export async function getSessionUser(): Promise<Profile | null> {
  if (!supabaseEnabled) {
    const jar = await cookies();
    const uid = jar.get(MOCK_UID_COOKIE)?.value;
    if (!uid) return null;
    return getProfile(uid);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;
  // First login — create a shell profile so onboarding can pick it up.
  return upsertProfile(user.id, {
    nickname: user.email?.split("@")[0] ?? `user_${user.id.slice(0, 6)}`,
  });
}

export async function requireUser(): Promise<Profile> {
  const u = await getSessionUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  return u;
}

export async function requireRole(...roles: Role[]): Promise<Profile> {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw new Error("FORBIDDEN");
  return u;
}

export function isOnboarded(p: Profile | null): boolean {
  return !!p && !!p.onboarded_at;
}

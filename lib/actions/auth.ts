"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MOCK_UID_COOKIE, getSessionUser } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/env";
import { upsertProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

const ONE_YEAR = 60 * 60 * 24 * 365;
const ONBOARDED_COOKIE = "cp_onboarded";

/** Mock-mode: "sign in" as a seed profile. */
export async function mockLogin(uid: string, next = "/") {
  const jar = await cookies();
  jar.set(MOCK_UID_COOKIE, uid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  const user = await upsertProfile(uid, {});
  if (user.onboarded_at) {
    jar.set(ONBOARDED_COOKIE, "1", { sameSite: "lax", path: "/", maxAge: ONE_YEAR });
    redirect(next);
  }
  redirect("/onboarding/role");
}

export async function signOut() {
  const jar = await cookies();
  if (supabaseEnabled) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  jar.delete(MOCK_UID_COOKIE);
  jar.delete(ONBOARDED_COOKIE);
  redirect("/login");
}

/** Step 1 — role picker (viewer | creator only). */
export async function chooseRole(role: Extract<Role, "viewer" | "creator">) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await upsertProfile(user.id, { role });
  redirect(role === "creator" ? "/onboarding/creator" : "/onboarding/profile");
}

/** Step 2 — nickname + avatar. */
export async function saveProfileStep(input: {
  nickname: string;
  avatarUrl?: string;
  bio?: string;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await upsertProfile(user.id, {
    nickname: input.nickname.trim(),
    avatar_url: input.avatarUrl || user.avatar_url,
    bio: input.bio ?? null,
  });
  if (user.role === "creator" && !user.creator_name) {
    redirect("/onboarding/creator");
  }
  await finishOnboarding();
}

/** Creator-only extra step. */
export async function saveCreatorStep(input: {
  creatorName: string;
  portfolioUrl?: string;
  aiTools: string[];
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await upsertProfile(user.id, {
    creator_name: input.creatorName.trim(),
    portfolio_url: input.portfolioUrl || null,
    creator_ai_tools: input.aiTools,
  });
  await finishOnboarding();
}

async function finishOnboarding() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await upsertProfile(user.id, { onboarded_at: new Date().toISOString() });
  const jar = await cookies();
  jar.set(ONBOARDED_COOKIE, "1", { sameSite: "lax", path: "/", maxAge: ONE_YEAR });
  revalidatePath("/", "layout");
  redirect("/");
}

/** MY > 설정 > 창작자로 전환 */
export async function switchToCreator() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await upsertProfile(user.id, { role: "creator" });
  revalidatePath("/", "layout");
  redirect(user.creator_name ? "/upload" : "/onboarding/creator");
}

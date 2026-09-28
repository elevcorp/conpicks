"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getCreatorTeasers, upsertProfile } from "@/lib/data";

export async function editProfile(input: {
  nickname: string;
  bio?: string;
  avatarUrl?: string;
}) {
  const user = await requireUser();
  if (input.nickname.trim().length < 2) throw new Error("닉네임은 2자 이상이어야 합니다.");
  await upsertProfile(user.id, {
    nickname: input.nickname.trim(),
    bio: input.bio ?? null,
    avatar_url: input.avatarUrl || user.avatar_url,
  });
  revalidatePath("/my");
  revalidatePath("/", "layout");
}

/** creator -> viewer, only when no published work exists (spec §2.0). */
export async function switchToViewer() {
  const user = await requireUser();
  if (user.role !== "creator") return;
  const works = await getCreatorTeasers(user.id);
  if (works.some((w) => w.teaser.status === "published")) {
    throw new Error("공개 중인 작품이 있어 시청자로 전환할 수 없어요.");
  }
  await upsertProfile(user.id, { role: "viewer" });
  revalidatePath("/", "layout");
}

"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  addRevenueEntry,
  closeSeason,
  confirmPledge,
  recomputeRanking,
  createCampaign,
  createSeason,
  generatePayouts,
  markPayoutPaid,
  setPostFlags,
  setSeasonStatus,
  setSeasonWinner,
  setUserBanned,
  setUserRole,
  updateCampaign,
  updateRankingConfig,
  updateSetting,
  updateTeaserAdmin,
} from "@/lib/data";
import type { Role } from "@/lib/types";

async function admin() {
  return requireRole("admin");
}
function bust() {
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

// --- teasers ---
export async function adminUpdateTeaser(
  id: string,
  patch: {
    status?: import("@/lib/types").TeaserStatus;
    jimovie_review_url?: string | null;
  },
) {
  await admin();
  await updateTeaserAdmin(id, patch);
  bust();
}

// --- ranking config ---
export async function adminUpdateRankingConfig(patch: {
  w_like?: number;
  w_comment?: number;
  w_share?: number;
  w_save?: number;
  w_complete?: number;
  w_half?: number;
  half_life_hours?: number;
}) {
  const u = await admin();
  await updateRankingConfig(patch, u.id);
  bust();
}
export async function adminRecomputeNow() {
  await admin();
  const r = await recomputeRanking();
  bust();
  return r;
}

// --- settings ---
export async function adminUpdateSetting(key: string, value: string) {
  await admin();
  await updateSetting(key, value);
  bust();
}

// --- seasons ---
export async function adminCreateSeason(input: {
  name: string;
  startsAt: string;
  endsAt: string;
  prizeKrw: number;
  rulesMd: string;
}) {
  await admin();
  await createSeason(input);
  bust();
}
export async function adminSetSeasonStatus(
  id: string,
  status: "draft" | "active" | "closed",
) {
  await admin();
  if (status === "closed") await closeSeason(id);
  else await setSeasonStatus(id, status);
  bust();
}
export async function adminSetWinner(seasonId: string, teaserId: string) {
  await admin();
  await setSeasonWinner(seasonId, teaserId);
  bust();
}

// --- reviewers / users ---
export async function adminSetRole(userId: string, role: Role) {
  await admin();
  await setUserRole(userId, role);
  bust();
}
export async function adminSetBanned(userId: string, banned: boolean) {
  await admin();
  await setUserBanned(userId, banned);
  bust();
}

// --- community moderation ---
export async function adminSetPostFlags(
  id: string,
  flags: { is_hidden?: boolean; is_pinned?: boolean },
) {
  await admin();
  await setPostFlags(id, flags);
  bust();
}

// --- funding ---
export async function adminCreateCampaign(input: {
  teaserId: string;
  type: "reward" | "revenue_share";
  goalKrw: number;
  startsAt: string;
  endsAt: string;
  termsMd: string;
}) {
  await admin();
  await createCampaign(input);
  bust();
}
export async function adminSetCampaignStatus(
  id: string,
  status: import("@/lib/types").FundingStatus,
) {
  await admin();
  await updateCampaign(id, { status });
  bust();
}
export async function adminConfirmPledge(id: string) {
  await admin();
  await confirmPledge(id);
  bust();
}

// --- settlement ---
export async function adminAddRevenue(input: {
  teaserId: string;
  source: string;
  amountKrw: number;
  memo?: string;
}) {
  await admin();
  await addRevenueEntry(input);
  bust();
}
export async function adminGeneratePayouts(campaignId: string, sharePct: number) {
  await admin();
  const r = await generatePayouts(campaignId, sharePct);
  bust();
  return r;
}
export async function adminMarkPaid(payoutId: string) {
  await admin();
  await markPayoutPaid(payoutId);
  bust();
}

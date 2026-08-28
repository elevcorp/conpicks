"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { decideReview } from "@/lib/data";

export async function submitReview(input: {
  teaserId: string;
  decision: "approve" | "reject" | "hold";
  reason?: string;
  scores?: { story?: number; visual?: number; polish?: number };
}) {
  const reviewer = await requireRole("reviewer", "admin");
  if (input.decision === "reject" && !input.reason?.trim()) {
    throw new Error("반려 사유를 입력해 주세요.");
  }
  const result = await decideReview({
    teaserId: input.teaserId,
    reviewerId: reviewer.id,
    decision: input.decision,
    reason: input.reason,
    scores: input.scores,
  });
  revalidatePath("/reviewer");
  return result;
}

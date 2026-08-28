import { z } from "zod";
import { handler, ok, parse, requireUserApi } from "@/lib/api";
import { createPledge } from "@/lib/data";

const Body = z.object({
  campaignId: z.string().min(1),
  amountKrw: z.number().int().min(1000),
});

export const POST = handler(async (req) => {
  const user = await requireUserApi();
  const { campaignId, amountKrw } = await parse(req, Body);
  const pledge = await createPledge({ campaignId, userId: user.id, amountKrw });
  return ok({ pledge }, { status: 201 });
});

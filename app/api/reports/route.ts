import { z } from "zod";
import { handler, ok, parse, requireUserApi } from "@/lib/api";
import { createReport } from "@/lib/data";

const Body = z.object({
  targetType: z.enum(["teaser", "comment", "post", "post_comment"]),
  targetId: z.string().min(1),
  reason: z.string().trim().min(2).max(500),
});

export const POST = handler(async (req) => {
  const user = await requireUserApi();
  const b = await parse(req, Body);
  await createReport({ reporterId: user.id, ...b });
  return ok({ ok: true }, { status: 201 });
});

import { z } from "zod";
import { currentUser, handler, ok, parse } from "@/lib/api";
import { addShare } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };
const Body = z.object({
  channel: z.enum(["kakao", "link", "x", "instagram", "facebook"]).default("link"),
});

export const POST = handler(async (req, { params }: Ctx) => {
  const user = await currentUser();
  const { id } = await params;
  const { channel } = await parse(req, Body);
  return ok(await addShare(id, user?.id ?? null, channel));
});

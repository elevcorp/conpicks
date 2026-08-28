import { z } from "zod";
import { currentUser, handler, ok, parse } from "@/lib/api";
import { addViewEvent } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };
const Body = z.object({
  event: z.enum(["start", "half", "complete"]),
  sessionId: z.string().min(1).max(64),
});

export const POST = handler(async (req, { params }: Ctx) => {
  const user = await currentUser();
  const { id } = await params;
  const { event, sessionId } = await parse(req, Body);
  await addViewEvent(id, sessionId, event, user?.id ?? null);
  return ok({ recorded: event });
});

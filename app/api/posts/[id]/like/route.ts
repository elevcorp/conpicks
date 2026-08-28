import { handler, ok, requireUserApi } from "@/lib/api";
import { togglePostLike } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handler(async (_req, { params }: Ctx) => {
  const user = await requireUserApi();
  const { id } = await params;
  return ok(await togglePostLike(id, user.id));
});

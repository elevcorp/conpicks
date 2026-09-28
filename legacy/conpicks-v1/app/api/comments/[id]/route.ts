import { fail, handler, ok, requireUserApi } from "@/lib/api";
import { deleteComment } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = handler(async (_req, { params }: Ctx) => {
  const user = await requireUserApi();
  const { id } = await params;
  const done = await deleteComment(id, user.id);
  return done ? ok({ deleted: true }) : fail("삭제할 수 없습니다.", 403);
});

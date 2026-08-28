import { z } from "zod";
import { handler, ok, parse, requireUserApi } from "@/lib/api";
import { addPostComment, getPost } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };
const Body = z.object({
  body: z.string().trim().min(1).max(2000),
  parentId: z.string().nullish(),
});

export const GET = handler(async (_req, { params }: Ctx) => {
  const { id } = await params;
  const post = await getPost(id);
  return ok({ items: post?.comments ?? [] });
});

export const POST = handler(async (req, { params }: Ctx) => {
  const user = await requireUserApi();
  const { id } = await params;
  const { body, parentId } = await parse(req, Body);
  const comment = await addPostComment({
    postId: id,
    userId: user.id,
    body,
    parentId: parentId ?? null,
  });
  return ok({ comment }, { status: 201 });
});

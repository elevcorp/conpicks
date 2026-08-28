import { z } from "zod";
import { handler, ok, parse, parseQuery, requireUserApi } from "@/lib/api";
import { addComment, listComments } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

const Query = z.object({ sort: z.enum(["new", "top"]).default("top") });
const Body = z.object({
  body: z.string().trim().min(1).max(1000),
  parentId: z.string().nullable().optional(),
});

export const GET = handler(async (req, { params }: Ctx) => {
  const { id } = await params;
  const { sort } = parseQuery(req.url, Query);
  return ok({ items: await listComments(id, sort) });
});

export const POST = handler(async (req, { params }: Ctx) => {
  const user = await requireUserApi();
  const { id } = await params;
  const { body, parentId } = await parse(req, Body);
  const comment = await addComment({
    teaserId: id,
    userId: user.id,
    body,
    parentId: parentId ?? null,
  });
  return ok({ comment }, { status: 201 });
});

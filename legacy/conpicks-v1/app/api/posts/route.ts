import { z } from "zod";
import { handler, ok, parse, parseQuery, requireUserApi } from "@/lib/api";
import { createPost, listPosts } from "@/lib/data";

const CATEGORIES = ["작품 토론", "AI 제작 팁", "크리에이터 라운지", "공지"] as const;

const Query = z.object({
  category: z
    .enum(["전체", ...CATEGORIES] as [string, ...string[]])
    .default("전체"),
  sort: z.enum(["hot", "new"]).default("hot"),
  cursor: z.string().nullish(),
  limit: z.coerce.number().min(1).max(40).default(20),
});

export const GET = handler(async (req) => {
  const p = parseQuery(req.url, Query);
  return ok(
    await listPosts({
      category: p.category as never,
      sort: p.sort,
      cursor: p.cursor ?? null,
      limit: p.limit,
    }),
  );
});

const Body = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().trim().min(1).max(120),
  bodyMd: z.string().trim().max(20000),
  images: z.array(z.string().url()).max(4).default([]),
  attachedTeaserId: z.string().nullish(),
});

export const POST = handler(async (req) => {
  const user = await requireUserApi();
  const b = await parse(req, Body);
  if (b.category === "크리에이터 라운지" && user.role === "viewer") {
    return ok({ error: "크리에이터 라운지는 승인된 창작자만 글을 쓸 수 있어요." }, { status: 403 });
  }
  if (b.category === "공지" && user.role !== "admin") {
    return ok({ error: "공지는 운영자만 작성할 수 있어요." }, { status: 403 });
  }
  const post = await createPost({
    authorId: user.id,
    category: b.category,
    title: b.title,
    bodyMd: b.bodyMd,
    images: b.images,
    attachedTeaserId: b.attachedTeaserId ?? null,
  });
  return ok({ post }, { status: 201 });
});

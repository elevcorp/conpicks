import { z } from "zod";
import { handler, ok, parseQuery } from "@/lib/api";
import { getFeed } from "@/lib/data";

const Query = z.object({
  sort: z.enum(["rank", "new", "random"]).default("rank"),
  cursor: z.string().nullish(),
  limit: z.coerce.number().min(1).max(20).default(8),
});

export const GET = handler(async (req) => {
  const { sort, cursor, limit } = parseQuery(req.url, Query);
  return ok(await getFeed({ sort, cursor: cursor ?? null, limit }));
});

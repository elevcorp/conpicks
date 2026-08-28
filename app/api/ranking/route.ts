import { z } from "zod";
import { handler, ok, parseQuery } from "@/lib/api";
import { getActiveSeason, listTeasers } from "@/lib/data";

const Query = z.object({
  season: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const GET = handler(async (req) => {
  const { season, limit } = parseQuery(req.url, Query);
  const s = season ?? (await getActiveSeason()).id;
  const { items } = await listTeasers({
    sort: "rank",
    season: s,
    status: "published",
    limit,
  });
  return ok({
    season: s,
    items: items.map((v) => ({
      teaser_id: v.teaser.id,
      slug: v.teaser.slug,
      title: v.teaser.title,
      rank: v.stats.rank,
      prev_rank: v.stats.prev_rank,
      delta: v.rankDelta,
      score: v.stats.score,
    })),
  });
});

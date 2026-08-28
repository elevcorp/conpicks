import { z } from "zod";
import { handler, ok, parse, parseQuery, requireUserApi } from "@/lib/api";
import { listTeasers, submitTeaser } from "@/lib/data";
import { GENRES } from "@/lib/types";

const Query = z.object({
  sort: z.enum(["rank", "new", "share", "save"]).default("rank"),
  genre: z.enum(GENRES as [string, ...string[]]).optional(),
  season: z.string().optional(),
  q: z.string().optional(),
  cursor: z.string().nullish(),
  limit: z.coerce.number().min(1).max(48).default(12),
});

export const GET = handler(async (req) => {
  const p = parseQuery(req.url, Query);
  return ok(
    await listTeasers({
      sort: p.sort,
      genre: p.genre as never,
      season: p.season,
      q: p.q,
      cursor: p.cursor ?? null,
      limit: p.limit,
    }),
  );
});

const SubmitBody = z.object({
  title: z.string().trim().min(1).max(60),
  logline: z.string().trim().max(120),
  synopsis: z.string().trim().max(1000),
  genres: z.array(z.enum(GENRES as [string, ...string[]])).min(1).max(2),
  tags: z.array(z.string().trim().min(1)).max(5),
  durationSec: z.number().int().min(1).max(3600),
  aiTools: z.array(z.string()).max(20),
  credits: z.string().max(500).default(""),
  posterUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  playbackUrl: z.string().url(),
  videoProvider: z.string().default("mock"),
  videoId: z.string().default(""),
});

export const POST = handler(async (req) => {
  const user = await requireUserApi();
  if (user.role !== "creator" && user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  const b = await parse(req, SubmitBody);
  const teaser = await submitTeaser({
    creatorId: user.id,
    title: b.title,
    logline: b.logline,
    synopsis: b.synopsis,
    genres: b.genres as never,
    tags: b.tags,
    durationSec: b.durationSec,
    aiTools: b.aiTools,
    credits: b.credits,
    posterUrl: b.posterUrl,
    thumbnailUrl: b.thumbnailUrl,
    playbackUrl: b.playbackUrl,
    videoProvider: b.videoProvider,
    videoId: b.videoId,
  });
  return ok({ teaser }, { status: 201 });
});

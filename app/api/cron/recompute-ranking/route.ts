import { env } from "@/lib/env";
import { fail, handler, ok } from "@/lib/api";
import { recomputeRanking } from "@/lib/data";

/**
 * Ranking recompute. Called every 5 min (Vercel Cron / pg_cron).
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `?secret=`.
 * Pass `?rotatePrev=1` (once daily at midnight) to snapshot prev_rank.
 */
async function run(req: Request) {
  const url = new URL(req.url);
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = bearer || url.searchParams.get("secret");
  if (secret !== env.cronSecret) return fail("unauthorized", 401);

  const rotatePrevRank = url.searchParams.get("rotatePrev") === "1";
  const result = await recomputeRanking({ rotatePrevRank });
  return ok({ ...result, rotatePrevRank, at: new Date().toISOString() });
}

export const GET = handler((req) => run(req));
export const POST = handler((req) => run(req));

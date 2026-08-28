import { env } from "@/lib/env";
import { fail, handler, ok } from "@/lib/api";
import { recomputeRanking } from "@/lib/data";

/**
 * Ranking recompute.
 *  - Vercel Hobby: once daily via vercel.json (`?rotatePrev=1`).
 *  - Vercel Pro / pg_cron / self-host: run every 5 minutes for live
 *    ranking (add a second cron entry with a 5-minute schedule).
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `?secret=`, or the
 * `x-vercel-cron` header when CRON_SECRET is left at its default.
 */
async function run(req: Request) {
  const url = new URL(req.url);
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = bearer || url.searchParams.get("secret");

  // Vercel Cron sends this header on every scheduled invocation. Accept it
  // when no custom CRON_SECRET has been configured (still allows a
  // deploy-time secret to lock the route down).
  const isVercelCron =
    req.headers.get("x-vercel-cron") != null ||
    (req.headers.get("user-agent") ?? "").includes("vercel-cron");

  if (
    secret !== env.cronSecret &&
    !(isVercelCron && env.cronSecret === "dev-cron-secret")
  ) {
    return fail("unauthorized", 401);
  }

  const rotatePrevRank = url.searchParams.get("rotatePrev") === "1";
  const result = await recomputeRanking({ rotatePrevRank });
  return ok({ ...result, rotatePrevRank, at: new Date().toISOString() });
}

export const GET = handler((req) => run(req));
export const POST = handler((req) => run(req));

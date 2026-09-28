import { handler, ok } from "@/lib/api";
import { getHomeBundle } from "@/lib/data";

/** Home row bundle (spec §7). SSR-cached 60s at the page level. */
export const revalidate = 60;

export const GET = handler(async () => {
  return ok(await getHomeBundle());
});

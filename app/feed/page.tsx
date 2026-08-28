import { getSessionUser } from "@/lib/auth";
import { getFeed } from "@/lib/data";
import { SwipeFeed } from "./SwipeFeed";

export const metadata = { title: "바로 넘겨보기" };

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: "rank" | "new" | "random" }>;
}) {
  const { sort = "rank" } = await searchParams;
  const [user, first] = await Promise.all([
    getSessionUser(),
    getFeed({ sort, limit: 8 }),
  ]);

  return (
    <SwipeFeed
      initialItems={first.items}
      initialCursor={first.nextCursor}
      sort={sort}
      loggedIn={!!user}
      currentUserId={user?.id ?? null}
    />
  );
}

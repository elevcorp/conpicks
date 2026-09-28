import { Feed } from "@/components/film/Feed";
import { films, getFilmComments } from "@/lib/data";

export const metadata = { title: "피드" };

export default function FeedPage() {
  const comments = Object.fromEntries(films.map((f) => [f.id, getFilmComments(f.id)]));
  return (
    <main>
      <Feed films={films} comments={comments} />
    </main>
  );
}

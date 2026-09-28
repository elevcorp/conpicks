import { notFound } from "next/navigation";
import { TeaserDetail } from "@/components/film/TeaserDetail";
import { films, getFilm, getFilmComments, getWebtoon } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => films.map((f) => ({ id: f.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const f = getFilm((await params).id);
  return { title: f?.title, description: f?.logline };
}

export default async function TeaserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const film = getFilm(id);
  if (!film) notFound();
  const similar = films.filter((f) => f.id !== id && f.genres.some((g) => film.genres.includes(g))).slice(0, 4);
  return (
    <TeaserDetail
      film={film}
      origin={film.originWebtoonId ? getWebtoon(film.originWebtoonId) : undefined}
      comments={getFilmComments(id)}
      similar={similar}
    />
  );
}

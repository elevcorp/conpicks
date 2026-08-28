import { notFound } from "next/navigation";
import Link from "next/link";
import { listTeasers } from "@/lib/data";
import { GENRES, type Genre } from "@/lib/types";
import { TeaserGrid } from "@/components/teaser/TeaserGrid";

export async function generateStaticParams() {
  return GENRES.map((genre) => ({ genre: encodeURIComponent(genre) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  return { title: `${decodeURIComponent(genre)} 장르` };
}

const SORTS = [
  ["rank", "랭킹"],
  ["new", "최신"],
  ["share", "공유"],
  ["save", "저장"],
] as const;

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { genre: raw } = await params;
  const genre = decodeURIComponent(raw) as Genre;
  if (!GENRES.includes(genre)) notFound();

  const { sort = "rank" } = await searchParams;
  const s = sort as "rank" | "new" | "share" | "save";
  const { items, nextCursor } = await listTeasers({
    genre,
    sort: s,
    limit: 12,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">{genre}</h1>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {SORTS.map(([key, label]) => (
          <Link
            key={key}
            href={`/discover/${encodeURIComponent(genre)}?sort=${key}`}
            className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
              s === key
                ? "border-brand-gradient text-text-primary"
                : "border-border text-text-secondary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <TeaserGrid
        initialItems={items}
        initialCursor={nextCursor}
        query={{ genre, sort: s }}
        showRank={s === "rank"}
      />
    </div>
  );
}

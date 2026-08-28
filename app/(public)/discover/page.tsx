import { listCollections, listTeasers } from "@/lib/data";
import { GENRES } from "@/lib/types";
import { SearchBar } from "@/components/discover/SearchBar";
import { GenreTile } from "@/components/discover/GenreTile";
import { TeaserGrid } from "@/components/teaser/TeaserGrid";
import { TeaserRow } from "@/components/teaser/TeaserRow";

export const metadata = { title: "탐색" };

const SORT_LABEL: Record<string, string> = {
  rank: "랭킹순",
  new: "최신순",
  share: "공유순",
  save: "저장순",
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const isResults = !!q || !!sort;

  if (isResults) {
    const s = (sort ?? "rank") as "rank" | "new" | "share" | "save";
    const { items, nextCursor } = await listTeasers({ sort: s, q, limit: 12 });
    return (
      <div className="space-y-4">
        <SearchBar defaultValue={q ?? ""} />
        <h1 className="text-base font-bold">
          {q ? `“${q}” 검색 결과` : SORT_LABEL[s]}{" "}
          <span className="text-text-muted">({items.length}+)</span>
        </h1>
        <TeaserGrid
          initialItems={items}
          initialCursor={nextCursor}
          query={{ ...(q ? { q } : {}), sort: s }}
          showRank={s === "rank"}
        />
      </div>
    );
  }

  const collections = await listCollections();
  const previews = await Promise.all(
    GENRES.map(async (g) => {
      const { items } = await listTeasers({ genre: g, sort: "rank", limit: 1 });
      return items[0]
        ? { poster: items[0].teaser.poster_url, video: items[0].teaser.playback_url }
        : null;
    }),
  );

  return (
    <div className="space-y-6">
      <SearchBar />
      <section className="space-y-3">
        <h1 className="text-base font-bold">장르</h1>
        <div className="grid grid-cols-2 gap-3">
          {GENRES.map((g, i) => (
            <GenreTile key={g} genre={g} preview={previews[i]} />
          ))}
        </div>
      </section>

      {collections.map((c) => (
        <TeaserRow
          key={c.id}
          title={c.title}
          items={c.items}
          href={`/discover?sort=rank`}
        />
      ))}
    </div>
  );
}

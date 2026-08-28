import Link from "next/link";
import { listAllTeasersAdmin } from "@/lib/data";
import { TeaserAdminRow } from "./TeaserAdminRow";

export const metadata = { title: "작품 관리" };

export default async function AdminTeasersPage() {
  const rows = await listAllTeasersAdmin();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">작품 관리 ({rows.length})</h1>
      <ul className="space-y-2">
        {rows.map(({ teaser, stats, creator }) => (
          <li
            key={teaser.id}
            className="rounded-xl border border-border bg-bg-elevated p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/t/${teaser.slug}`}
                className="text-sm font-bold hover:underline"
              >
                {teaser.title}
              </Link>
              <span className="text-[11px] text-text-muted">
                {creator.nickname} · {stats.rank > 0 ? `${stats.rank}위` : "—"} ·
                ♥{stats.like_count}
              </span>
            </div>
            <TeaserAdminRow
              id={teaser.id}
              status={teaser.status}
              jimovieUrl={teaser.jimovie_review_url ?? ""}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

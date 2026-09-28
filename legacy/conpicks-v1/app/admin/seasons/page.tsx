import { listSeasons, listTeasers } from "@/lib/data";
import { krw } from "@/lib/format";
import { SeasonControls, SeasonCreate } from "./SeasonControls";

export const metadata = { title: "시즌 관리" };

export default async function AdminSeasonsPage() {
  const seasons = await listSeasons();
  const active = seasons.find((s) => s.status === "active");
  const top = active
    ? (await listTeasers({ sort: "rank", season: active.id, limit: 10 })).items
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold">시즌 관리</h1>

      <ul className="space-y-3">
        {seasons.map((s) => (
          <li
            key={s.id}
            className="space-y-2 rounded-xl border border-border bg-bg-elevated p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-bold">{s.name}</p>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {s.starts_at.slice(0, 10)} ~ {s.ends_at.slice(0, 10)} · 상금{" "}
              {krw(s.prize_krw)}
              {s.winner_teaser_id && " · 우승작 확정"}
            </p>
            <SeasonControls
              seasonId={s.id}
              status={s.status}
              top={
                s.id === active?.id
                  ? top.map((t) => ({ id: t.teaser.id, title: t.teaser.title, rank: t.stats.rank }))
                  : []
              }
              winnerId={s.winner_teaser_id}
            />
          </li>
        ))}
      </ul>

      <section className="space-y-3 rounded-xl border border-border bg-bg-elevated p-4">
        <h2 className="text-sm font-bold">새 시즌 만들기</h2>
        <SeasonCreate />
      </section>
    </div>
  );
}

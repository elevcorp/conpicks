"use client";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { BackButton } from "./Nav";
import { ParamSync } from "./ParamSync";
import { WorkCover, FilmCover } from "./Covers";
import { EmptyState } from "./EmptyState";
import { films, webtoons } from "@/lib/catalog";
import { cn } from "@/lib/cn";

const POPULAR = ["템빨", "북부 대공", "대환영", "회귀", "무협", "조선의 아이돌", "스트리밍", "로판", "지무비", "Eddington"];

export function SearchPanel() {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>(["북부", "대환영", "SF"]);
  const sync = useCallback((p: URLSearchParams) => setQ(p.get("q") ?? ""), []);
  const term = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return null;
    const t = term.replace(/^#/, "");
    const wt = webtoons.filter((w) => [w.title, w.author, w.genre, w.tagline, ...w.keywords].some((s) => s.toLowerCase().includes(t)) || (t.includes("지무비") && w.jimovieReview));
    const fm = films.filter((f) => [f.title, f.creator, f.genre, f.logline, ...f.genres].some((s) => s.toLowerCase().includes(t)) || (t.includes("지무비") && f.jimovieReview));
    return { wt, fm };
  }, [term]);

  const commit = (v: string) => {
    setQ(v);
    if (v.trim()) setRecent((r) => [v.trim(), ...r.filter((x) => x !== v.trim())].slice(0, 8));
  };

  return (
    <div className="mx-auto max-w-[900px]">
      <ParamSync onChange={sync} />
      <div className="sticky top-0 z-40 flex items-center gap-2 bg-[var(--nav)] px-4 pb-3 pt-[calc(10px+env(safe-area-inset-top))] backdrop-blur-xl md:top-16 md:px-6 md:pt-6">
        <BackButton fallback="/" className="md:hidden" />
        <div className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-chip px-3.5">
          <Search size={18} className="text-fg-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit(q)}
            placeholder="작품, 작가, 키워드로 검색"
            className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg-3"
            aria-label="검색어"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="지우기" className="grid size-6 place-items-center rounded-full bg-fg-3/40 text-bg">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-24 md:px-6">
        {!results ? (
          <>
            {recent.length > 0 && (
              <section className="pt-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <h2 className="text-[15px] font-bold">최근 검색어</h2>
                  <button onClick={() => setRecent([])} className="text-[13px] text-fg-3">전체 삭제</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <span key={r} className="flex h-9 items-center gap-1.5 rounded-full border border-line pl-3.5 pr-2 text-[14px]">
                      <button onClick={() => commit(r)}>{r}</button>
                      <button onClick={() => setRecent((x) => x.filter((y) => y !== r))} aria-label={`${r} 삭제`} className="text-fg-3"><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </section>
            )}
            <section className="pt-8">
              <h2 className="mb-2 flex items-center gap-1.5 text-[15px] font-bold">
                <TrendingUp size={17} className="text-brand" /> 지금 많이 찾는 검색어
              </h2>
              <ol className="grid grid-cols-2 gap-x-6">
                {POPULAR.map((p, i) => (
                  <li key={p}>
                    <button onClick={() => commit(p)} className="flex h-11 w-full items-center gap-3 text-left text-[15px]">
                      <span className={cn("w-4 font-black italic", i < 3 ? "text-brand" : "text-fg-3")}>{i + 1}</span>
                      <span className="truncate">{p}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          </>
        ) : results.wt.length + results.fm.length === 0 ? (
          <EmptyState icon={<Search size={26} />} title={`'${q}' 검색 결과가 없어요`} desc="다른 키워드로 검색해 보세요" />
        ) : (
          <>
            {results.wt.length > 0 && (
              <section className="pt-4">
                <h2 className="mb-2 text-[15px] font-bold">웹툰 <span className="text-fg-3">{results.wt.length}</span></h2>
                <ul>
                  {results.wt.map((w) => (
                    <li key={w.id}>
                      <Link href={`/work/${w.id}`} className="flex items-center gap-3 rounded-xl py-2 hover:bg-chip">
                        <div className="relative aspect-[3/5] w-14 shrink-0 overflow-hidden rounded-md"><WorkCover work={w} className="absolute inset-0" sizes="56px" /></div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-bold">{w.title}</p>
                          <p className="truncate text-[12.5px] text-fg-3">{w.author} · {w.genre} · {w.league === "league" ? "신작 리그" : "정식 연재"}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {results.fm.length > 0 && (
              <section className="pt-6">
                <h2 className="mb-2 text-[15px] font-bold">AI 영화 티저 <span className="text-fg-3">{results.fm.length}</span></h2>
                <ul>
                  {results.fm.map((f) => (
                    <li key={f.id}>
                      <Link href={`/film/work/${f.id}`} className="flex items-center gap-3 rounded-xl py-2 hover:bg-chip">
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md"><FilmCover film={f} className="absolute inset-0" sizes="96px" /></div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-bold">{f.title}</p>
                          <p className="truncate text-[12.5px] text-fg-3">{f.creator} · {f.genre} · {f.runtime}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

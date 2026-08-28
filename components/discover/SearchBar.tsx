"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/discover?q=${encodeURIComponent(t)}` : "/discover");
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="제목 · 크리에이터 · 태그 검색"
        className="h-11 w-full rounded-xl border border-border bg-bg-elevated pr-9 pl-9 text-sm outline-none focus:border-brand-accent"
      />
      {q && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push("/discover");
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted"
          aria-label="지우기"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

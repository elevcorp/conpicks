"use client";

import { useCallbackRef } from "@/lib/use-callback-ref";
import { useState } from "react";
import type { TeaserCardVM } from "@/lib/types";
import { EmptyState } from "@/components/common/EmptyState";
import { TeaserCard } from "./TeaserCard";

interface Props {
  initialItems: TeaserCardVM[];
  initialCursor: string | null;
  query: Record<string, string>;
  showRank?: boolean;
}

/** 2-col poster grid with cursor-based infinite scroll against /api/teasers. */
export function TeaserGrid({
  initialItems,
  initialCursor,
  query,
  showRank,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(!initialCursor);

  async function more() {
    if (loading || done) return;
    setLoading(true);
    const params = new URLSearchParams({ ...query, ...(cursor ? { cursor } : {}) });
    const res = await fetch(`/api/teasers?${params}`);
    const json = await res.json();
    setItems((cur) => [...cur, ...(json.items ?? [])]);
    setCursor(json.nextCursor);
    if (!json.nextCursor) setDone(true);
    setLoading(false);
  }

  const sentinel = useCallbackRef<HTMLDivElement>((node) => {
    if (!node) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && more());
    io.observe(node);
    return () => io.disconnect();
  });

  if (items.length === 0) {
    return (
      <EmptyState
        title="결과가 없어요"
        description="다른 키워드나 필터를 시도해 보세요."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((vm) => (
          <TeaserCard key={vm.teaser.id} vm={vm} showRank={showRank} />
        ))}
      </div>
      <div ref={sentinel} className="h-10" />
      {loading && (
        <p className="py-4 text-center text-sm text-text-muted">불러오는 중…</p>
      )}
    </>
  );
}

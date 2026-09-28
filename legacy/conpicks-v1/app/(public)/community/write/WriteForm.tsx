"use client";

import { Film, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Role, TeaserCardVM } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = ["작품 토론", "AI 제작 팁", "크리에이터 라운지", "공지"] as const;

export function WriteForm({ role }: { role: Role }) {
  const router = useRouter();
  const categories = ALL.filter(
    (c) =>
      (c !== "공지" || role === "admin") &&
      (c !== "크리에이터 라운지" || role === "creator" || role === "admin"),
  );
  const [category, setCategory] = useState<(typeof ALL)[number]>(categories[0]);
  const [title, setTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [attached, setAttached] = useState<TeaserCardVM | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TeaserCardVM[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (q.trim().length < 1) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/teasers?q=${encodeURIComponent(q)}&limit=6`,
      );
      const j = await res.json();
      setResults(j.items ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function submit() {
    if (!title.trim() || !bodyMd.trim()) {
      toast.error("제목과 본문을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title: title.trim(),
        bodyMd: bodyMd.trim(),
        attachedTeaserId: attached?.teaser.id ?? null,
      }),
    });
    setSubmitting(false);
    const j = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/community/${j.post.id}`);
    else toast.error(j.error ?? "등록에 실패했어요.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              category === c
                ? "border-brand-gradient text-text-primary"
                : "border-border text-text-secondary",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label>제목</Label>
        <Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>본문 (마크다운 라이트)</Label>
        <Textarea
          value={bodyMd}
          onChange={(e) => setBodyMd(e.target.value)}
          rows={8}
          placeholder="**굵게**, - 목록, > 인용 정도만 지원돼요."
        />
      </div>

      <div className="space-y-2">
        <Label>티저 첨부 (선택)</Label>
        {attached ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-2.5">
            <Film className="h-4 w-4 text-brand-accent" />
            <span className="flex-1 text-sm font-medium">
              {attached.teaser.title}
            </span>
            <button onClick={() => setAttached(null)} aria-label="첨부 취소">
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>
        ) : (
          <>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="작품 제목으로 검색"
            />
            {results.length > 0 && (
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {results.map((r) => (
                  <li key={r.teaser.id}>
                    <button
                      onClick={() => {
                        setAttached(r);
                        setQ("");
                        setResults([]);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"
                    >
                      {r.teaser.title}{" "}
                      <span className="text-text-muted">
                        · {r.creator.nickname}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <Button className="w-full" size="lg" disabled={submitting} onClick={submit}>
        {submitting ? "등록 중…" : "등록"}
      </Button>
    </div>
  );
}

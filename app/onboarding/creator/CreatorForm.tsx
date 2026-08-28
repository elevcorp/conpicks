"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCreatorStep } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const AI_TOOLS = [
  "Sora",
  "Runway Gen-3",
  "Kling",
  "Luma Dream Machine",
  "Midjourney",
  "Pika",
  "Veo",
  "Stable Diffusion",
  "Suno",
];

export function CreatorForm({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [portfolio, setPortfolio] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function toggle(t: string) {
    setTools((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("활동명을 입력하세요.");
    if (tools.length === 0) return setErr("사용하는 AI 툴을 1개 이상 선택하세요.");
    setErr(null);
    start(() =>
      saveCreatorStep({
        creatorName: name,
        portfolioUrl: portfolio || undefined,
        aiTools: tools,
      }),
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="cname">활동명</Label>
        <Input
          id="cname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pf">포트폴리오 링크 (선택)</Label>
        <Input
          id="pf"
          type="url"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          placeholder="https://"
        />
      </div>
      <div className="space-y-2">
        <Label>사용하는 AI 툴</Label>
        <div className="flex flex-wrap gap-2">
          {AI_TOOLS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                tools.includes(t)
                  ? "border-brand-gradient text-text-primary"
                  : "border-border bg-bg-elevated text-text-secondary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="text-sm text-danger">{err}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "저장 중…" : "완료하고 시작하기"}
      </Button>
    </form>
  );
}

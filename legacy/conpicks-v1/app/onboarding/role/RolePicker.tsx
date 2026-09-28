"use client";

import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { chooseRole } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    role: "viewer" as const,
    emoji: "🍿",
    title: "AI 영화를 발견하고 흥행을 결정하세요",
    desc: "티저를 보고 좋아요·공유·펀딩으로 우승작을 만듭니다.",
  },
  {
    role: "creator" as const,
    emoji: "🎬",
    title: "내 AI 영화를 세상에 공개하세요",
    desc: "2~3분 티저를 올리고 랭킹·상금·제작지원에 도전합니다.",
  },
];

export function RolePicker() {
  const [selected, setSelected] = useState<"viewer" | "creator" | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        {CARDS.map((c) => {
          const active = selected === c.role;
          return (
            <button
              key={c.role}
              type="button"
              onClick={() => setSelected(c.role)}
              className={cn(
                "relative flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all",
                active
                  ? "border-brand-gradient scale-[1.02]"
                  : "border-border bg-bg-elevated hover:bg-white/5",
              )}
            >
              {active && (
                <span className="bg-brand-gradient absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full text-white">
                  <Check className="h-4 w-4" />
                </span>
              )}
              <span className="text-4xl">{c.emoji}</span>
              <span className="text-base font-bold">{c.title}</span>
              <span className="text-sm text-text-secondary">{c.desc}</span>
            </button>
          );
        })}
      </div>
      <Button
        className="w-full"
        size="lg"
        disabled={!selected || pending}
        onClick={() => selected && start(() => chooseRole(selected))}
      >
        계속하기
      </Button>
    </div>
  );
}

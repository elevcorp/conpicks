"use client";
import Image from "next/image";
import { SceneArt, type CutMode } from "@/components/common/SceneArt";
import { cutSrc } from "@/lib/assets";
import { cn } from "@/lib/cn";
import type { Episode, Webtoon } from "@/lib/types";

const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[16/10]", "aspect-[4/5]", "aspect-[5/6]", "aspect-[3/4]", "aspect-[1/1.25]"];
const MODES: CutMode[] = ["scene", "scene", "closeup", "scene", "impact", "scene", "closeup", "scene"];

/**
 * Webtoon episode body: tall cuts with narration lines between them — the
 * vertical-scroll grammar. Real files at /public/cuts/cut_{id}_{n}.jpg win.
 */
export function EpisodeReader({ work, episode, className }: { work: Webtoon; episode: Episode; className?: string }) {
  const n = episode.cutCount;
  // Spread narrations evenly between cuts; first narration opens the episode.
  const narrAt = new Map<number, string>();
  episode.narrations.forEach((t, i) => narrAt.set(Math.round((i * n) / episode.narrations.length), t));
  const dlgAt = new Map<number, string>();
  episode.dialogues.forEach((t, i) => dlgAt.set(Math.min(n - 1, 1 + i * 2), t));

  return (
    <div className={cn("mx-auto w-full max-w-[720px]", className)}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i}>
          {narrAt.has(i) && <Narration text={narrAt.get(i)!} />}
          <Cut work={work} ep={episode.ep} index={i} dialogue={dlgAt.get(i)} />
        </div>
      ))}
      <div className="py-16 text-center text-[13px] font-semibold tracking-[0.3em] opacity-40">— {episode.ep}화 끝 —</div>
    </div>
  );
}

function Narration({ text }: { text: string }) {
  return (
    <p className="mx-auto max-w-[520px] px-8 py-14 text-center text-[16px] font-medium leading-[1.9] md:py-20 md:text-[18px]" style={{ wordBreak: "keep-all" }}>
      {text}
    </p>
  );
}

function Cut({ work, ep, index, dialogue }: { work: Webtoon; ep: number; index: number; dialogue?: string }) {
  const real = cutSrc(work.id, (index % 8) + 1);
  const aspect = ASPECTS[(index + ep) % ASPECTS.length];
  if (real) {
    return <Image src={real} alt={`${work.title} ${ep}화 ${index + 1}컷`} width={800} height={1200} sizes="(max-width: 768px) 100vw, 720px" className="h-auto w-full" />;
  }
  const mode = MODES[(index + ep) % MODES.length];
  const left = index % 2 === 0;
  return (
    <div className={cn("relative w-full overflow-hidden", aspect, index > 0 && "mt-2")}>
      <SceneArt seed={`${work.id}-${ep}-${index}`} theme={work.themeColor} genre={work.genreKey} variant="cut" mode={mode} className="absolute inset-0 h-full w-full" />
      <div className="grain pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" />
      {dialogue && (
        <div className={cn("absolute top-[9%] max-w-[62%]", left ? "left-[7%]" : "right-[7%]")}>
          <div className="relative rounded-[48%] bg-white px-5 py-3.5 text-center text-[14px] font-bold leading-snug text-[#111] shadow-[0_4px_18px_rgba(0,0,0,0.35)] md:text-[16px]" style={{ wordBreak: "keep-all" }}>
            {dialogue}
            <span className={cn("absolute -bottom-2 size-4 rotate-45 bg-white", left ? "left-[30%]" : "right-[30%]")} />
          </div>
        </div>
      )}
    </div>
  );
}

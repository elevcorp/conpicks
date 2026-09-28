"use client";
import Image from "next/image";
import { SceneArt, type CutMode } from "@/components/common/SceneArt";
import { coverSrc, cutsFor, sizeOf } from "@/lib/assets";
import { rng } from "@/lib/seed";
import { cn } from "@/lib/cn";
import type { Episode, Webtoon } from "@/lib/types";

const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[16/10]", "aspect-[4/5]", "aspect-[5/6]", "aspect-[3/4]", "aspect-[1/1.25]"];
const MODES: CutMode[] = ["scene", "scene", "closeup", "scene", "impact", "scene", "closeup", "scene"];
const WINDOW = 7;

/** Pages for an episode when a work has real pages: ep 1 reads them all, later eps reuse a rolling window. */
export function pagesForEpisode(workId: string, ep: number): string[] {
  const pages = cutsFor(workId);
  if (!pages.length) return [];
  if (ep === 1 || pages.length <= WINDOW) return pages;
  const start = ((ep - 2) * WINDOW) % pages.length;
  return Array.from({ length: WINDOW }, (_, i) => pages[(start + i) % pages.length]);
}

/**
 * Webtoon episode body. Priority:
 * 1) real pages at /public/cuts/cut_{id}_{n} — shown as-is (text is in the art);
 * 2) real cover → panels cropped/zoomed from the cover art + narration & bubbles;
 * 3) procedural SceneArt panels.
 */
export function EpisodeReader({ work, episode, className }: { work: Webtoon; episode: Episode; className?: string }) {
  const pages = pagesForEpisode(work.id, episode.ep);
  if (pages.length) {
    return (
      <div className={cn("mx-auto w-full max-w-[720px] bg-white", className)}>
        {pages.map((src, i) => {
          const [w, h] = sizeOf(src) ?? [600, 1600];
          return (
            <Image key={`${src}-${i}`} src={src} alt={`${work.title} ${episode.ep}화 ${i + 1}`} width={w} height={h}
              sizes="(max-width: 768px) 100vw, 720px" className="block h-auto w-full" priority={i < 2} />
          );
        })}
        <div className="bg-bg py-16 text-center text-[13px] font-semibold tracking-[0.3em] opacity-40">— {episode.ep}화 끝 —</div>
      </div>
    );
  }

  const n = episode.cutCount;
  // Spread narrations evenly between cuts; first narration opens the episode.
  const narrAt = new Map<number, string>();
  episode.narrations.forEach((t, i) => narrAt.set(Math.round((i * n) / episode.narrations.length), t));
  const dlgAt = new Map<number, string>();
  episode.dialogues.forEach((t, i) => dlgAt.set(Math.min(n - 1, 1 + i * 2), t));
  const cover = coverSrc(work.id);

  return (
    <div className={cn("mx-auto w-full max-w-[720px]", className)}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i}>
          {narrAt.has(i) && <Narration text={narrAt.get(i)!} />}
          <Cut work={work} ep={episode.ep} index={i} dialogue={dlgAt.get(i)} cover={cover} />
        </div>
      ))}
      <div className="py-16 text-center text-[13px] font-semibold tracking-[0.3em] opacity-40">— {episode.ep}화 끝 —</div>
    </div>
  );
}

function Narration({ text }: { text: string }) {
  return (
    <p className="mx-auto max-w-[520px] px-8 py-14 text-center text-[16px] font-medium leading-[1.9] md:py-20 md:text-[18px]">
      {text}
    </p>
  );
}

/** A panel "shot" from the cover: seeded zoom + focal point, like a camera moving over the art. */
export function CoverCrop({ src, seed, className, sizes = "(max-width: 768px) 100vw, 720px" }: { src: string; seed: string; className?: string; sizes?: string }) {
  const r = rng(seed);
  const zoom = 1.04 + r() * 0.3; // modest: cover art is ~520px wide
  const x = Math.round(20 + r() * 60);
  const y = Math.round(8 + r() * 62); // stay above the baked-in title band
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom.toFixed(2)})`, transformOrigin: `${x}% ${y}%` }}
      />
    </div>
  );
}

function Cut({ work, ep, index, dialogue, cover }: { work: Webtoon; ep: number; index: number; dialogue?: string; cover: string | null }) {
  const aspect = ASPECTS[(index + ep) % ASPECTS.length];
  const mode = MODES[(index + ep) % MODES.length];
  const left = index % 2 === 0;
  return (
    <div className={cn("relative w-full overflow-hidden", aspect, index > 0 && "mt-2")}>
      {cover ? (
        <>
          <CoverCrop src={cover} seed={`${work.id}-${ep}-${index}`} className="absolute inset-0" />
          {mode === "impact" && (
            <SceneArt seed={`${work.id}-${ep}-${index}`} theme={work.themeColor} genre={work.genreKey} variant="cut" mode="impact"
              className="absolute inset-0 h-full w-full opacity-45 mix-blend-screen" />
          )}
        </>
      ) : (
        <SceneArt seed={`${work.id}-${ep}-${index}`} theme={work.themeColor} genre={work.genreKey} variant="cut" mode={mode} className="absolute inset-0 h-full w-full" />
      )}
      <div className="grain pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay" />
      {dialogue && (
        <div className={cn("absolute top-[9%] max-w-[62%]", left ? "left-[7%]" : "right-[7%]")}>
          <div className="relative rounded-[48%] bg-white px-5 py-3.5 text-center text-[14px] font-bold leading-snug text-[#111] shadow-[0_4px_18px_rgba(0,0,0,0.35)] md:text-[16px]">
            {dialogue}
            <span className={cn("absolute -bottom-2 size-4 rotate-45 bg-white", left ? "left-[30%]" : "right-[30%]")} />
          </div>
        </div>
      )}
    </div>
  );
}

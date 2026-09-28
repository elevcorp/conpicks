"use client";
import Image from "next/image";
import { SceneArt, GENRE_EMOJI, type ArtVariant } from "./SceneArt";
import { coverSrc } from "@/lib/assets";
import { cn } from "@/lib/cn";
import type { GenreKey } from "@/lib/types";

interface Props {
  id: string;
  title: string;
  genre: GenreKey | "film";
  theme: string;
  variant?: ArtVariant;
  /** Render generated title typography (heroes/detail). Cards overlay their own title. */
  showTitle?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Override image source key (e.g. `hero_wt_01`). */
  srcKey?: string;
}

const SERIF = new Set(["rofan", "murim", "thriller", "fantasy"]);

/**
 * Real file at /public/covers/{id}.(jpg|png|webp) wins automatically.
 * Otherwise: seeded dark two-tone scene + genre emoji watermark + title type.
 */
export function PlaceholderCover({ id, title, genre, theme, variant = "poster", showTitle, className, sizes, priority, srcKey }: Props) {
  const src = coverSrc(srcKey ?? id) ?? (srcKey ? coverSrc(id) : null);
  if (src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={src} alt={title} fill sizes={sizes ?? "(max-width: 768px) 50vw, 240px"} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-[#111]", className)} role="img" aria-label={title}>
      <SceneArt seed={id} theme={theme} genre={genre} variant={variant} className="absolute inset-0 h-full w-full" />
      <span
        className={cn(
          "pointer-events-none absolute -right-[4%] top-[4%] rotate-[-12deg] select-none leading-none opacity-[0.14]",
          variant === "wide" ? "text-[40px] md:text-[56px]" : "text-[56px] md:text-[84px]",
        )}
        aria-hidden
      >
        {GENRE_EMOJI[genre] ?? "✦"}
      </span>
      <div className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
      {showTitle && (
        <div className="absolute inset-x-0 bottom-[16%] flex justify-center px-[8%]">
          <span
            className={cn(
              "text-balance text-center font-black leading-[1.05] tracking-tight text-white",
              SERIF.has(genre) && "font-serif",
              variant === "wide" ? "text-[clamp(20px,4vw,44px)]" : "text-[clamp(22px,7vw,46px)]",
            )}
            style={{ textShadow: `0 2px 24px ${theme}, 0 1px 2px rgba(0,0,0,.6)` }}
          >
            {title}
          </span>
        </div>
      )}
    </div>
  );
}

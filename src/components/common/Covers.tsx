"use client";
import { PlaceholderCover } from "./PlaceholderCover";
import type { ArtVariant } from "./SceneArt";
import type { Film, Webtoon } from "@/lib/types";

const FILM_TONES = ["#3b2a6a", "#1f4a6e", "#6b1d2a", "#23504a", "#4a3a1a", "#2a2f5a"];

export function WorkCover({ work, variant = "poster", showTitle, className, sizes, priority, srcKey }: {
  work: Pick<Webtoon, "id" | "title" | "genreKey" | "themeColor">;
  variant?: ArtVariant; showTitle?: boolean; className?: string; sizes?: string; priority?: boolean; srcKey?: string;
}) {
  return (
    <PlaceholderCover id={work.id} title={work.title} genre={work.genreKey} theme={work.themeColor} variant={variant}
      showTitle={showTitle} className={className} sizes={sizes} priority={priority} srcKey={srcKey} />
  );
}

export function FilmCover({ film, variant = "wide", showTitle, className, sizes, priority, srcKey }: {
  film: Pick<Film, "id" | "title">;
  variant?: ArtVariant; showTitle?: boolean; className?: string; sizes?: string; priority?: boolean; srcKey?: string;
}) {
  const tone = FILM_TONES[parseInt(film.id.slice(3), 10) % FILM_TONES.length];
  return (
    <PlaceholderCover id={film.id} title={film.title} genre="film" theme={tone} variant={variant}
      showTitle={showTitle} className={className} sizes={sizes ?? "(max-width: 768px) 70vw, 360px"} priority={priority} srcKey={srcKey} />
  );
}

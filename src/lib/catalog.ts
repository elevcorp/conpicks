// Light catalog for client components (no comments/rankings payload).
import webtoonsJson from "@/data/webtoons.json";
import filmsJson from "@/data/films.json";
import type { Film, Webtoon } from "./types";

export const webtoons = webtoonsJson as Webtoon[];
export const films = filmsJson as Film[];

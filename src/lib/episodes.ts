// Heavy viewer payload (narrations/dialogues). Import only from server components.
import episodesJson from "@/data/episodes.json";
import type { Episode, EpisodeSummary } from "./types";

const all = episodesJson as Record<string, Episode[]>;

export const getEpisodes = (id: string): Episode[] => all[id] ?? [];
export const getEpisode = (id: string, ep: number) => all[id]?.[ep - 1];
export function summarize(e: Episode): EpisodeSummary {
  const { narrations, dialogues, ...rest } = e;
  void narrations;
  void dialogues;
  return rest;
}
export const getEpisodeSummaries = (id: string): EpisodeSummary[] => getEpisodes(id).map(summarize);

// Catalog accessors. Light JSON only — episodes live in ./episodes (server-only use).
import { films, webtoons } from "./catalog";
import commentsJson from "@/data/comments.json";
import rankingsJson from "@/data/rankings.json";
import fundingJson from "@/data/funding.json";
import communityJson from "@/data/community.json";
import type { Comment, FilmComment, Notification, RankEntry } from "./types";

export { films, webtoons };
export const funding = fundingJson;
export const rankings = rankingsJson as unknown as {
  updatedAt: string;
  webtoon: { official: RankEntry[]; league: RankEntry[]; byGenre: Record<string, RankEntry[]> };
  ageGender: Record<string, string[]>;
  film: { season1: RankEntry[]; season0: RankEntry[] };
};
export const notifications = communityJson.notifications as Notification[];

const webtoonMap = new Map(webtoons.map((w) => [w.id, w]));
const filmMap = new Map(films.map((f) => [f.id, f]));

export const getWebtoon = (id: string) => webtoonMap.get(id);
export const getFilm = (id: string) => filmMap.get(id);
export const getComments = (id: string) => ((commentsJson as Record<string, Comment[]>)[id] ?? []);
export const getFilmComments = (id: string) =>
  ((communityJson.filmComments as Record<string, FilmComment[]>)[id] ?? []);

export const officialRanking = () =>
  rankings.webtoon.official.map((e) => ({ ...e, work: webtoonMap.get(e.id)! }));
export const leagueRanking = () =>
  rankings.webtoon.league.map((e) => ({ ...e, work: webtoonMap.get(e.id)! }));
export const rankOf = (id: string) =>
  rankings.webtoon.official.find((e) => e.id === id) ?? rankings.webtoon.league.find((e) => e.id === id);

export const filmRanking = (season: 0 | 1 = 1) =>
  (season === 1 ? rankings.film.season1 : rankings.film.season0).map((e) => ({ ...e, film: filmMap.get(e.id)! }));

export const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

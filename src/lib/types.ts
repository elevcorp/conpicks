export type World = "webtoon" | "film";
export type ThemeMode = "dark" | "light";
export type RankChange = number | "NEW";

export type GenreKey =
  | "rofan" | "romance" | "sfromance" | "healing" | "daily" | "murim"
  | "thriller" | "action" | "fantasy" | "school" | "drama";

export interface Webtoon {
  id: string;
  title: string;
  tagline: string;
  writer: string;
  artist: string;
  author: string;
  publisher: string;
  genre: string;
  genreKey: GenreKey;
  rankGenre: string;
  badges: string[];
  ageRating: string;
  rating: number;
  views: string;
  likes: string;
  subscribers: string;
  weekday: string;
  weekdays: string[];
  status: "ongoing" | "completed";
  themeColor: string;
  keywords: string[];
  synopsis: string;
  cast: string[];
  league: "official" | "league";
  leagueProgress: number;
  stats: { likes: number; comments: number; shares: number; saves: number };
  rankChange: RankChange;
  jimovieReview: { views: string; title: string; duration: string; date: string } | null;
  ipStatus: "none" | "review" | "confirmed";
  ipStage: number;
  episodeCount: number;
  isNew: boolean;
  /** false when the cover art doesn't carry a legible title (cards overlay it). Default: true for real covers. */
  coverTitle?: boolean;
}

export interface Episode {
  ep: number;
  title: string;
  thumbnail: string;
  rating: number;
  date: string;
  status: "free" | "wait";
  waitDays: number;
  price: number;
  likes: number;
  comments: number;
  cutCount: number;
  narrations: string[];
  dialogues: string[];
}
/** Episode without the heavy viewer payload — safe to ship to list UIs. */
export type EpisodeSummary = Omit<Episode, "narrations" | "dialogues">;

export interface Comment {
  id: string;
  nickname: string;
  date: string;
  body: string;
  episode: string;
  likes: number;
  dislikes: number;
  replies: number;
  isBest: boolean;
  isSpoiler: boolean;
}

export interface FilmStats { views: number; likes: number; comments: number; shares: number; saves: number }

export interface Film {
  id: string;
  title: string;
  creator: string;
  genre: string;
  genres: string[];
  runtime: string;
  logline: string;
  rank: number;
  rankChange: RankChange;
  season: number;
  award?: string;
  stats: FilmStats;
  jimovieReview: { views: string; title: string; duration: string } | null;
  tool: string;
  funding?: boolean;
}

export interface FilmComment { id: string; nickname: string; date: string; body: string; likes: number; replies: number }

export interface RankEntry { id: string; rank: number; change: RankChange }

export interface Notification { id: string; type: string; title: string; body: string; time: string; href: string }

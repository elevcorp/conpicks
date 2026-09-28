"use client";
import { create } from "zustand";

// Session-memory only (spec: may reset on refresh).
export interface CashLog { id: number; label: string; amount: number; at: string }
export interface MyComment { id: string; workId: string; body: string; episode: string }

interface UserState {
  loggedIn: boolean;
  nickname: string;
  cash: number;
  rentalTickets: Record<string, number>;
  ownTickets: Record<string, number>;
  cashLog: CashLog[];
  liked: string[]; // webtoon ids (관심)
  saved: string[]; // webtoon ids (찜)
  recent: { id: string; ep: number }[];
  purchased: string[]; // `${workId}:${ep}`
  commentVotes: Record<string, "up" | "down">;
  myComments: MyComment[];
  ratings: Record<string, number>; // `${workId}:${ep}` → stars
  epLikes: string[];
  filmLiked: string[];
  filmSaved: string[];
  fundings: { amount: number; at: string }[];

  login: () => void;
  logout: () => void;
  toggle: (key: "liked" | "saved" | "filmLiked" | "filmSaved" | "epLikes", id: string) => boolean;
  addRecent: (id: string, ep: number) => void;
  charge: (amount: number, label: string) => void;
  spend: (amount: number, label: string) => boolean;
  purchase: (workId: string, ep: number, price: number) => boolean;
  useTicket: (workId: string, ep: number) => boolean;
  buyTickets: (workId: string, kind: "rental" | "own", count: number, price: number) => boolean;
  voteComment: (id: string, v: "up" | "down") => void;
  addComment: (c: MyComment) => void;
  rate: (key: string, stars: number) => void;
  fund: (amount: number) => void;
}

const now = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
let logSeq = 10;

export const useUser = create<UserState>()((set, get) => ({
  loggedIn: false,
  nickname: "시연계정",
  cash: 1000,
  rentalTickets: {},
  ownTickets: {},
  cashLog: [
    { id: 1, label: "가입 축하 캐시", amount: 500, at: "09.20 10:12" },
    { id: 2, label: "CNPX 오픈 이벤트", amount: 500, at: "09.24 18:40" },
  ],
  liked: [],
  saved: [],
  recent: [],
  purchased: [],
  commentVotes: {},
  myComments: [],
  ratings: {},
  epLikes: [],
  filmLiked: [],
  filmSaved: [],
  fundings: [],

  login: () =>
    set((s) => ({
      loggedIn: true,
      // Seed a lived-in library for the demo account (keeps anything already done this session).
      saved: Array.from(new Set([...s.saved, "wt_01", "wt_04", "wt_12", "wt_13", "wt_14"])),
      liked: Array.from(new Set([...s.liked, "wt_01", "wt_02"])),
      recent: s.recent.length
        ? s.recent
        : [
            { id: "wt_05", ep: 12 },
            { id: "wt_02", ep: 34 },
            { id: "wt_04", ep: 2 },
            { id: "wt_11", ep: 58 },
            { id: "wt_24", ep: 5 },
          ],
      purchased: Array.from(new Set([...s.purchased, "wt_01:90", "wt_05:124"])),
    })),
  logout: () => set({ loggedIn: false }),
  toggle: (key, id) => {
    const list = get()[key];
    const on = !list.includes(id);
    set({ [key]: on ? [...list, id] : list.filter((x) => x !== id) } as Partial<UserState>);
    return on;
  },
  addRecent: (id, ep) => set((s) => ({ recent: [{ id, ep }, ...s.recent.filter((r) => r.id !== id)].slice(0, 20) })),
  charge: (amount, label) =>
    set((s) => ({ cash: s.cash + amount, cashLog: [{ id: ++logSeq, label, amount, at: now() }, ...s.cashLog] })),
  spend: (amount, label) => {
    if (get().cash < amount) return false;
    set((s) => ({ cash: s.cash - amount, cashLog: [{ id: ++logSeq, label, amount: -amount, at: now() }, ...s.cashLog] }));
    return true;
  },
  purchase: (workId, ep, price) => {
    if (!get().spend(price, `미리보기 ${ep}화`)) return false;
    set((s) => ({ purchased: [...s.purchased, `${workId}:${ep}`] }));
    return true;
  },
  useTicket: (workId, ep) => {
    const n = get().rentalTickets[workId] ?? 0;
    if (n < 1) return false;
    set((s) => ({
      rentalTickets: { ...s.rentalTickets, [workId]: n - 1 },
      purchased: [...s.purchased, `${workId}:${ep}`],
    }));
    return true;
  },
  buyTickets: (workId, kind, count, price) => {
    if (!get().spend(price, `${kind === "rental" ? "대여권" : "소장권"} ${count}장`)) return false;
    const key = kind === "rental" ? "rentalTickets" : "ownTickets";
    set((s) => ({ [key]: { ...s[key], [workId]: (s[key][workId] ?? 0) + count } }) as Partial<UserState>);
    return true;
  },
  voteComment: (id, v) =>
    set((s) => {
      const next = { ...s.commentVotes };
      if (next[id] === v) delete next[id];
      else next[id] = v;
      return { commentVotes: next };
    }),
  addComment: (c) => set((s) => ({ myComments: [c, ...s.myComments] })),
  rate: (key, stars) => set((s) => ({ ratings: { ...s.ratings, [key]: stars } })),
  fund: (amount) => set((s) => ({ fundings: [...s.fundings, { amount, at: now() }] })),
}));

export const isUnlocked = (purchased: string[], workId: string, ep: number) => purchased.includes(`${workId}:${ep}`);

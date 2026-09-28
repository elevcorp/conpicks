"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrefsState {
  scroll: "vertical" | "page";
  notify: { update: boolean; rank: boolean; funding: boolean; marketing: boolean };
  setScroll: (s: PrefsState["scroll"]) => void;
  setNotify: (k: keyof PrefsState["notify"], v: boolean) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      scroll: "vertical",
      notify: { update: true, rank: true, funding: true, marketing: false },
      setScroll: (scroll) => set({ scroll }),
      setNotify: (k, v) => set((s) => ({ notify: { ...s.notify, [k]: v } })),
    }),
    { name: "cnpx-prefs" },
  ),
);

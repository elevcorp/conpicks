"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/lib/types";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme;
        set({ theme });
      },
    }),
    { name: "cnpx-theme" },
  ),
);

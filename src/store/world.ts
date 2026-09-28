"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { World } from "@/lib/types";

interface WorldState {
  /** Last world the user was in — remembered across visits. */
  world: World;
  setWorld: (w: World) => void;
  /** Non-null while the cross-world curtain is animating. */
  transitionTo: World | null;
  setTransition: (w: World | null) => void;
}

export const useWorld = create<WorldState>()(
  persist(
    (set) => ({
      world: "webtoon",
      setWorld: (world) => set({ world }),
      transitionTo: null,
      setTransition: (transitionTo) => set({ transitionTo }),
    }),
    { name: "cnpx-world", partialize: (s) => ({ world: s.world }) },
  ),
);

export const worldOfPath = (path: string): World | null =>
  path.startsWith("/film") ? "film" : SHARED.some((p) => path === p || path.startsWith(p + "/")) ? null : "webtoon";

const SHARED = ["/my", "/settings", "/search", "/notifications"];

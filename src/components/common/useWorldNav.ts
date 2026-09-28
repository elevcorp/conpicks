"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useWorld, worldOfPath } from "@/store/world";
import type { World } from "@/lib/types";

/** Navigate; if the destination is in the other world, play the curtain transition first. */
export function useWorldNav() {
  const router = useRouter();
  return useCallback(
    (href: string, opts?: { replace?: boolean }) => {
      const { world, setTransition, setWorld } = useWorld.getState();
      const target: World | null = worldOfPath(href.split("?")[0]);
      if (!target || target === world) {
        if (opts?.replace) router.replace(href);
        else router.push(href);
        return;
      }
      setTransition(target);
      window.setTimeout(() => {
        setWorld(target);
        if (opts?.replace) router.replace(href);
        else router.push(href);
      }, 260);
    },
    [router],
  );
}

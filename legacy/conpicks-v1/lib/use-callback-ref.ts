"use client";

import { useCallback, useRef } from "react";

/**
 * A ref callback that invokes `effect(node)` on attach and runs the
 * returned cleanup on detach — handy for one-off IntersectionObservers.
 */
export function useCallbackRef<T>(effect: (node: T | null) => void | (() => void)) {
  const cleanup = useRef<void | (() => void)>(undefined);
  return useCallback(
    (node: T | null) => {
      if (cleanup.current) {
        cleanup.current();
        cleanup.current = undefined;
      }
      if (node) cleanup.current = effect(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}

"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWorld, worldOfPath } from "@/store/world";
import { Logo } from "./Logo";

/** Full-screen crossfade in the destination world's colors while the route swaps. */
export function WorldCurtain() {
  const { transitionTo, setTransition } = useWorld();
  const pathname = usePathname();

  useEffect(() => {
    if (!transitionTo) return;
    if (worldOfPath(pathname) === transitionTo) {
      const t = window.setTimeout(() => setTransition(null), 120);
      return () => window.clearTimeout(t);
    }
    const bail = window.setTimeout(() => setTransition(null), 2500);
    return () => window.clearTimeout(bail);
  }, [pathname, transitionTo, setTransition]);

  const film = transitionTo === "film";
  return (
    <AnimatePresence>
      {transitionTo && (
        <motion.div
          key={transitionTo}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: film ? "radial-gradient(120% 90% at 50% 40%, #1a2150 0%, #0a0d1c 60%)" : "var(--page)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex flex-col items-center gap-2"
            style={{ color: film ? "#fff" : "var(--fg)" }}
          >
            <Logo size="lg" />
            <span className="text-[12px] font-semibold tracking-[0.5em] opacity-70">{film ? "AI FILM" : "AI WEBTOON"}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

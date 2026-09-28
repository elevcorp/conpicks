"use client";
import { motion } from "framer-motion";
import { useWorld } from "@/store/world";
import { useWorldNav } from "./useWorldNav";
import { useCurrentWorld } from "./useCurrentWorld";
import { cn } from "@/lib/cn";
import type { World } from "@/lib/types";

const TABS: { key: World; label: string; href: string }[] = [
  { key: "webtoon", label: "웹툰", href: "/" },
  { key: "film", label: "영화", href: "/film" },
];

/** Kurly-style capsule toggle — the signature of the mockup. */
export function WorldSwitcher({ className, onDark }: { className?: string; onDark?: boolean }) {
  // Route-derived world (not the persisted store) so the pill is right on first paint.
  const current = useCurrentWorld();
  const world = useWorld((s) => s.transitionTo) ?? current;
  const go = useWorldNav();
  return (
    <div
      role="tablist"
      aria-label="월드 전환"
      className={cn(
        "relative flex h-9 items-center rounded-full p-[3px] backdrop-blur-md",
        onDark ? "bg-white/15 ring-1 ring-white/15" : "bg-chip ring-1 ring-line",
        className,
      )}
    >
      {TABS.map((t) => {
        const active = world === t.key;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            onClick={() => !active && go(t.href)}
            className={cn(
              "relative z-10 h-full min-w-[60px] rounded-full px-4 text-[14px] font-bold transition-colors duration-300",
              active ? "text-ink" : onDark ? "text-white/70 hover:text-white" : "text-fg-2 hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId="world-pill"
                className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
              />
            )}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

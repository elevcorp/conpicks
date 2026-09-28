"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWorld, worldOfPath } from "@/store/world";
import type { World } from "@/lib/types";

/** World for the current route; shared routes (/my, /settings…) follow the last world. */
export function useCurrentWorld(): World {
  const pathname = usePathname();
  const stored = useWorld((s) => s.world);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return worldOfPath(pathname) ?? (mounted ? stored : "webtoon");
}

export type Chrome = { bottomNav: boolean; gnb: boolean; switcherInGnb: boolean; overlayGnb: boolean };

export function chromeFor(pathname: string): Chrome {
  const content = /^\/(work|film\/work)\//.test(pathname);
  const viewer = pathname.startsWith("/viewer/");
  const sub = /^\/(settings|search|notifications)/.test(pathname);
  return {
    bottomNav: !content && !viewer && !sub,
    gnb: !viewer,
    switcherInGnb: !content,
    overlayGnb: pathname === "/" || pathname === "/film",
  };
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  House, Trophy, Rocket, LibraryBig, CircleUserRound, Clapperboard, HandCoins, Search, Bell, ChevronLeft,
} from "lucide-react";
import { Logo } from "./Logo";
import { WorldSwitcher } from "./WorldSwitcher";
import { chromeFor, useCurrentWorld } from "./useCurrentWorld";
import { useUser } from "@/store/user";
import { cn } from "@/lib/cn";
import type { World } from "@/lib/types";

const TABS: Record<World, { href: string; label: string; icon: typeof House; match?: RegExp }[]> = {
  webtoon: [
    { href: "/", label: "홈", icon: House, match: /^\/(weekly)?$/ },
    { href: "/ranking", label: "랭킹", icon: Trophy },
    { href: "/league", label: "신작리그", icon: Rocket },
    { href: "/library", label: "보관함", icon: LibraryBig },
    { href: "/my", label: "MY", icon: CircleUserRound, match: /^\/(my|settings)/ },
  ],
  film: [
    { href: "/film", label: "홈", icon: House, match: /^\/film(\/collection.*)?$/ },
    { href: "/film/feed", label: "피드", icon: Clapperboard },
    { href: "/film/ranking", label: "랭킹", icon: Trophy },
    { href: "/film/funding", label: "펀딩", icon: HandCoins },
    { href: "/my", label: "MY", icon: CircleUserRound, match: /^\/(my|settings)/ },
  ],
};

const GNB_MENU: Record<World, { href: string; label: string; match?: RegExp }[]> = {
  webtoon: [
    { href: "/", label: "홈", match: /^\/$/ },
    { href: "/weekly", label: "요일별" },
    { href: "/ranking", label: "랭킹" },
    { href: "/league", label: "신작리그" },
    { href: "/library", label: "보관함" },
  ],
  film: [
    { href: "/film", label: "홈", match: /^\/film$/ },
    { href: "/film/feed", label: "피드" },
    { href: "/film/ranking", label: "랭킹" },
    { href: "/film/funding", label: "펀딩" },
    { href: "/film/collection/awards", label: "수상작", match: /^\/film\/collection/ },
  ],
};

const isActive = (pathname: string, href: string, match?: RegExp) =>
  match ? match.test(pathname) : pathname === href || pathname.startsWith(href + "/");

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}

/** Mobile bottom tab bar (hidden md+). */
export function BottomNav() {
  const pathname = usePathname();
  const world = useCurrentWorld();
  if (!chromeFor(pathname).bottomNav) return null;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[var(--nav)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="하단 메뉴"
    >
      <ul className="mx-auto flex h-[58px] max-w-[560px]">
        {TABS[world].map(({ href, label, icon: Icon, match }) => {
          const active = isActive(pathname, href, match);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-[3px] text-[10.5px] font-semibold transition-colors",
                  active ? "text-brand" : "text-fg-3",
                )}
              >
                <motion.span animate={{ scale: active ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 26 }}>
                  <Icon size={23} strokeWidth={active ? 2.4 : 1.8} />
                </motion.span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UtilityIcons({ onDark, showMy }: { onDark?: boolean; showMy?: boolean }) {
  const loggedIn = useUser((s) => s.loggedIn);
  const btn = cn("grid size-10 place-items-center rounded-full transition-colors", onDark ? "text-white hover:bg-white/15" : "text-fg hover:bg-chip");
  return (
    <div className="flex items-center gap-0.5">
      <Link href="/search" aria-label="검색" className={btn}>
        <Search size={21} />
      </Link>
      <Link href="/notifications" aria-label="알림" className={cn(btn, "relative")}>
        <Bell size={21} />
        <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-up" />
      </Link>
      {showMy && (
        <Link href="/my" aria-label="MY" className={cn(btn, "ml-1")}>
          <span className={cn("grid size-8 place-items-center rounded-full text-[12px] font-bold", loggedIn ? "bg-brand text-white" : onDark ? "bg-white/15" : "bg-chip")}>
            {loggedIn ? "시" : <CircleUserRound size={20} />}
          </span>
        </Link>
      )}
    </div>
  );
}

/** Desktop/tablet top GNB (md+). */
export function GNB() {
  const pathname = usePathname();
  const world = useCurrentWorld();
  const chrome = chromeFor(pathname);
  const scrolled = useScrolled();
  if (!chrome.gnb) return null;
  const overlay = chrome.overlayGnb && !scrolled;
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 hidden transition-[background-color,border-color,backdrop-filter] duration-300 md:block",
        overlay ? "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent" : "border-b border-line bg-[var(--nav)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-6">
        <Link href={world === "film" ? "/film" : "/"} className={overlay ? "text-white" : "text-fg"}>
          <Logo />
        </Link>
        {chrome.switcherInGnb && <WorldSwitcher onDark={overlay || world === "film"} />}
        <nav className="flex items-center gap-1">
          {GNB_MENU[world].map((m) => {
            const active = isActive(pathname, m.href, m.match);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-[15px] font-semibold transition-colors",
                  overlay ? (active ? "text-white" : "text-white/70 hover:text-white") : active ? "text-fg" : "text-fg-3 hover:text-fg",
                )}
              >
                {m.label}
                {active && <motion.span layoutId={`gnb-${world}`} className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-brand" />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <UtilityIcons onDark={overlay} showMy />
        </div>
      </div>
    </header>
  );
}

/** Mobile home top bar: logo · switcher · search/bell — transparent over the hero. */
export function HomeTopBar({ world, children }: { world: World; children?: React.ReactNode }) {
  const scrolled = useScrolled(40);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300 md:hidden",
        scrolled ? "bg-[var(--nav)] backdrop-blur-xl" : "bg-gradient-to-b from-black/70 via-black/30 to-transparent",
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4">
        <Link href={world === "film" ? "/film" : "/"} className={scrolled ? "text-fg" : "text-white"}>
          <Logo size="sm" />
        </Link>
        <WorldSwitcher onDark={!scrolled || world === "film"} />
        <div className="-mr-2 flex justify-end">
          <UtilityIcons onDark={!scrolled} />
        </div>
      </div>
      {children}
    </header>
  );
}

/** Mobile page header. `back` → sub page style; otherwise big tab title. */
export function PageHeader({ title, back, right, sub, className }: {
  title: React.ReactNode;
  back?: boolean | string;
  right?: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("sticky top-0 z-40 border-b border-transparent bg-[var(--nav)] backdrop-blur-xl md:hidden", className)} style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex h-14 items-center gap-1 px-4">
        {back ? (
          <>
            <BackButton fallback={typeof back === "string" ? back : "/"} />
            <h1 className="flex-1 truncate text-center text-[17px] font-bold">{title}</h1>
            <div className="flex min-w-10 justify-end">{right}</div>
          </>
        ) : (
          <>
            <h1 className="flex-1 text-[22px] font-extrabold tracking-tight">{title}</h1>
            {right ?? (
              <Link href="/search" aria-label="검색" className="-mr-2 grid size-10 place-items-center rounded-full hover:bg-chip">
                <Search size={22} />
              </Link>
            )}
          </>
        )}
      </div>
      {sub}
    </header>
  );
}

export function BackButton({ fallback = "/", className }: { fallback?: string; className?: string }) {
  return (
    <button
      aria-label="뒤로가기"
      onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = fallback))}
      className={cn("-ml-2 grid size-10 place-items-center rounded-full hover:bg-chip", className)}
    >
      <ChevronLeft size={26} />
    </button>
  );
}

/** Desktop page title (GNB pages). */
export function DesktopTitle({ title, desc, right }: { title: string; desc?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="hidden items-end justify-between pb-6 pt-10 md:flex">
      <div>
        <h1 className="text-[30px] font-extrabold tracking-tight">{title}</h1>
        {desc && <p className="mt-1.5 text-[15px] text-fg-2">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

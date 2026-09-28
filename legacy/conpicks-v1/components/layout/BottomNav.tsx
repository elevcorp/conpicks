"use client";

import { Compass, Home, MessageSquare, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/discover", label: "탐색", icon: Compass },
  { href: "/community", label: "커뮤니티", icon: MessageSquare },
  { href: "/my", label: "MY", icon: User },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav({ canUpload = false }: { canUpload?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {canUpload && (
        <Link
          href="/upload"
          className="bg-brand-gradient fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/40 md:hidden"
          aria-label="작품 올리기"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="주요 메뉴"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-text-primary" : "text-text-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active && "text-brand-accent [&>*]:stroke-[2.5]",
                    )}
                  />
                  <span className={cn(active && "text-brand-gradient")}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

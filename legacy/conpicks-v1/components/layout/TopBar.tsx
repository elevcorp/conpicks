import Link from "next/link";
import { Compass, Home, MessageSquare, Search, User } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const NAV = [
  { href: "/", label: "홈", icon: Home },
  { href: "/discover", label: "탐색", icon: Compass },
  { href: "/community", label: "커뮤니티", icon: MessageSquare },
  { href: "/my", label: "MY", icon: User },
];

export function TopBar({ user }: { user: Profile | null }) {
  const canUpload = user?.role === "creator" || user?.role === "admin";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Logo className="h-7" priority />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/discover"
            className="grid h-9 w-9 place-items-center rounded-md text-text-secondary hover:bg-white/5 md:hidden"
            aria-label="검색"
          >
            <Search className="h-5 w-5" />
          </Link>
          {canUpload && (
            <Link
              href="/upload"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden md:inline-flex",
              )}
            >
              작품 올리기
            </Link>
          )}
          {user ? (
            <Link href="/my" aria-label="내 프로필">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{user.nickname.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({ size: "sm", variant: "secondary" })}
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

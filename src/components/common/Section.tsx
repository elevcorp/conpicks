"use client";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function SectionHeader({ title, sub, href, more = "전체보기", className }: {
  title: React.ReactNode; sub?: React.ReactNode; href?: string; more?: string; className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3 px-4 md:mb-4 md:px-0", className)}>
      <div className="min-w-0">
        <h2 className="truncate text-[19px] font-extrabold tracking-tight md:text-[22px]">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-fg-3">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center text-[13px] font-semibold text-fg-2 hover:text-fg">
          {more} <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

/** Snap-scrolling horizontal row; desktop gets hover arrows. */
export function Row({ children, className, itemClass }: { children: React.ReactNode; className?: string; itemClass?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className={cn("group/row relative", className)}>
      <div ref={ref} className={cn("snap-row gap-2.5 px-4 md:gap-4 md:px-0 md:[scroll-padding-inline:0]", itemClass)}>
        {children}
      </div>
      <button aria-label="이전" onClick={() => by(-1)} className="absolute -left-5 top-[40%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-elev-2 text-fg opacity-0 shadow-lg ring-1 ring-line transition-opacity group-hover/row:opacity-100 md:grid">
        <ChevronLeft size={22} />
      </button>
      <button aria-label="다음" onClick={() => by(1)} className="absolute -right-5 top-[40%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-elev-2 text-fg opacity-0 shadow-lg ring-1 ring-line transition-opacity group-hover/row:opacity-100 md:grid">
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] md:px-6", className)}>{children}</div>;
}

export function Chips<T extends string>({ items, value, onChange, className, size = "md" }: {
  items: readonly T[]; value: T; onChange: (v: T) => void; className?: string; size?: "sm" | "md";
}) {
  return (
    <div className={cn("snap-row gap-2 px-4 md:flex-wrap md:px-0", className)}>
      {items.map((it) => (
        <button
          key={it}
          onClick={() => onChange(it)}
          className={cn(
            "shrink-0 rounded-full border font-semibold transition-colors",
            size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-3.5 text-[14px]",
            value === it ? "border-fg bg-fg text-bg" : "border-line text-fg-2 hover:text-fg",
          )}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

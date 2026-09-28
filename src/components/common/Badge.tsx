import { cn } from "@/lib/cn";

const STYLES: Record<string, string> = {
  연재무료: "bg-free text-ink",
  기다무: "bg-[#4E5968]/90 text-white",
  UP: "bg-up text-white",
  신작: "bg-up text-white",
  NEW: "bg-up text-white",
  연재: "bg-up text-white",
  무료: "bg-white text-ink",
  BEST: "bg-black text-white ring-1 ring-white/15",
  "지무비 리뷰": "bg-black/75 text-white ring-1 ring-white/20 backdrop-blur",
  리그: "bg-brand text-white",
  완결: "bg-[#4E5968] text-white",
  brand: "bg-brand text-white",
};

export function Badge({ label, children, className, tone }: { label?: string; children?: React.ReactNode; className?: string; tone?: string }) {
  const key = tone ?? label ?? "";
  return (
    <span
      className={cn(
        "inline-flex h-[18px] shrink-0 items-center rounded-[4px] px-1.5 text-[10.5px] font-bold leading-none tracking-tight",
        STYLES[key] ?? "bg-chip text-fg",
        className,
      )}
    >
      {children ?? label}
    </span>
  );
}

export function CardBadges({ badges, className }: { badges: string[]; className?: string }) {
  const shown = badges.filter((b) => ["연재무료", "기다무", "UP", "신작"].includes(b));
  if (!shown.length) return null;
  return (
    <div className={cn("flex gap-1", className)}>
      {shown.map((b) => (
        <Badge key={b} label={b} />
      ))}
    </div>
  );
}

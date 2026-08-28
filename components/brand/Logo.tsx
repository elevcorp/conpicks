import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  as = "link",
}: {
  className?: string;
  href?: string;
  as?: "link" | "span";
}) {
  const mark = (
    <span
      className={cn(
        "text-brand-gradient font-extrabold tracking-tight select-none",
        className,
      )}
    >
      CONPICKS
    </span>
  );
  if (as === "span") return mark;
  return (
    <Link href={href} aria-label="CONPICKS 홈">
      {mark}
    </Link>
  );
}

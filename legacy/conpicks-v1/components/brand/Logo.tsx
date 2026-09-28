import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_W = 2048;
const LOGO_H = 352;

/**
 * CONPICKS wordmark. `className` should set a height (`h-6`, `h-10`, …);
 * width tracks automatically. Pass `as="span"` to render without the
 * home link (splash, auth, error pages).
 */
export function Logo({
  className,
  href = "/",
  as = "link",
  priority = false,
}: {
  className?: string;
  href?: string;
  as?: "link" | "span";
  priority?: boolean;
}) {
  const img = (
    <Image
      src="/brand/conpicks-logo.png"
      alt="CONPICKS"
      width={LOGO_W}
      height={LOGO_H}
      priority={priority}
      className={cn("h-6 w-auto select-none", className)}
    />
  );
  if (as === "span") return img;
  return (
    <Link href={href} aria-label="CONPICKS 홈" className="inline-flex items-center">
      {img}
    </Link>
  );
}

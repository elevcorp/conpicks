import { cn } from "@/lib/cn";

/** CNPX wordmark — bold type with a brand-blue dot. */
export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const text = { sm: "text-[17px]", md: "text-[21px]", lg: "text-[28px]", xl: "text-[44px]" }[size];
  return (
    <span className={cn("inline-flex select-none items-baseline font-black italic tracking-[-0.04em]", text, className)} aria-label="CNPX">
      CNPX
      <span className="ml-[0.08em] inline-block size-[0.24em] rounded-full bg-brand" />
    </span>
  );
}

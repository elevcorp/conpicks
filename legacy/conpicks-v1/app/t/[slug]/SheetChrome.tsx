"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

/** Bottom-sheet chrome: grab handle + close, slides up on mount. */
export function SheetChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  function close() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="relative min-h-dvh rounded-t-2xl border border-border bg-bg-base md:mt-6 md:min-h-0 md:rounded-2xl"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl bg-bg-base/90 px-4 py-2.5 backdrop-blur">
        <span className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20 md:hidden" />
        <span className="text-xs font-semibold text-text-muted">티저 상세</span>
        <button
          onClick={close}
          aria-label="닫기"
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </motion.div>
  );
}

"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** Kakao-style floating ↑ button. */
export function ScrollTopButton({ className, threshold = 600, children }: { className?: string; threshold?: number; children?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return (
    <div className={cn("fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col gap-2 md:right-[max(24px,calc(50vw-600px))]", className)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="맨위로"
            className="grid size-12 place-items-center rounded-full bg-[#2b2f36]/90 text-white shadow-lg ring-1 ring-white/10 backdrop-blur"
          >
            <ArrowUp size={22} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

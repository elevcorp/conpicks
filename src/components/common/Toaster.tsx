"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useUI } from "@/store/ui";

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[120] flex flex-col items-center gap-2 px-4 md:bottom-8">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="flex max-w-[420px] items-center gap-2 rounded-2xl bg-[#2b2f36]/95 px-4 py-3 text-[14px] font-medium text-white shadow-xl ring-1 ring-white/10 backdrop-blur"
          >
            {t.tone === "demo" && <Sparkles size={16} className="shrink-0 text-[#7db3ff]" />}
            {t.tone === "success" && <CheckCircle2 size={16} className="shrink-0 text-[#6fe3a0]" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

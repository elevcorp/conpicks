"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Bottom sheet on mobile, centered dialog on md+. */
export function Sheet({ open, onClose, title, children, className, film }: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  film?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className={cn(
              "relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[22px] pb-[max(16px,env(safe-area-inset-bottom))] shadow-2xl md:max-w-[440px] md:rounded-[22px] md:pb-4",
              film ? "film-scope border border-white/10 bg-[#141a33] text-white" : "bg-elev text-fg",
              className,
            )}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, i) => i.offset.y > 110 && onClose()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-center bg-inherit pt-2.5 md:hidden">
              <span className="h-1 w-10 rounded-full bg-fg-3/50" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-5 pb-2 pt-3 md:pt-5">
                <h2 className="text-[18px] font-bold">{title}</h2>
                <button onClick={onClose} aria-label="닫기" className="-mr-2 grid size-10 place-items-center rounded-full text-fg-2 hover:bg-chip">
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="px-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

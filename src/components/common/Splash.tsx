"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { useWorld } from "@/store/world";

/**
 * 1s black splash, once per browser session. It is server-rendered visible and
 * hidden pre-paint by the inline head script when already shown (no flash).
 * On first entry at "/", restores the last world the user picked.
 */
export function Splash() {
  const [show, setShow] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (document.documentElement.classList.contains("splashed")) {
      setShow(false);
      return;
    }
    try {
      sessionStorage.setItem("cnpx-splash", "1");
    } catch {}
    const restore = () => {
      if (pathname === "/" && useWorld.getState().world === "film") router.replace("/film");
    };
    if (useWorld.persist.hasHydrated()) restore();
    else useWorld.persist.onFinishHydration(restore);
    const t = window.setTimeout(() => setShow(false), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="splash"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black text-white"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col items-center gap-3">
            <Logo size="xl" />
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.35 }} className="text-[12px] tracking-[0.35em]">
              AI CONTENT · VERIFIED BY PEOPLE
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

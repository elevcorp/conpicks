"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

/** 1s brand splash on first paint of the session. */
export function Splash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("cp_splash_seen")) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => {
      sessionStorage.setItem("cp_splash_seen", "1");
      setShow(false);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[999] grid place-items-center bg-aurora"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Logo as="span" className="h-10 md:h-12" priority />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

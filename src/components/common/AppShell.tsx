"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BottomNav, GNB } from "./Nav";
import { WorldCurtain } from "./WorldCurtain";
import { Toaster } from "./Toaster";
import { Splash } from "./Splash";
import { CashSheet } from "./CashSheet";
import { LoginSheet } from "./LoginSheet";
import { useCurrentWorld } from "./useCurrentWorld";
import { useTheme } from "@/store/theme";
import { useWorld, worldOfPath } from "@/store/world";

/** Theme + world sync, global chrome and overlays. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const world = useCurrentWorld();
  const theme = useTheme((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const own = worldOfPath(pathname);
    if (own && own !== useWorld.getState().world) useWorld.getState().setWorld(own);
    document.documentElement.dataset.world = world;
  }, [pathname, world]);

  return (
    <>
      <GNB />
      {/* opacity-only so position:fixed descendants keep the viewport as containing block */}
      <motion.div key={world} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-dvh">
        {children}
      </motion.div>
      <BottomNav />
      <WorldCurtain />
      <CashSheet />
      <LoginSheet />
      <Toaster />
      <Splash />
    </>
  );
}

import { getSessionUser } from "@/lib/auth";
import { Splash } from "@/components/brand/Splash";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

/**
 * Standard chrome for the public + in-app sections: sticky TopBar,
 * fixed mobile BottomNav, 1s splash on first session paint.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const canUpload = user?.role === "creator" || user?.role === "admin";

  return (
    <div className="min-h-dvh bg-aurora">
      <Splash />
      <TopBar user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-16">
        {children}
      </main>
      <BottomNav canUpload={canUpload} />
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/lib/actions/auth";

export default async function ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/reviewer");
  if (user.role !== "reviewer" && user.role !== "admin") redirect("/");

  return (
    <div className="min-h-dvh bg-bg-base">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg-base/90 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <Logo className="text-base" />
          <span className="text-sm font-semibold text-text-secondary">
            1차 심사 콘솔
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>{user.nickname}</span>
          <Link href="/" className="underline">
            앱으로
          </Link>
          <form action={signOut}>
            <button className="underline">로그아웃</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
    </div>
  );
}

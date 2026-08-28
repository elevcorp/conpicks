import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/lib/actions/auth";

const NAV = [
  ["/admin", "대시보드"],
  ["/admin/teasers", "작품 관리"],
  ["/admin/seasons", "시즌 관리"],
  ["/admin/ranking", "랭킹 설정"],
  ["/admin/funding", "펀딩 관리"],
  ["/admin/settlement", "정산"],
  ["/admin/reviewers", "심사위원"],
  ["/admin/community", "커뮤니티"],
  ["/admin/users", "유저"],
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="min-h-dvh bg-bg-base md:flex">
      <aside className="border-b border-border md:w-52 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex h-14 items-center gap-2 px-4">
          <Logo className="text-base" />
          <span className="text-xs font-semibold text-text-muted">Admin</span>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:pb-4">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-xs whitespace-nowrap text-text-secondary hover:bg-white/5 hover:text-text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="hidden px-4 md:block">
          <button className="text-xs text-text-muted underline">로그아웃</button>
        </form>
      </aside>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

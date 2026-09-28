import Link from "next/link";
import { BookOpen, TrendingUp, HandCoins, Sparkles, Rocket, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/common/Nav";
import { notifications } from "@/lib/data";

export const metadata = { title: "알림" };

const ICON = { update: BookOpen, rank: TrendingUp, funding: HandCoins, review: Sparkles, league: Rocket, notice: Megaphone } as const;

export default function NotificationsPage() {
  return (
    <main className="pb-16 md:pt-16">
      <PageHeader title="알림" back="/" />
      <div className="mx-auto max-w-[720px] md:px-6">
        <h1 className="hidden pb-4 pt-10 text-[30px] font-extrabold md:block">알림</h1>
        <ul>
          {notifications.map((n, i) => {
            const I = ICON[n.type as keyof typeof ICON] ?? Megaphone;
            return (
              <li key={n.id}>
                <Link href={n.href} className="flex gap-3 border-b border-line px-4 py-4 transition-colors hover:bg-chip md:rounded-xl md:border-none">
                  <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-chip text-brand">
                    <I size={20} />
                    {i < 2 && <span className="absolute right-0 top-0 size-2.5 rounded-full border-2 border-bg bg-up" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold leading-snug">{n.title}</p>
                    <p className="mt-0.5 text-[13px] text-fg-3">{n.body}</p>
                    <p className="mt-1 text-[12px] text-fg-3">{n.time}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

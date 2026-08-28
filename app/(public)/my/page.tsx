import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getCreatorTeasers,
  getLikedTeasers,
  getNotifications,
  getSavedTeasers,
  getUserComments,
  getUserPledges,
} from "@/lib/data";
import { krw } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { TeaserCard } from "@/components/teaser/TeaserCard";
import { EditProfileButton } from "./EditProfileButton";
import { MyComments, MyFunding, MyNotifications, MyWorks } from "./Sections";
import { SettingsPanel } from "./SettingsPanel";

export const metadata = { title: "MY" };

const ROLE_LABEL: Record<string, string> = {
  viewer: "시청자",
  creator: "Creator",
  reviewer: "Reviewer",
  admin: "Admin",
};

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/my");
  const { tab = "saved" } = await searchParams;
  const isCreator = user.role === "creator" || user.role === "admin";

  const TABS: [string, string][] = [
    ["saved", "저장한 작품"],
    ["liked", "좋아요"],
    ["comments", "내 댓글"],
    ["funding", "내 펀딩"],
    ...(isCreator ? ([["works", "내 작품"]] as [string, string][]) : []),
    ["notifications", "알림"],
    ["settings", "설정"],
  ];

  return (
    <div className="space-y-5">
      {/* profile header */}
      <header className="flex items-center gap-4">
        <Image
          src={user.avatar_url ?? "/icon.svg"}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-full bg-bg-elevated"
          unoptimized
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-extrabold">{user.nickname}</h1>
            <Badge variant="outline" className="text-[10px]">
              {ROLE_LABEL[user.role]}
            </Badge>
          </div>
          <p className="line-clamp-1 text-xs text-text-muted">
            {user.bio ?? "소개가 없어요"}
          </p>
        </div>
        <EditProfileButton
          nickname={user.nickname}
          bio={user.bio ?? ""}
          avatarUrl={user.avatar_url ?? ""}
        />
      </header>

      {/* credit card */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-bg-elevated p-4">
        <div>
          <p className="text-xs text-text-muted">보유 크레딧</p>
          <p className="text-lg font-bold">{krw(user.credit_balance)}</p>
        </div>
        <button
          disabled
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-text-muted"
        >
          충전하기 (준비 중)
        </button>
      </div>

      {/* tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`/my?tab=${key}`}
            className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
              tab === key
                ? "border-brand-gradient text-text-primary"
                : "border-border text-text-secondary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {tab === "saved" && <Grid items={await getSavedTeasers(user.id)} empty="저장한 작품이 없어요" />}
      {tab === "liked" && <Grid items={await getLikedTeasers(user.id)} empty="좋아요한 작품이 없어요" />}
      {tab === "comments" && <MyComments items={await getUserComments(user.id)} />}
      {tab === "funding" && <MyFunding items={await getUserPledges(user.id)} />}
      {tab === "works" && isCreator && (
        <MyWorks items={await getCreatorTeasers(user.id)} />
      )}
      {tab === "notifications" && (
        <MyNotifications items={await getNotifications(user.id)} />
      )}
      {tab === "settings" && <SettingsPanel role={user.role} />}
    </div>
  );
}

async function Grid({
  items,
  empty,
}: {
  items: Awaited<ReturnType<typeof getSavedTeasers>>;
  empty: string;
}) {
  if (items.length === 0) return <EmptyState title={empty} />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((vm) => (
        <TeaserCard key={vm.teaser.id} vm={vm} />
      ))}
    </div>
  );
}

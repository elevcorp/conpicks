import { PageHeader } from "@/components/common/Nav";
import { MyPage } from "@/components/common/MyPage";
import Link from "next/link";
import { Settings } from "lucide-react";

export const metadata = { title: "MY" };

export default function MyRoute() {
  return (
    <main className="pb-24 md:pt-16">
      <PageHeader
        title="MY"
        right={
          <Link href="/settings" aria-label="설정" className="-mr-2 grid size-10 place-items-center rounded-full hover:bg-chip">
            <Settings size={22} />
          </Link>
        }
      />
      <MyPage />
    </main>
  );
}

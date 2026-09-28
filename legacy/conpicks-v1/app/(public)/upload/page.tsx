import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/data";
import { switchToCreator } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { UploadWizard } from "./UploadWizard";

export const metadata = { title: "작품 올리기" };

export default async function UploadPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/upload");

  if (user.role !== "creator" && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md space-y-5 py-10 text-center">
        <span className="text-5xl">🎬</span>
        <h1 className="text-xl font-extrabold">창작자만 업로드할 수 있어요</h1>
        <p className="text-sm text-text-secondary">
          시청자 계정을 창작자로 전환하면 바로 티저를 올릴 수 있어요. 전환
          후에는 창작자 프로필(활동명·AI 툴) 한 단계만 입력하면 됩니다.
        </p>
        <form action={switchToCreator}>
          <Button type="submit" size="lg" className="w-full">
            창작자로 전환하기
          </Button>
        </form>
        <Link href="/" className="block text-sm text-text-muted underline">
          나중에 할게요
        </Link>
      </div>
    );
  }

  const settings = await getAppSettings();
  return (
    <UploadWizard
      minSec={parseInt(settings.TEASER_MIN_DURATION_SEC ?? "90", 10)}
      maxSec={parseInt(settings.TEASER_MAX_DURATION_SEC ?? "240", 10)}
      maxMb={parseInt(settings.TEASER_MAX_UPLOAD_MB ?? "500", 10)}
      creatorTools={user.creator_ai_tools ?? []}
    />
  );
}

import { getSessionUser } from "@/lib/auth";
import { CreatorForm } from "./CreatorForm";

export const metadata = { title: "창작자 정보" };

export default async function CreatorOnboardingPage() {
  const user = await getSessionUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">창작자 프로필</h1>
        <p className="mt-1 text-sm text-text-secondary">
          작품 페이지에 표시됩니다. 한 단계만 더요.
        </p>
      </div>
      <CreatorForm defaultName={user?.creator_name ?? user?.nickname ?? ""} />
    </div>
  );
}

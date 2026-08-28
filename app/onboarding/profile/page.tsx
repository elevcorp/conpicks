import { getSessionUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "프로필 설정" };

export default async function ProfilePage() {
  const user = await getSessionUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">프로필을 만들어요</h1>
        <p className="mt-1 text-sm text-text-secondary">
          닉네임과 아바타를 설정하세요.
        </p>
      </div>
      <ProfileForm
        defaultNickname={user?.nickname ?? ""}
        defaultAvatar={user?.avatar_url ?? ""}
      />
    </div>
  );
}

import { RolePicker } from "./RolePicker";

export const metadata = { title: "역할 선택" };

export default function RolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">어떻게 참여하시겠어요?</h1>
        <p className="mt-1 text-sm text-text-secondary">
          나중에 설정에서 바꿀 수 있어요.
        </p>
      </div>
      <RolePicker />
    </div>
  );
}

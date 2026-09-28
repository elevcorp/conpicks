export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-aurora px-5 py-10">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

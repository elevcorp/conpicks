import { cn } from "@/lib/cn";

export function EmptyState({ icon, title, desc, action, className }: {
  icon?: React.ReactNode; title: string; desc?: string; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-20 text-center", className)}>
      {icon && <div className="mb-4 grid size-16 place-items-center rounded-full bg-chip text-fg-3">{icon}</div>}
      <p className="text-[16px] font-bold">{title}</p>
      {desc && <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-fg-3">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

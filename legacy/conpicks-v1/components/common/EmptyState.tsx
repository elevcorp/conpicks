import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-bg-elevated/40 px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="mb-1 text-text-muted">{icon}</div>}
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {description && (
        <p className="max-w-xs text-xs leading-relaxed text-text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

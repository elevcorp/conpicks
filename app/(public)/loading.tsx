import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[62vh] min-h-[420px] w-full rounded-2xl" />
      {[0, 1, 2].map((r) => (
        <div key={r} className="space-y-2.5">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-[8.5rem] shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

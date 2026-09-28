export function PageSkeleton({ film }: { film?: boolean }) {
  return (
    <div className="mx-auto max-w-[1200px] animate-pulse px-4 pt-[72px] md:px-6 md:pt-24" aria-busy aria-label="불러오는 중">
      <div className={`skeleton rounded-2xl ${film ? "aspect-video" : "aspect-[16/10] md:aspect-[21/8]"}`} />
      <div className="skeleton mt-8 h-6 w-40 rounded" />
      <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`skeleton rounded-md ${film ? "aspect-video" : "aspect-[3/5]"}`} />
        ))}
      </div>
      <div className="skeleton mt-8 h-6 w-52 rounded" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton size-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div className="space-y-3">
        <p className="text-lg font-bold">문제가 발생했어요</p>
        <p className="text-sm text-text-muted">
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="bg-brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

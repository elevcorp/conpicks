"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function Inner({ onChange }: { onChange: (p: URLSearchParams) => void }) {
  const params = useSearchParams();
  useEffect(() => onChange(new URLSearchParams(params.toString())), [params, onChange]);
  return null;
}

/**
 * Reads query params without forcing the parent tree into client-only rendering
 * (only this null-rendering leaf suspends during static prerender).
 */
export function ParamSync({ onChange }: { onChange: (p: URLSearchParams) => void }) {
  return (
    <Suspense fallback={null}>
      <Inner onChange={onChange} />
    </Suspense>
  );
}

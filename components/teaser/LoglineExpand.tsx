"use client";

import { useState } from "react";

export function LoglineExpand({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <p className="text-sm leading-relaxed text-text-secondary">
      <span className={open ? "" : "line-clamp-2"}>{text}</span>
      {text.length > 90 && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-1 text-text-muted underline"
        >
          {open ? "접기" : "더보기"}
        </button>
      )}
    </p>
  );
}

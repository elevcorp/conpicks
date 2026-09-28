"use client";

/** Stable anonymous session id for view-event de-duplication. */
export function getViewSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem("cp_sid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("cp_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

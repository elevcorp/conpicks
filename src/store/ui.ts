"use client";
import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  tone?: "default" | "demo" | "success";
}

interface UIState {
  toasts: Toast[];
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: number) => void;
  cashSheet: boolean;
  setCashSheet: (open: boolean) => void;
  loginSheet: boolean;
  setLoginSheet: (open: boolean) => void;
}

let seq = 0;
export const useUI = create<UIState>()((set, get) => ({
  toasts: [],
  toast: (message, tone = "default") => {
    const id = ++seq;
    set({ toasts: [...get().toasts.slice(-2), { id, message, tone }] });
    setTimeout(() => get().dismiss(id), 2600);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  cashSheet: false,
  setCashSheet: (cashSheet) => set({ cashSheet }),
  loginSheet: false,
  setLoginSheet: (loginSheet) => set({ loginSheet }),
}));

export const demoToast = (what = "실제 결제 없이 처리되었어요") => useUI.getState().toast(`시연 모드 · ${what}`, "demo");

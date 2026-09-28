import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { getSessionUser } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json({ error: message, detail: extra }, { status });
}

export async function parse<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return schema.parse(body);
}

export function parseQuery<T>(url: string, schema: ZodType<T>): T {
  const sp = new URL(url).searchParams;
  return schema.parse(Object.fromEntries(sp.entries()));
}

/** Wrap a handler: turns thrown auth/zod/plain errors into JSON responses. */
export function handler<Ctx = unknown>(
  fn: (req: Request, ctx: Ctx) => Promise<Response>,
) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ZodError) {
        return fail("입력값이 올바르지 않습니다.", 422, e.flatten());
      }
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      if (msg === "UNAUTHENTICATED") return fail("로그인이 필요합니다.", 401);
      if (msg === "FORBIDDEN") return fail("권한이 없습니다.", 403);
      return fail(msg, 400);
    }
  };
}

export async function currentUser(): Promise<Profile | null> {
  return getSessionUser();
}
export async function requireUserApi(): Promise<Profile> {
  const u = await getSessionUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  return u;
}

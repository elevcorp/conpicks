import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const USE_SUPABASE =
  (process.env.NEXT_PUBLIC_USE_SUPABASE === "true" ||
    process.env.NEXT_PUBLIC_USE_SUPABASE === "1") &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL;

const MOCK_UID_COOKIE = "cp_uid";
const ONBOARDED_COOKIE = "cp_onboarded"; // "1" once role + profile chosen

/** Routes that require a completed onboarding. */
const PROTECTED = [
  "/my",
  "/upload",
  "/community/write",
  "/reviewer",
  "/admin",
  "/funding",
];

function isProtected(pathname: string) {
  return PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let res = NextResponse.next({ request: req });

  let authed = false;
  let onboarded = req.cookies.get(ONBOARDED_COOKIE)?.value === "1";

  if (USE_SUPABASE) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (toSet) => {
            toSet.forEach(({ name, value }) => req.cookies.set(name, value));
            res = NextResponse.next({ request: req });
            toSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = !!user;
  } else {
    authed = !!req.cookies.get(MOCK_UID_COOKIE)?.value;
  }

  // Not signed in + hitting a protected route -> login
  if (isProtected(pathname) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but onboarding incomplete -> role picker
  if (
    authed &&
    !onboarded &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/login") &&
    (isProtected(pathname) || pathname === "/")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding/role";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)"],
};

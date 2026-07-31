import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import {
  clearOnboardedCookie,
  updateSession,
} from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/forgot-password"];

function withSessionCookies(
  target: NextResponse,
  source: NextResponse
): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
  return target;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  try {
    const { response, user, onboardingComplete, role } =
      await updateSession(request);

    const isPublicPath = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (pathname.startsWith("/dashboard") && !user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return withSessionCookies(NextResponse.redirect(loginUrl), response);
    }

    if (pathname === "/onboarding" && !user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", "/onboarding");
      return withSessionCookies(NextResponse.redirect(loginUrl), response);
    }

    if (user && pathname.startsWith("/dashboard") && !onboardingComplete) {
      return withSessionCookies(
        NextResponse.redirect(new URL("/onboarding", request.url)),
        response
      );
    }

    if (
      pathname === "/onboarding" &&
      user &&
      onboardingComplete &&
      !request.nextUrl.searchParams.has("update")
    ) {
      return withSessionCookies(
        NextResponse.redirect(new URL("/dashboard", request.url)),
        response
      );
    }

    if (pathname.startsWith("/admin")) {
      if (!user) {
        return withSessionCookies(
          NextResponse.redirect(new URL("/auth/login", request.url)),
          response
        );
      }
      if (role !== "admin") {
        return withSessionCookies(
          NextResponse.redirect(new URL("/dashboard", request.url)),
          response
        );
      }
    }

    if (isPublicPath && user && pathname.startsWith("/auth/")) {
      return withSessionCookies(
        NextResponse.redirect(new URL("/dashboard", request.url)),
        response
      );
    }

    if (pathname.startsWith("/dashboard") && onboardingComplete) {
      clearOnboardedCookie(response);
    }

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*", "/onboarding"],
};

import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/oauth";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { logger } from "@/lib/logger";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth", origin)
    );
  }

  const response = NextResponse.redirect(new URL(next, origin));
  const supabase = createRouteHandlerClient(response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logger.error("OAuth callback failed", { error: error.message });
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth", origin)
    );
  }

  return response;
}

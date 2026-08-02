import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/oauth";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { logger } from "@/lib/logger";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getSafeRedirectPath(searchParams.get("next") ?? "/onboarding");

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL("/auth/login?error=confirm", origin)
    );
  }

  const redirectUrl = new URL(next, origin);
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createRouteHandlerClient(response);

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    logger.error("Email confirm failed", { error: error.message });
    return NextResponse.redirect(
      new URL("/auth/login?error=confirm", origin)
    );
  }

  return response;
}

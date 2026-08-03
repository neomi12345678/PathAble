import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/oauth";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { logger } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email";

const NEW_USER_WINDOW_MS = 5 * 60 * 1000;

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logger.error("OAuth callback failed", { error: error.message });
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth", origin)
    );
  }

  const user = data.user;
  const isNewUser =
    user?.created_at &&
    Date.now() - new Date(user.created_at).getTime() < NEW_USER_WINDOW_MS;

  if (isNewUser && user.email) {
    const metadata = user.user_metadata as {
      full_name?: string;
      name?: string;
    };
    const firstName = (metadata.full_name ?? metadata.name ?? "")
      .trim()
      .split(/\s+/)[0];

    const result = await sendWelcomeEmail(user.email, firstName);
    if (!result.sent) {
      logger.warn("OAuth welcome email not sent", {
        email: user.email,
        error: result.error,
      });
    }
  }

  return response;
}

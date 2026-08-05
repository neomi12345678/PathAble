import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authRateLimitKey,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { logger } from "@/lib/logger";

const schema = z.object({
  email: z.string().email("אימייל לא תקין"),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
        { status: 400 }
      );
    }

    const rate = await checkRateLimit(
      authRateLimitKey("forgot-password", parsed.data.email, request),
      5,
      60 * 60_000
    );
    if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);

    const response = NextResponse.json({ data: { success: true } });
    const supabase = createRouteHandlerClient(response);
    const origin = new URL(request.url).origin;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || origin;

    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      { redirectTo: `${appUrl}/auth/callback?next=/dashboard/profile` }
    );

    if (error) {
      logger.warn("Forgot password failed", { error: error.message });
      return NextResponse.json(
        {
          error:
            "לא ניתן לשלוח קישור לאיפוס סיסמה כרגע — נסו שוב מאוחר יותר",
        },
        { status: 400 }
      );
    }

    return response;
  } catch (error) {
    logger.error("Forgot password failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}

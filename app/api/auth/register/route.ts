import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authRateLimitKey,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "סיסמה קצרה מדי"),
  fullName: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

function mapRegisterError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already") || lower.includes("registered")) {
    return "כתובת האימייל כבר רשומה במערכת";
  }
  return message;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
        { status: 400 }
      );
    }

    const { email, password, fullName, interests } = parsed.data;

    const rate = checkRateLimit(
      authRateLimitKey("register", email, request),
      8,
      60 * 60_000
    );
    if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);

    const parts = fullName?.trim().split(/\s+/) ?? [];
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    const admin = createAdminClient();
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      });

    if (createError) {
      return NextResponse.json(
        { error: mapRegisterError(createError.message) },
        { status: 400 }
      );
    }

    const profileUpdate: {
      first_name?: string;
      last_name?: string;
      email: string;
      interests?: string[];
    } = { email };

    if (firstName || lastName) {
      profileUpdate.first_name = firstName;
      profileUpdate.last_name = lastName;
    }
    if (interests?.length) {
      profileUpdate.interests = interests;
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", created.user.id);

    if (profileError) {
      logger.warn("Register profile update failed", {
        error: profileError.message,
      });
    }

    const welcomeResult = await sendWelcomeEmail(email, firstName);
    if (!welcomeResult.sent) {
      logger.warn("Welcome email not sent", {
        email,
        error: welcomeResult.error,
      });
    }

    const response = NextResponse.json({
      data: {
        success: true,
        welcomeEmailSent: welcomeResult.sent,
        welcomeEmailError: welcomeResult.error ?? null,
      },
    });
    const supabase = createRouteHandlerClient(response);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      logger.error("Register login after create failed", {
        error: loginError.message,
      });
      return NextResponse.json(
        {
          error:
            "החשבון נוצר אך ההתחברות האוטומטית נכשלה — נסו להתחבר עם האימייל והסיסמה",
        },
        { status: 500 }
      );
    }

    return response;
  } catch (error) {
    logger.error("Register failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}

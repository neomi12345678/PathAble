import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authRateLimitKey,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { isValidProfessionInterestId } from "@/lib/professions/profession-interests";

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

    const rate = await checkRateLimit(
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
        email_confirm: false,
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
      profileUpdate.interests = interests.filter(isValidProfessionInterestId);
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

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      new URL(request.url).origin.replace(/\/$/, "");

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          redirectTo: `${appUrl}/auth/callback?next=/onboarding`,
        },
      });

    if (linkError) {
      logger.warn("Verification link generation failed", {
        error: linkError.message,
      });
    }

    const verifyLink = linkData?.properties?.action_link;
    const verifyResult = verifyLink
      ? await sendVerificationEmail(email, firstName, verifyLink)
      : { sent: false, error: "verification link unavailable" };

    const welcomeResult = await sendWelcomeEmail(email, firstName);
    if (!welcomeResult.sent) {
      logger.warn("Welcome email not sent", {
        email,
        error: welcomeResult.error,
      });
    }

    return NextResponse.json({
      data: {
        success: true,
        emailVerificationRequired: true,
        verificationEmailSent: verifyResult.sent,
        welcomeEmailSent: welcomeResult.sent,
      },
    });
  } catch (error) {
    logger.error("Register failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}

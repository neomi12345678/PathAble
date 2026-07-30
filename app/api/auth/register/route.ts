import { NextResponse } from "next/server";
import { z } from "zod";
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
    const parts = fullName?.trim().split(/\s+/) ?? [];
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    const response = NextResponse.json({ data: { success: true } });
    const supabase = createRouteHandlerClient(response);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.session) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        return NextResponse.json({
          data: {
            success: true,
            needsEmailConfirmation: true,
          },
        });
      }
    }

    if (data.user) {
      const admin = createAdminClient();
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

      await admin.from("profiles").update(profileUpdate).eq("id", data.user.id);
    }

    if (data.user?.email) {
      void sendWelcomeEmail(data.user.email, firstName).catch(() => undefined);
    }

    return response;
  } catch (error) {
    logger.error("Register failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}

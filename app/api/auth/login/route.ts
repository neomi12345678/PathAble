import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "סיסמה קצרה מדי"),
});

function mapLoginError(message: string): string {
  if (message.toLowerCase().includes("email not confirmed")) {
    return "יש לאשר את האימייל לפני ההתחברות (בדוק/י בתיבת הדואר)";
  }
  return "אימייל או סיסמה שגויים";
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const error = result.error.issues[0]?.message ?? "קלט לא תקין";
      return NextResponse.json({ error }, { status: 400 });
    }

    const { email, password } = result.data;
    const response = NextResponse.json({ data: { success: true } });
    const supabase = createRouteHandlerClient(response);
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.message.toLowerCase().includes("email not confirmed")) {
      try {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (profile?.id) {
          await admin.auth.admin.updateUserById(profile.id, {
            email_confirm: true,
          });
          ({ error } = await supabase.auth.signInWithPassword({
            email,
            password,
          }));
        }
      } catch (confirmError) {
        logger.error("Auto email confirm failed", {
          error: String(confirmError),
        });
      }
    }

    if (error) {
      return NextResponse.json(
        { error: mapLoginError(error.message) },
        { status: 401 }
      );
    }

    return response;
  } catch (error) {
    logger.error("Login failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}

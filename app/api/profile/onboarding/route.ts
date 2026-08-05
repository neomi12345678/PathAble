import { NextResponse } from "next/server";

import { z } from "zod";

import {

  AUTISM_LEVELS,

  DIAGNOSIS_OPTIONS,

  type UserProfilePrefs,

} from "@/lib/user-profile";

import { getAuthUser } from "@/lib/data/auth";

import {

  getProfilePrefsForUser,

  updateProfileOnboarding,

} from "@/lib/data/profile";

import { awardBadge, BADGES } from "@/lib/data/achievements";



const diagnosisEnum = z.enum(

  DIAGNOSIS_OPTIONS as unknown as [string, ...string[]]

);



const autismLevelEnum = z.enum(

  AUTISM_LEVELS as unknown as [string, ...string[]]

);



const bodySchema = z

  .object({

    sector: z.string().min(1),

    disability_type: diagnosisEnum,

    autism_level: autismLevelEnum.optional(),

  })

  .superRefine((data, ctx) => {

    if (data.disability_type === "אוטיזם" && !data.autism_level) {

      ctx.addIssue({

        code: "custom",

        message: "יש לבחור רמת תפקוד לאוטיזם",

        path: ["autism_level"],

      });

    }

    if (data.disability_type !== "אוטיזם" && data.autism_level) {

      ctx.addIssue({

        code: "custom",

        message: "רמת תפקוד רלוונטית רק לאוטיזם",

        path: ["autism_level"],

      });

    }

  });



export async function POST(request: Request): Promise<NextResponse> {

  try {

    const json: unknown = await request.json();

    const parsed = bodySchema.safeParse(json);



    if (!parsed.success) {

      return NextResponse.json(

        { error: "יש לבחור מגזר, אבחנה ורמת תפקוד (לאוטיזם)" },

        { status: 400 }

      );

    }



    const user = await getAuthUser();

    if (!user) {

      return NextResponse.json(

        { error: "יש להתחבר כדי לשמור את הפרופיל" },

        { status: 401 }

      );

    }



    const profileInput: UserProfilePrefs = {

      sector: parsed.data.sector,

      disability_type: parsed.data.disability_type,

      autism_level:

        parsed.data.disability_type === "אוטיזם"

          ? (parsed.data.autism_level as UserProfilePrefs["autism_level"])

          : undefined,

      onboardingComplete: true,

    };



    const existing = await getProfilePrefsForUser(user.id);

    const profile = await updateProfileOnboarding(
      user.id,
      {
        ...profileInput,
        avatar: existing?.avatar,
      },
      user.email
    );

    await awardBadge(user.id, BADGES.onboarding);

    const res = NextResponse.json({ ok: true, profile });
    res.cookies.set("pathable_onboarded", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;

  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאה בשמירת הפרופיל";
    const friendly =
      message.toLowerCase().includes("invalid api key")
        ? "מפתח Supabase לא תקין ב-Vercel — עדכני NEXT_PUBLIC_SUPABASE_ANON_KEY ו-SUPABASE_SERVICE_ROLE_KEY"
        : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }

}



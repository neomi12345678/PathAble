import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidAvatarId } from "@/lib/profile-avatar";
import { getAuthUser } from "@/lib/data/auth";
import {
  getProfilePrefsForUser,
  updateProfileAvatar,
} from "@/lib/data/profile";

const bodySchema = z.object({
  avatar: z.string().refine(isValidAvatarId, "תמונת פרופיל לא תקינה"),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "תמונת פרופיל לא תקינה" }, { status: 400 });
    }

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    await updateProfileAvatar(user.id, parsed.data.avatar);
    const existing = await getProfilePrefsForUser(user.id);
    const profile = {
      sector: existing?.sector ?? "",
      disability_type: existing?.disability_type ?? "",
      autism_level: existing?.autism_level,
      onboardingComplete: existing?.onboardingComplete ?? false,
      avatar: parsed.data.avatar,
    };

    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json({ error: "שגיאה בשמירת תמונת הפרופיל" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/data/auth";
import {
  getProfilePrefsForUser,
  updateProfileDetails,
} from "@/lib/data/profile";

const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1, "שם פרטי חובה").max(50),
  last_name: z.string().trim().max(50).optional().default(""),
  phone: z.string().trim().max(20).optional().default(""),
  city: z.string().trim().max(50).optional().default(""),
  bio: z.string().trim().max(500).optional().default(""),
  skills: z.array(z.string().trim().min(1).max(50)).max(20).optional().default([]),
  interests: z.array(z.string()).max(10).optional().default([]),
});

export async function GET(): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ profile: null }, { status: 401 });
  }
  const profile = await getProfilePrefsForUser(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const json: unknown = await request.json();
    const parsed = updateProfileSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
        { status: 400 }
      );
    }

    await updateProfileDetails(user.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "שגיאה בשמירת הפרופיל" }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ ok: true });
}

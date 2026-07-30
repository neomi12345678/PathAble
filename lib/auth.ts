import { createClient } from "@/lib/supabase/server";

import { createAdminClient } from "@/lib/supabase/admin";

import { getProfilePrefsForUser } from "@/lib/data/profile";



export const ADMIN_ROLE = "admin";



export interface SessionData {

  userId: string;

  role: string;

  email?: string;

}



export async function getSession(): Promise<SessionData | null> {

  const supabase = createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) return null;



  const admin = createAdminClient();

  const { data: profile } = await admin

    .from("profiles")

    .select("role")

    .eq("id", user.id)

    .maybeSingle();



  return {

    userId: user.id,

    role: profile?.role ?? "user",

    email: user.email,

  };

}



export async function isAuthenticated(): Promise<boolean> {

  const session = await getSession();

  return session !== null;

}



export async function isAdmin(): Promise<boolean> {

  const session = await getSession();

  return session?.role === ADMIN_ROLE;

}



export async function hasCompletedOnboardingAuth(): Promise<boolean> {

  const supabase = createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) return false;

  const prefs = await getProfilePrefsForUser(user.id);

  return prefs?.onboardingComplete === true && !!prefs.disability_type;

}



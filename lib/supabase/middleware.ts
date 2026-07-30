import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isOnboardingCompleteFromMeta(
  metadata: Record<string, unknown> | undefined
): boolean {
  const disability = metadata?.disability_type;
  return (
    metadata?.onboarding_complete === true &&
    typeof disability === "string" &&
    disability.trim().length > 0
  );
}

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: { id: string; email?: string } | null;
  onboardingComplete: boolean;
  role: string;
}> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let onboardingComplete = false;
  let role = "user";

  if (user) {
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    if (isOnboardingCompleteFromMeta(metadata)) {
      onboardingComplete = true;
      role =
        typeof metadata?.role === "string" ? metadata.role : role;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete, disability_type, role")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profile?.onboarding_complete === true &&
      typeof profile.disability_type === "string" &&
      profile.disability_type.trim().length > 0
    ) {
      onboardingComplete = true;
    }
    role = profile?.role ?? role;
  }

  const onboardedCookie =
    request.cookies.get("pathable_onboarded")?.value === "1";
  if (user && onboardedCookie) {
    onboardingComplete = true;
  }

  return {
    response: supabaseResponse,
    user: user ? { id: user.id, email: user.email } : null,
    onboardingComplete,
    role,
  };
}

export function clearOnboardedCookie(response: NextResponse): void {
  response.cookies.delete("pathable_onboarded");
}

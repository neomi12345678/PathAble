"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/auth/oauth";

export function ConfirmEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: number | null = null;

    async function confirmEmail(): Promise<void> {
      const supabase = createClient();
      const next = getSafeRedirectPath(searchParams.get("next") ?? "/onboarding");
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;

      if (code) {
        // PKCE code from email links cannot be exchanged here (signup ran on server).
        if (cancelled) return;
        router.replace("/auth/login");
        return;
      }

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (cancelled) return;
        if (error) {
          setStatus("error");
          router.replace("/auth/login?error=confirm");
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const hash = window.location.hash.slice(1);
      if (hash.includes("access_token")) {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!error && data.session) {
          router.replace(next);
          router.refresh();
          return;
        }
      }

      const authListener = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (event === "SIGNED_IN" && session) {
          router.replace(next);
          router.refresh();
        }
      });
      subscription = authListener.data.subscription;

      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        void supabase.auth.getSession().then(({ data }) => {
          if (cancelled) return;
          if (data.session) {
            router.replace(next);
            router.refresh();
          } else {
            setStatus("error");
            router.replace("/auth/login?error=confirm");
          }
        });
      }, 4000);
    }

    void confirmEmail();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [router, searchParams]);

  if (status === "error") {
    return null;
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <p className="text-lg font-medium text-on-surface">מאמתים את האימייל...</p>
      <p className="text-sm text-on-surface-variant">רגע אחד, מעבירים אותך למערכת</p>
    </div>
  );
}

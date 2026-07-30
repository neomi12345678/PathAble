"use client";

import { useEffect, useState } from "react";
import type { SessionData } from "@/lib/auth";

interface AuthState {
  session: SessionData | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : { data: null }))
      .then((json) => setState({ session: json.data, isLoading: false }))
      .catch(() => setState({ session: null, isLoading: false }));
  }, []);

  return state;
}

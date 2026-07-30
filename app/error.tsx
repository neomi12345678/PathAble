"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ErrorState onRetry={reset} />
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { COMMON } from "@/utils/texts";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = COMMON.genericError,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          {COMMON.retry}
        </Button>
      )}
    </section>
  );
}

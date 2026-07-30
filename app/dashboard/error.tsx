"use client";

import { ErrorState } from "@/components/ui/ErrorState";

interface DashboardErrorProps {
  reset: () => void;
}

export default function DashboardError({ reset }: DashboardErrorProps) {
  return <ErrorState onRetry={reset} />;
}

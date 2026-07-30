export function getSafeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export function buildOAuthCallbackUrl(origin: string, next: string): string {
  const safeNext = getSafeRedirectPath(next);
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", safeNext);
  return url.toString();
}

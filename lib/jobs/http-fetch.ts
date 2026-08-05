const USER_AGENT = "PathAble/1.0 (+https://github.com/pathable)";

export interface FetchPageOptions {
  headers?: Record<string, string>;
}

export interface FetchPageResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  html: string;
  reason?: "gone" | "redirect_search" | "unavailable_text" | "fetch_error";
  errorDetail?: string;
}

const UNAVAILABLE_PATTERNS = [
  /המשרה\s+(?:אינ|לא)\s+(?:זמינ|קיימ)/u,
  /המשרה\s+הוסר/u,
  /לא\s+נמצא/u,
  /job\s+(?:is\s+)?(?:no longer|not)\s+(?:available|active|open)/i,
  /position\s+(?:has been|is)\s+(?:filled|closed)/i,
  /this\s+job\s+(?:is\s+)?(?:closed|expired)/i,
];

const SEARCH_REDIRECT_PATTERNS = [
  /\/jobs?\/?(?:search|$)/i,
  /\/search\//i,
  /freetxt=/i,
  /\/jobslobby\/[^/]+\/?$/i,
];

export const GOTFRIENDS_BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.gotfriends.co.il/",
  "Cache-Control": "no-cache",
};

export async function fetchJobPage(
  url: string,
  options?: FetchPageOptions,
  redirectDepth = 0
): Promise<FetchPageResult> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "text/html",
    ...options?.headers,
  };

  if (redirectDepth > 5) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      html: "",
      reason: "fetch_error",
      errorDetail: "too_many_redirects",
    };
  }

  try {
    const res = await fetch(url, {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(25_000),
    });

    if (res.status === 404 || res.status === 410) {
      return {
        ok: false,
        status: res.status,
        finalUrl: url,
        html: "",
        reason: "gone",
      };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location") ?? "";
      if (!location) {
        return {
          ok: false,
          status: res.status,
          finalUrl: url,
          html: "",
          reason: "fetch_error",
          errorDetail: "redirect_without_location",
        };
      }
      const target = location.startsWith("http")
        ? location
        : new URL(location, url).href;
      if (SEARCH_REDIRECT_PATTERNS.some((p) => p.test(target))) {
        return {
          ok: false,
          status: res.status,
          finalUrl: target,
          html: "",
          reason: "redirect_search",
        };
      }
      return fetchJobPage(target, options, redirectDepth + 1);
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        finalUrl: url,
        html: "",
        reason: "fetch_error",
      };
    }

    const html = await res.text();
    const finalUrl = res.url || url;

    if (UNAVAILABLE_PATTERNS.some((p) => p.test(html))) {
      return {
        ok: false,
        status: res.status,
        finalUrl,
        html,
        reason: "unavailable_text",
      };
    }

    return { ok: true, status: res.status, finalUrl, html };
  } catch (err) {
    const detail =
      err instanceof Error
        ? err.name === "TimeoutError" || err.message.includes("timeout")
          ? "timeout"
          : err.message.includes("certificate") || err.message.includes("SSL")
            ? "ssl_error"
            : err.message
        : "unknown";
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      html: "",
      reason: "fetch_error",
      errorDetail: detail,
    };
  }
}

export async function fetchText(url: string): Promise<string> {
  const page = await fetchJobPage(url);
  if (!page.ok) {
    throw new Error(`Fetch failed: ${page.reason ?? page.status}`);
  }
  return page.html;
}

export { USER_AGENT };

const USER_AGENT = "PathAble/1.0 (+https://github.com/pathable)";

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

export async function fetchJobPage(url: string): Promise<FetchPageResult> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
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
      return fetchJobPage(target);
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

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

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

const ALLOWED_HOST_SUFFIXES = [
  "drushim.co.il",
  "www.drushim.co.il",
  "gotfriends.co.il",
  "www.gotfriends.co.il",
  "greenhouse.io",
  "boards.greenhouse.io",
  "alljobs.co.il",
  "www.alljobs.co.il",
  "jobmaster.co.il",
  "www.jobmaster.co.il",
  "jobnet.co.il",
  "www.jobnet.co.il",
  "api.apify.com",
] as const;

const UNAVAILABLE_PATTERNS = [
  /המשרה\s+(?:אינ|לא)\s+(?:זמינ|קיימ)/u,
  /המשרה\s+הוסר/u,
  /(?:^|[\s>])404[\s<]|page\s+not\s+found/i,
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
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://www.gotfriends.co.il/",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

function isPrivateOrLocalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) {
    return true;
  }
  if (h === "0.0.0.0" || h.startsWith("127.") || h.startsWith("10.")) {
    return true;
  }
  if (h.startsWith("192.168.") || h.startsWith("169.254.")) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h.includes(":")) return true;
  return false;
}

function isAllowedFetchHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((suffix) => h === suffix || h.endsWith(`.${suffix}`));
}

function assertSafeFetchUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("invalid_url");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("non_https");
  }
  if (isPrivateOrLocalHost(parsed.hostname)) {
    throw new Error("blocked_host");
  }
  if (!isAllowedFetchHost(parsed.hostname)) {
    throw new Error("host_not_allowed");
  }
  return parsed;
}

async function readResponseTextLimited(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_RESPONSE_BYTES) {
    throw new Error("response_too_large");
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}

export interface FetchPageRetryOptions {
  maxRetries?: number;
  retryStatuses?: number[];
  minDelayMs?: number;
  maxDelayMs?: number;
}

const DEFAULT_RETRY_STATUSES = [403, 429, 503];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(minMs: number, maxMs: number, attempt: number): number {
  const base = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
  return base + attempt * 5_000;
}

export async function fetchJobPageWithRetry(
  url: string,
  options?: FetchPageOptions,
  retryOptions?: FetchPageRetryOptions
): Promise<FetchPageResult> {
  const maxRetries = retryOptions?.maxRetries ?? 2;
  const retryStatuses = retryOptions?.retryStatuses ?? DEFAULT_RETRY_STATUSES;
  const minDelayMs = retryOptions?.minDelayMs ?? 30_000;
  const maxDelayMs = retryOptions?.maxDelayMs ?? 60_000;

  let lastResult: FetchPageResult | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const result = await fetchJobPage(url, options);
    lastResult = result;

    if (result.ok) return result;

    const shouldRetry =
      attempt < maxRetries &&
      (retryStatuses.includes(result.status) ||
        result.errorDetail === "timeout");

    if (!shouldRetry) return result;

    await sleep(retryDelayMs(minDelayMs, maxDelayMs, attempt));
  }

  return lastResult ?? {
    ok: false,
    status: 0,
    finalUrl: url,
    html: "",
    reason: "fetch_error",
    errorDetail: "retry_exhausted",
  };
}

export async function fetchJobPage(
  url: string,
  options?: FetchPageOptions,
  redirectDepth = 0
): Promise<FetchPageResult> {
  try {
    assertSafeFetchUrl(url);
  } catch (err) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      html: "",
      reason: "fetch_error",
      errorDetail: err instanceof Error ? err.message : "invalid_url",
    };
  }

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

    const html = await readResponseTextLimited(res);
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

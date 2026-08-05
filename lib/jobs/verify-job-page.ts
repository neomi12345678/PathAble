import {
  fetchJobPage,
  fetchJobPageWithRetry,
  type FetchPageOptions,
  type FetchPageRetryOptions,
} from "@/lib/jobs/http-fetch";
import {
  isJobPostingActive,
  parseJobPostingJsonLd,
  type JobPostingJson,
} from "@/lib/jobs/job-posting";

export type JobVerifyFailure =
  | "gone"
  | "redirect_search"
  | "unavailable_text"
  | "no_jsonld"
  | "expired"
  | "fetch_error";

export interface VerifiedJobPage {
  ok: true;
  posting: JobPostingJson;
  html: string;
  finalUrl: string;
}

export interface FailedJobPage {
  ok: false;
  reason: JobVerifyFailure;
  finalUrl: string;
  httpStatus?: number;
}

export type JobPageVerification = VerifiedJobPage | FailedJobPage;

/** בודק שהמשרה עדיין קיימת באתר המקור */
export async function verifyJobPage(
  url: string,
  fetchOptions?: FetchPageOptions,
  retryOptions?: FetchPageRetryOptions
): Promise<JobPageVerification> {
  const page = retryOptions
    ? await fetchJobPageWithRetry(url, fetchOptions, retryOptions)
    : await fetchJobPage(url, fetchOptions);

  if (!page.ok) {
    const reason =
      page.reason === "gone"
        ? "gone"
        : page.reason === "redirect_search"
          ? "redirect_search"
          : page.reason === "unavailable_text"
            ? "unavailable_text"
            : "fetch_error";
    return { ok: false, reason, finalUrl: page.finalUrl, httpStatus: page.status };
  }

  const posting = parseJobPostingJsonLd(page.html, page.finalUrl || url);
  if (!posting) {
    return { ok: false, reason: "no_jsonld", finalUrl: page.finalUrl };
  }

  if (!isJobPostingActive(posting)) {
    return { ok: false, reason: "expired", finalUrl: page.finalUrl };
  }

  return {
    ok: true,
    posting,
    html: page.html,
    finalUrl: page.finalUrl,
  };
}

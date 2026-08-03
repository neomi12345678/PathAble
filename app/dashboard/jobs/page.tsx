import type { Metadata } from "next";
import { JobsBoard } from "@/components/jobs/JobsBoard";
import { getJobSyncMeta } from "@/lib/jobs/auto-sync";
import { JOBS } from "@/utils/texts";
import { getJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: `${JOBS.title} | עתיד מתאים`,
  description: JOBS.subtitle,
};

export default async function JobsPage() {
  const [jobs, syncMeta] = await Promise.all([getJobs(), getJobSyncMeta()]);

  return (
    <JobsBoard
      jobs={jobs}
      lastSyncedAt={syncMeta?.lastSyncedAt ?? null}
      syncInProgress={syncMeta?.syncInProgress ?? false}
    />
  );
}

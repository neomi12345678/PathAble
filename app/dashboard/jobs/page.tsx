import type { Metadata } from "next";
import { JobsBoard } from "@/components/jobs/JobsBoard";
import { JOBS } from "@/utils/texts";
import { getJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: `${JOBS.title} | עתיד מתאים`,
  description: JOBS.subtitle,
};

export default async function JobsPage() {
  return <JobsBoard jobs={await getJobs()} />;
}

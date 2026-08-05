import type { JobStructuredDetails } from "@/lib/jobs/job-details-extract";
import { getWorkModeLabel } from "@/lib/jobs/job-details-extract";
import { JOBS } from "@/utils/texts";

interface JobStructuredPanelProps {
  details: JobStructuredDetails;
  salary: string;
}

export function JobStructuredPanel({ details, salary }: JobStructuredPanelProps) {
  const rows: Array<{ label: string; value: string }> = [];

  if (salary && salary !== "לא צוין") {
    rows.push({ label: JOBS.salaryLabel, value: salary });
  }
  rows.push({
    label: JOBS.workModeLabel,
    value: getWorkModeLabel(details.workMode),
  });
  if (details.experience) {
    rows.push({ label: JOBS.experienceLabel, value: details.experience });
  }
  if (details.flexibleHours) {
    rows.push({ label: JOBS.hoursLabel, value: JOBS.flexibleHoursYes });
  }
  if (details.teamSize) {
    rows.push({ label: JOBS.teamSizeLabel, value: details.teamSize });
  }
  if (details.technologies.length > 0) {
    rows.push({
      label: JOBS.toolsLabel,
      value: details.technologies.join(" · "),
    });
  }

  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="job-structured-heading"
      className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
    >
      <h2
        id="job-structured-heading"
        className="mb-3 font-display text-base font-bold text-on-surface"
      >
        {JOBS.structuredTitle}
      </h2>
      <dl className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl bg-white px-3 py-2">
            <dt className="text-[11px] font-bold text-outline">{row.label}</dt>
            <dd className="text-sm font-medium text-on-surface">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

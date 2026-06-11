import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getMockJobs } from "@/lib/mock/api";

export default async function JobsPage() {
  const jobs = await getMockJobs();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">לוח משרות</h2>
        <p className="text-muted">{jobs.length} משרות פעילות</p>
      </div>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{job.title}</h3>
                <p className="text-sm text-muted">
                  {job.company} · {job.city}
                </p>
              </div>
              <span className="text-sm font-medium">{job.salary}</span>
            </div>
            <p className="mt-2 text-sm">{job.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{job.scope}</Badge>
              {job.work_from_home && <Badge>עבודה מהבית</Badge>}
              {job.accessibility && <Badge>נגישות</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export type WorkMode = "remote" | "hybrid" | "office" | "unknown";

export interface JobStructuredDetails {
  experience: string | null;
  technologies: string[];
  workMode: WorkMode;
  flexibleHours: boolean;
  teamSize: string | null;
}

const TECH_KEYWORDS = [
  "react",
  "node",
  "python",
  "java",
  "typescript",
  "javascript",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "figma",
  "excel",
  "salesforce",
  "sap",
  "c#",
  ".net",
  "angular",
  "vue",
  "postgres",
  "mongodb",
  "redis",
  "git",
  "jira",
  "tableau",
  "power bi",
] as const;

const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "עבודה מהבית",
  hybrid: "היברידי",
  office: "במשרד",
  unknown: "לא צוין",
};

export function getWorkModeLabel(mode: WorkMode): string {
  return WORK_MODE_LABELS[mode];
}

export function inferWorkMode(
  city: string,
  description: string,
  workFromHome: boolean
): WorkMode {
  const text = `${city} ${description}`.toLowerCase();
  if (/היבריד|hybrid/.test(text)) return "hybrid";
  if (workFromHome || /remote|מהבית|work from home|\bwfh\b/.test(text)) {
    return "remote";
  }
  if (/במשרד|on.?site|in.?office|משרד בלבד/.test(text)) return "office";
  return "unknown";
}

function extractExperience(text: string): string | null {
  const patterns = [
    /ניסיון של\s+(\d+(?:\s*-\s*\d+)?\+?\s*שנ[^\s,.]*)/iu,
    /(\d+\+?\s*(?:years|yrs)(?:\s+of\s+experience)?)/i,
    /(\d+\s*-\s*\d+\s*שנ[^\s,.]*\s*ניסיון)/iu,
    /(ללא ניסיון|לא נדרש ניסיון|no experience required|entry level)/i,
    /(0-1\s*שנ)/i,
    /(1-3\s*שנ)/i,
    /(3\+\s*שנ)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
    if (m?.[0]) return m[0].trim();
  }
  return null;
}

function extractTechnologies(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const tech of TECH_KEYWORDS) {
    if (lower.includes(tech)) {
      found.add(tech === "node" ? "Node.js" : tech === "c#" ? "C#" : tech);
    }
  }
  if (/node\.?js/.test(lower)) found.add("Node.js");
  if (/\bts\b|typescript/.test(lower)) found.add("TypeScript");
  return [...found].slice(0, 8);
}

function extractTeamSize(text: string): string | null {
  const m =
    text.match(/צוות של\s+(\d+[^\s,.]*)/iu) ??
    text.match(/team of\s+(\d+)/i) ??
    text.match(/(\d+)\s+עובדים/iu);
  return m?.[1] ? m[1].trim() : null;
}

function hasFlexibleHours(text: string): boolean {
  return /גמיש|flexible|שעות גמיש|שעות מותאמ|משרה חלקית|part.?time/i.test(
    text
  );
}

export function extractJobStructuredDetails(
  title: string,
  city: string,
  description: string,
  workFromHome: boolean
): JobStructuredDetails {
  const text = `${title}\n${description}`;
  return {
    experience: extractExperience(text),
    technologies: extractTechnologies(text),
    workMode: inferWorkMode(city, description, workFromHome),
    flexibleHours: hasFlexibleHours(text),
    teamSize: extractTeamSize(text),
  };
}

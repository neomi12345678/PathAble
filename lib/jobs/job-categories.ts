/** מזהי תחום — נשמרים ב-DB; תווית בעברית ל-UI */
export const JOB_CATEGORY_IDS = [
  "tech",
  "finance",
  "design",
  "marketing",
  "sales",
  "engineering",
  "health",
  "education",
  "legal",
  "logistics",
  "support",
  "hr_admin",
  "manufacturing",
  "hospitality",
  "other",
] as const;

export type JobCategoryId = (typeof JOB_CATEGORY_IDS)[number];

export const JOB_CATEGORY_LABELS: Record<JobCategoryId, string> = {
  tech: "טכנולוגיה ותכנות",
  finance: "כספים, חשבונאות וביקורת",
  design: "עיצוב, גרפיקה ואמנות",
  marketing: "שיווק, דיגיטל ורשתות",
  sales: "מכירות ופיתוח עסקי",
  engineering: "הנדסה",
  health: "רפואה, סיעוד ופרא-רפואי",
  education: "חינוך והדרכה",
  legal: "משפטים",
  logistics: "לוגיסטיקה, רכש ושרשרת אספקה",
  support: "שירות לקוחות ותמיכה",
  hr_admin: "הנהלה ומשאבי אנוש",
  manufacturing: "תעשייה וייצור",
  hospitality: "תיירות והסעדה",
  other: "אחר",
};

interface CategoryRule {
  id: JobCategoryId;
  patterns: RegExp[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    id: "tech",
    patterns: [
      /software|developer|devops|frontend|backend|full.?stack|qa\b|quality assurance|cyber|security engineer|data engineer|machine learning|ml engineer|ai engineer|helpdesk|it support|sysadmin|database|sql developer|mobile developer|android|ios developer|react|node\.?js|python developer|java developer|\.net|cloud engineer|sre\b|platform engineer|automation engineer|בדיקות תוכנה|מפתח|פיתוח|תוכנה|תכנות|devops|סייבר|אבטחת מידע|ניתוח נתונים|data scientist|מדען נתונים|תמיכה טכנית|הייטק|fullstack|פרונט|בק.?אנד|אוטומציה/i,
    ],
  },
  {
    id: "finance",
    patterns: [
      /accountant|accounting|audit|controller|cfo|bookkeeper|payroll|tax advisor|financial analyst|investment|actuary|ביקורת|רואה חשבון|הנהלת חשבונות|חשב|כספים|פיננס|מס\b|שכר|גבייה|אשראי|בנקא|actuarial/i,
    ],
  },
  {
    id: "design",
    patterns: [
      /graphic design|ux\b|ui\b|product design|illustrator|animator|video editor|creative|art director|industrial design|עיצוב גרפי|עיצוב ux|עיצוב ui|איור|צילום|עריכת וידאו|motion|מעצב|מעצבת|אמנות|creative director/i,
    ],
  },
  {
    id: "marketing",
    patterns: [
      /marketing|digital marketing|social media|content marketing|seo\b|sem\b|ppc|brand manager|community manager|copywriter|שיווק|דיגיטל|רשתות חברתיות|תוכן שיווקי|מדיה|performance marketing|growth/i,
    ],
  },
  {
    id: "sales",
    patterns: [
      /sales|business development|account executive|account manager|bdr|sdr|pre.?sales|מכירות|פיתוח עסקי|נציג מכירות|טלמרקeting|inside sales|field sales|biz dev/i,
    ],
  },
  {
    id: "engineering",
    patterns: [
      /civil engineer|mechanical engineer|electrical engineer|chemical engineer|structural|process engineer|hardware engineer|הנדס[הא]|הנדסאי|מהנדס|חשמל\b|מכונות|אזרחי|כימי|תכן\b|cad\b|bim\b/i,
    ],
  },
  {
    id: "health",
    patterns: [
      /nurse|nursing|physician|doctor|medical|healthcare|paramedic|therapist|physiotherapy|occupational therapy|speech therapy|clinical|pharmacist|lab technician|רופא|אח\b|אחות|סיעוד|רפוא|פרא.?רפוא|פיזיותרפ|ריפוי בעיסוק|קlinic|מעבדה רפואית|רנטgen/i,
    ],
  },
  {
    id: "education",
    patterns: [
      /teacher|teaching|instructor|trainer|tutor|education|kindergarten|school|academic|lecturer|הוראה|מורה|מדריך|מדריכה|חינוך|הדרכה|גן\b|סייעת|ספר\b|מרצה/i,
    ],
  },
  {
    id: "legal",
    patterns: [
      /lawyer|attorney|legal counsel|paralegal|law firm|litigation|משפט|עורך דין|עו״ד|פרקליט|יועץ משפטי|legal advisor/i,
    ],
  },
  {
    id: "logistics",
    patterns: [
      /logistics|supply chain|procurement|purchasing|warehouse|inventory|import export|shipping|dispatcher|לוגיסטיק|רכש|אחסנה|מחסן|שרשרת אספקה|שילוח|יבוא|יצוא/i,
    ],
  },
  {
    id: "support",
    patterns: [
      /customer service|customer support|call center|service representative|client support|שירות לקוחות|מוקד|נציג שירות|תמיכה\b(?! טכנית)|customer success|csm\b/i,
    ],
  },
  {
    id: "hr_admin",
    patterns: [
      /human resources|\bhr\b|recruiter|talent acquisition|office manager|administrative|executive assistant|משאבי אנוש|גיוס|recruitment|מנהלת משרד|אדמינ|הנהלה|office admin|people ops/i,
    ],
  },
  {
    id: "manufacturing",
    patterns: [
      /production|manufacturing|factory|quality control|machine operator|assembler|cnc|welder|ייצור|מפעל|תעשי|מפעיל מכונה|בקרת איכות|נגר|מסגר|רתך/i,
    ],
  },
  {
    id: "hospitality",
    patterns: [
      /hotel|restaurant|chef|cook|bartender|waiter|hospitality|tourism|housekeeping|מלונ|מסעד|טבח|שף|מלצר|תיירות|הסעדה|קייטring|event planner/i,
    ],
  },
];

export function isJobCategoryId(value: string): value is JobCategoryId {
  return (JOB_CATEGORY_IDS as readonly string[]).includes(value);
}

/** סיווג rule-based לפי כותרת + תיאור (עברית + אנגלית) */
export function inferJobCategory(title: string, description: string): JobCategoryId {
  const text = `${title} ${description}`.toLowerCase();
  let bestId: JobCategoryId = "other";
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = rule.id;
    }
  }

  return bestId;
}

export function getJobCategoryLabel(id: JobCategoryId | string): string {
  if (isJobCategoryId(id)) return JOB_CATEGORY_LABELS[id];
  return JOB_CATEGORY_LABELS.other;
}

/** מיפוי lobby GotFriends → קטגוריה (כשידוע מראש) */
export const GOTFRIENDS_LOBBY_CATEGORY: Record<string, JobCategoryId> = {
  qa: "tech",
  software: "tech",
  datasecurity: "tech",
  ai: "tech",
  devops: "tech",
  product: "tech",
  design: "design",
  projects: "engineering",
  graduates: "other",
  "executive-position": "hr_admin",
};

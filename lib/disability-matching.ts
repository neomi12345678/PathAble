import type { Job, Profession } from "@/types";
import type { AutismLevel } from "@/lib/user-profile";

/** מקסימום בונוס קרבה — משאירים מרווח מתחת ל-99 */
const MAX_PROXIMITY_BONUS = 18;
const SCORE_CAP_BEFORE_PROXIMITY = 99 - MAX_PROXIMITY_BONUS;

/** סף לסינון «מתאים לאבחנה» כשאין תג מדויק ב-disability_fit */
export const DIAGNOSIS_FILTER_MIN_SCORE = 70;

function hashId(id: string): number {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return sum;
}

function normalizeDiagnosis(diagnosis: string): string {
  return diagnosis.trim();
}

/** פירוק «תל אביב · חיפה · נשר» / פסיקים לרשימת יישובים */
export function parseLocalities(cityField: string): string[] {
  return cityField
    .split(/[·,|/]/u)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length >= 2);
}

function localityMatches(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  // מונע התאמות שווא על מחרוזות קצרות מדי
  if (shorter.length < 3) return false;
  return longer.includes(shorter);
}

/** אזורי מטרו — ערים שמזוהות כקרובות זו לזו */
const METRO_AREAS: readonly string[][] = [
  [
    "תל אביב",
    "רמת גן",
    "גבעתיים",
    "חולון",
    "בת ים",
    "בני ברק",
    "הרצליה",
    "ראשון לציון",
    "פתח תקווה",
    "רעננה",
    "כפר סבא",
    "נתניה",
    "רמת השרון",
    "הוד השרון",
    "ראש העין",
    "יהוד",
    "אור יהודה",
    "קריית אונו",
    "גבעת שמואל",
  ],
  [
    "חיפה",
    "קריית אתא",
    "קרית אתא",
    "נשר",
    "טירת כרמל",
    "יקנעם",
    "קריית ביאליק",
    "קריית מוצקין",
    "קריית ים",
    "קריית חיים",
    "טבעון",
    "עתלית",
    "רכסים",
    "קציר",
  ],
  ["ירושלים", "בית שמש", "מודיעין", "ביתר עילית", "מבשרת ציון"],
  ["באר שבע", "אשדוד", "אשקלון", "קרית גת", "קריית גת", "נתיבות", "אופקים", "דימונה"],
];

function getMetroIndexForLocality(locality: string): number {
  if (!locality) return -1;
  return METRO_AREAS.findIndex((area) =>
    area.some((member) => localityMatches(locality, member.toLowerCase()))
  );
}

function citiesMatch(jobCity: string, userCity: string): boolean {
  const jobParts = parseLocalities(jobCity);
  const userParts = parseLocalities(userCity);
  if (jobParts.length === 0 || userParts.length === 0) return false;
  return userParts.some((u) => jobParts.some((j) => localityMatches(u, j)));
}

function citiesInSameMetro(jobCity: string, userCity: string): boolean {
  if (citiesMatch(jobCity, userCity)) return false;
  const userMetros = new Set(
    parseLocalities(userCity)
      .map(getMetroIndexForLocality)
      .filter((idx) => idx >= 0)
  );
  if (userMetros.size === 0) return false;
  return parseLocalities(jobCity).some((j) => {
    const idx = getMetroIndexForLocality(j);
    return idx >= 0 && userMetros.has(idx);
  });
}

function applyProximityBonus(
  score: number,
  job: Job,
  userCity?: string
): number {
  if (!userCity?.trim()) return score;
  if (citiesMatch(job.city, userCity)) return score + 18;
  if (citiesInSameMetro(job.city, userCity)) return score + 10;
  return score;
}

function applySectorJobBonus(
  score: number,
  job: Job,
  sector?: string
): number {
  if (!sector?.trim()) return score;
  const text =
    `${job.title} ${job.company} ${job.description} ${job.city}`.toLowerCase();
  const s = sector.trim();

  if (s === "חרדי" || s.includes("חרד")) {
    if (
      /חרד|תורנ|בני ברק|ביתר|אלעד|מודיעין עילית|נשים בלבד|משרד נשי|לנשים|שמירת שבת|מקוואות/.test(
        text
      )
    ) {
      return score + 8;
    }
    if (/בני ברק|ביתר|אלעד|ירושלים/.test(text)) return score + 3;
  }

  if (s === "דתי" || (s.includes("דתי") && !s.includes("חרד"))) {
    if (/דתי|כיפה|ציונות דתית|ישיב|אולפנ/.test(text)) return score + 5;
  }

  return score;
}

function finalizeJobScore(
  rawScore: number,
  job: Job,
  userCity?: string
): number {
  const capped = Math.min(
    SCORE_CAP_BEFORE_PROXIMITY,
    Math.max(40, rawScore)
  );
  return Math.min(99, Math.max(40, applyProximityBonus(capped, job, userCity)));
}

function diagnosisInFit(diagnosis: string, fitList: string[]): number {
  const d = normalizeDiagnosis(diagnosis);
  if (!d) return -1;
  const idx = fitList.findIndex(
    (item) => item === d || item.includes(d) || d.includes(item)
  );
  return idx;
}

export function jobMatchesDiagnosis(job: Job, diagnosis: string): boolean {
  if (!normalizeDiagnosis(diagnosis)) return false;
  return diagnosisInFit(diagnosis, job.disability_fit) !== -1;
}

export function professionMatchesDiagnosis(
  profession: Profession,
  diagnosis: string
): boolean {
  if (!normalizeDiagnosis(diagnosis)) return false;
  return diagnosisInFit(diagnosis, profession.disability_fit) !== -1;
}

/**
 * האם המשרה באזור המשתמש.
 * בודק את כל היישובים בשדה העיר (לא רק את הראשון).
 * בלי עיר משתמש → false (לא «הכל מתאים»).
 */
export function jobMatchesUserCity(job: Job, userCity?: string): boolean {
  if (!userCity?.trim()) return false;
  if (!job.city?.trim()) return false;
  return (
    citiesMatch(job.city, userCity) || citiesInSameMetro(job.city, userCity)
  );
}

export function extractJobCityName(city: string): string {
  return parseLocalities(city)[0] ?? city.trim().toLowerCase();
}

function applyAutismLevelProfessionBonus(
  score: number,
  profession: Profession,
  autismLevel: AutismLevel
): number {
  const social = profession.social_interaction_level;
  let adjusted = score;

  if (autismLevel === "נמוך") {
    if (social === "נמוך") adjusted += 6;
    if (social === "גבוה") adjusted -= 12;
  } else if (autismLevel === "בינוני") {
    if (social === "נמוך") adjusted += 3;
    if (social === "גבוה") adjusted -= 4;
  } else if (autismLevel === "גבוה") {
    if (social === "נמוך" || social === "בינוני") adjusted += 4;
    if (social === "גבוה") adjusted += 2;
  }

  return adjusted;
}

function applyAutismLevelJobBonus(
  score: number,
  job: Job,
  autismLevel: AutismLevel
): number {
  const social = job.social_interaction_level;
  let adjusted = score;

  if (autismLevel === "נמוך") {
    if (job.support_features.length >= 2) adjusted += 8;
    if (social === "נמוך") adjusted += 6;
    if (social === "גבוה") adjusted -= 12;
  } else if (autismLevel === "בינוני") {
    if (job.support_features.length >= 1) adjusted += 4;
    if (social === "נמוך") adjusted += 3;
    if (social === "גבוה") adjusted -= 4;
  } else if (autismLevel === "גבוה") {
    if (social === "נמוך" || social === "בינוני") adjusted += 4;
    if (social === "גבוה") adjusted += 2;
    if (job.support_features.length >= 3) adjusted -= 2;
  }

  return adjusted;
}

function applyAutismSignalsWithoutLevel(score: number, job: Job): number {
  let adjusted = score;
  if (job.social_interaction_level === "נמוך") adjusted += 8;
  if (job.support_features.length >= 2) adjusted += 4;
  if (job.work_from_home) adjusted += 3;
  return adjusted;
}

export function getProfessionMatchScore(
  profession: Profession,
  diagnosis: string,
  autismLevel?: AutismLevel
): number {
  const d = normalizeDiagnosis(diagnosis);
  if (!d) {
    return 52 + (hashId(profession.id) % 6);
  }

  const fitIdx = diagnosisInFit(d, profession.disability_fit);

  let score: number;
  if (fitIdx === -1) {
    score = 48 + (hashId(profession.id + d) % 14);
    if (d === "אוטיזם" && autismLevel) {
      score = applyAutismLevelProfessionBonus(score, profession, autismLevel);
    } else if (
      d === "אוטיזם" &&
      profession.social_interaction_level === "נמוך"
    ) {
      score += 4;
    }
  } else {
    score = 90 - fitIdx * 5;
    if (d === "אוטיזם" && autismLevel) {
      score = applyAutismLevelProfessionBonus(score, profession, autismLevel);
    } else if (
      d === "אוטיזם" &&
      profession.social_interaction_level === "נמוך"
    ) {
      score += 6;
    }
  }

  if (d === "חרדה חברתית" && profession.social_interaction_level === "נמוך") {
    score += 5;
  }

  return Math.min(99, Math.max(40, score + (hashId(profession.id) % 3)));
}

export function sortProfessionsByDiagnosis(
  professions: Profession[],
  diagnosis: string,
  autismLevel?: AutismLevel
): Profession[] {
  return [...professions].sort(
    (a, b) =>
      getProfessionMatchScore(b, diagnosis, autismLevel) -
      getProfessionMatchScore(a, diagnosis, autismLevel)
  );
}

export function getJobMatchScore(
  job: Job,
  diagnosis: string,
  autismLevel?: AutismLevel,
  userCity?: string,
  sector?: string
): number {
  const d = normalizeDiagnosis(diagnosis);

  if (!d) {
    let base = 55 + (hashId(job.id) % 5);
    base = applySectorJobBonus(base, job, sector);
    return finalizeJobScore(base, job, userCity);
  }

  const fitIdx = diagnosisInFit(d, job.disability_fit);
  let score: number;

  if (fitIdx === -1) {
    score = 50 + (hashId(job.id + d) % 16);
    if (d === "אוטיזם" && autismLevel) {
      score = applyAutismLevelJobBonus(score, job, autismLevel);
    } else if (d === "אוטיזם") {
      score = applyAutismSignalsWithoutLevel(score, job);
    }
  } else {
    score = 88 - fitIdx * 4;
    if (d === "אוטיזם" && autismLevel) {
      score = applyAutismLevelJobBonus(score, job, autismLevel);
    } else if (d === "אוטיזם") {
      score = applyAutismSignalsWithoutLevel(score, job);
    }
  }

  score += hashId(job.id) % 3;
  score = applySectorJobBonus(score, job, sector);
  return finalizeJobScore(score, job, userCity);
}

export function sortJobsByDiagnosis(
  jobs: Job[],
  diagnosis: string,
  autismLevel?: AutismLevel,
  userCity?: string,
  sector?: string
): Job[] {
  return [...jobs].sort(
    (a, b) =>
      getJobMatchScore(b, diagnosis, autismLevel, userCity, sector) -
      getJobMatchScore(a, diagnosis, autismLevel, userCity, sector)
  );
}

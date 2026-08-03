import type { Job, Profession } from "@/types";
import type { AutismLevel } from "@/lib/user-profile";

/** מקסימום בונוס קרבה — משאירים מרווח מתחת ל-99 כדי שעיר/מטרו ישפיעו גם על משרות חזקות */
const MAX_PROXIMITY_BONUS = 18;
const SCORE_CAP_BEFORE_PROXIMITY = 99 - MAX_PROXIMITY_BONUS;

function hashId(id: string): number {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return sum;
}

function normalizeDiagnosis(diagnosis: string): string {
  return diagnosis.trim();
}

function extractCityName(city: string): string {
  return city.split("·")[0]?.trim().toLowerCase() ?? "";
}

function citiesMatch(jobCity: string, userCity: string): boolean {
  const job = extractCityName(jobCity);
  const user = extractCityName(userCity);
  if (!job || !user) return false;
  return job.includes(user) || user.includes(job);
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
  ],
  ["חיפה", "קרית אתא", "נשר", "טירת כרמל"],
  ["ירושלים", "בית שמש", "מודיעין"],
  ["באר שבע", "אשדוד", "אשקלון", "קרית גת"],
];

function getMetroIndex(city: string): number {
  const normalized = extractCityName(city);
  if (!normalized) return -1;
  return METRO_AREAS.findIndex((area) =>
    area.some(
      (member) =>
        normalized.includes(member) || member.includes(normalized)
    )
  );
}

function citiesInSameMetro(jobCity: string, userCity: string): boolean {
  if (citiesMatch(jobCity, userCity)) return false;
  const jobIdx = getMetroIndex(jobCity);
  const userIdx = getMetroIndex(userCity);
  return jobIdx !== -1 && jobIdx === userIdx;
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

/** ציון בסיס (אבחנה/תפקוד) נחתך ל-81 כדי שבונוס קרבה יישמר מתחת ל-99 */
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

export function jobMatchesUserCity(job: Job, userCity?: string): boolean {
  if (!userCity?.trim()) return true;
  return citiesMatch(job.city, userCity) || citiesInSameMetro(job.city, userCity);
}

export function extractJobCityName(city: string): string {
  return extractCityName(city);
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

/** ציון התאמת מקצוע לאבחנה (40–99). בלי אבחנה — ציון ניטרלי. */
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

/** ציון התאמת משרה לאבחנה (40–99). בלי אבחנה — ניטרלי + קרבה בלבד. */
export function getJobMatchScore(
  job: Job,
  diagnosis: string,
  autismLevel?: AutismLevel,
  userCity?: string
): number {
  const d = normalizeDiagnosis(diagnosis);

  if (!d) {
    return finalizeJobScore(55 + (hashId(job.id) % 5), job, userCity);
  }

  const fitIdx = diagnosisInFit(d, job.disability_fit);
  let score: number;

  if (fitIdx === -1) {
    score = 50 + (hashId(job.id + d) % 16);
    // רמת תפקוד משפיעה גם בלי fit — לפי social/support
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
  return finalizeJobScore(score, job, userCity);
}

export function sortJobsByDiagnosis(
  jobs: Job[],
  diagnosis: string,
  autismLevel?: AutismLevel,
  userCity?: string
): Job[] {
  return [...jobs].sort(
    (a, b) =>
      getJobMatchScore(b, diagnosis, autismLevel, userCity) -
      getJobMatchScore(a, diagnosis, autismLevel, userCity)
  );
}

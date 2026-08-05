export const PROFILE_COOKIE = "atid-profile";

/** אפשרויות אבחנה — חייבות להתאים ל-disability_fit במאגר המקצועות */
export const DIAGNOSIS_OPTIONS = [
  "אוטיזם",
  "ADHD",
  "לקות למידה",
  "חרדה חברתית",
  "לקות ראייה",
  "לקות שמיעה",
  "לקות פיזית",
] as const;

export const AUTISM_LEVELS = ["גבוה", "בינוני", "נמוך"] as const;

export type DiagnosisType = (typeof DIAGNOSIS_OPTIONS)[number];
export type AutismLevel = (typeof AUTISM_LEVELS)[number];

export interface UserProfilePrefs {
  sector: string;
  disability_type: string;
  autism_level?: AutismLevel;
  city?: string;
  onboardingComplete: boolean;
  avatar?: string;
  /** תחומי עניין מקצועיים — לסינון מאגר מקצועות */
  interests?: string[];
}

export function isValidDiagnosis(value: string): value is DiagnosisType {
  return (DIAGNOSIS_OPTIONS as readonly string[]).includes(value);
}

export function isValidAutismLevel(value: string): value is AutismLevel {
  return (AUTISM_LEVELS as readonly string[]).includes(value);
}

export function getDiagnosisLabel(prefs: UserProfilePrefs): string {
  if (prefs.disability_type === "אוטיזם" && prefs.autism_level) {
    return `אוטיזם · תפקוד ${prefs.autism_level}`;
  }
  return prefs.disability_type;
}

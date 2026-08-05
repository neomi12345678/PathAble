export const APP_NAME = "עתיד מתאים";

export const COMMON = {
  retry: "נסה שוב",
  send: "שלח",
  loading: "טוען...",
  internalError: "שגיאה פנימית",
  genericError: "אירעה שגיאה, נסה שוב",
  back: "חזרה",
} as const;

export const AUTH = {
  loginTitle: "התחברות",
  registerTitle: "הרשמה",
  emailLabel: "אימייל",
  passwordLabel: "סיסמה",
  loginButton: "התחבר",
  registerButton: "הירשם",
  forgotPassword: "שחזור סיסמה",
  noAccount: "אין לך חשבון?",
  hasAccount: "כבר יש לך חשבון?",
  loginSuccess: "התחברת בהצלחה",
  registerSuccess: "נרשמת בהצלחה",
  googleSignIn: "המשך עם Google",
  oauthError: "התחברות עם Google נכשלה, נסה שוב",
  orContinueWith: "או התחבר באמצעות",
} as const;

export const DASHBOARD = {
  welcome: "ברוך הבא לעתיד מתאים",
  greeting: "שלום",
  assessmentSummary: "סיכום אבחון אחרון",
} as const;

export const CHAT = {
  title: "יועץ קריירה AI",
  subtitle: "שוחח עם יועץ הקריירה שלך",
  placeholder: "כתוב הודעה...",
  typing: "היועץ מקליד...",
  loadError: "אירעה שגיאה בטעינת הצאט",
} as const;

export const ASSESSMENT = {
  title: "שאלון אבחון תעסוקתי",
  subtitle: "דרג כל שאלה מ-1 (בכלל לא) עד 5 (מאוד)",
  resultsTitle: "תוצאות האבחון",
  strengths: "חוזקות",
  recommendations: "המלצות מקצועיות",
  submit: "שלח אבחון",
  submitting: "שולח...",
  incomplete: "יש לענות על כל השאלות לפני שליחה",
  success: "האבחון הושלם בהצלחה",
} as const;

export const PROFESSIONS = {
  title: "מאגר מקצועות",
  available: "מקצועות זמינים",
  backToList: "חזרה למאגר",
  salary: "שכר",
  education: "השכלה",
  workEnv: "סביבת עבודה",
  socialLevel: "אינטראקציה חברתית",
  disabilityFit: "התאמה למוגבלויות",
  details: "לפרטים נוספים",
} as const;

export const JOBS = {
  title: "לוח משרות",
  subtitle:
    "משרות בישראל שנבחרו במיוחד לאנשים על הרצף האוטיסטי — סביבות מובנות, אינטראקיה נמוכה, ליווי בתעסוקה ועבודה מהבית",
  badge: "מותאם אישית",
  infoTitle: "איך בוחרים משרות כאן?",
  infoBody:
    "כל משרה נבדקת לפי רמת אינטראקיה חברתית, זמינות ליווי (שילובים, AKIM), גמישות (עבודה מהבית, שעות), וסביבה מובנית. ציון ההתאמה מחושב לפי הקריטריונים האלה — לא לפי קורות חיים.",
  active: "משרות פעילות",
  workFromHome: "עבודה מהבית",
  accessibility: "נגישות",
  searchPlaceholder: "חיפוש לפי תפקיד, חברה, עיר או תמיכה (ליווי, שקט)...",
  apply: "לפרטי המשרה",
  applyExternal: "להגשת מועמדות בדרושים IL",
  backToBoard: "חזרה ללוח משרות",
  detailTitle: "פרטי משרה",
  loading: "טוען משרות...",
  noResults: "לא נמצאו משרות התואמות לסינון",
  clearFilters: "נקה סינון",
  onlyRemote: "עבודה מהבית",
  onlyLowSocial: "אינטראקיה נמוכה",
  onlyWithSupport: "עם ליווי",
  onlyMyArea: "באזור שלי",
  allScopes: "כל סוגי המשרה",
  results: "משרות נמצאו",
  matchLabel: "התאמה",
  whyFits: "תקציר המשרה",
  structuredTitle: "פרטים מרכזיים",
  salaryLabel: "שכר",
  workModeLabel: "מיקום עבודה",
  experienceLabel: "ניסיון נדרש",
  hoursLabel: "שעות",
  flexibleHoursYes: "שעות גמישות",
  teamSizeLabel: "גודל צוות",
  toolsLabel: "כלים וטכנולוגיות",
  onlyFlexibleHours: "שעות גמישות",
  workModeAll: "כל סוגי המיקום",
  workModeRemote: "מהבית",
  workModeHybrid: "היברידי",
  workModeOffice: "במשרד",
  saveForLater: "שמור לעיון מאוחר",
  socialLevel: "אינטראקיה",
  viewProfession: "לפרופיל המקצוע ←",
  externalTitle: "גופים נוספים לחיפוש משרות בישראל",
  externalLinks: [
    { label: "שירות התעסוקה", url: "https://www.taasuka.gov.il/" },
    { label: "שילובים — ליווי בתעסוקה", url: "https://www.shiluvim.org.il/" },
    { label: "AKIM — תעסוקה", url: "https://www.akim.org.il/" },
    { label: "AllJobs", url: "https://www.alljobs.co.il/" },
  ],
} as const;

export const LEARNING = {
  title: "מרכז למידה",
  subtitle: "מודולים להכנה לתעסוקה — מותאמים לאנשים על הרצף האוטיסטי",
  startModule: "התחל מודול",
  continueModule: "המשך מודול",
  completed: "הושלם",
  quizTitle: "שאלון סיום",
  quizSubmit: "סיים מודול",
  quizSubmitting: "בודק תשובות...",
  quizSuccess: "כל הכבוד! המודול הושלם",
  quizFail: "לא כל התשובות נכונות, נסה שוב",
  backToCenter: "חזרה למרכז למידה",
  progress: "התקדמות",
  sectionLabel: "תוכן המודול",
} as const;

export const SKILLS = {
  title: "מיומנויות תעסוקה",
  subtitle: "תרגול מיומנויות לעבודה",
  completed: "הושלם",
  submitAnswer: "הגשת תשובה",
  nextQuestion: "לשאלה הבאה",
  summaryTitle: "סיכום התרגיל",
  summaryScore: "ענית נכון על {correct} מתוך {total} שאלות",
  moduleComplete: "כל הכבוד! סיימת את תרגיל המיומנות",
  backToSkills: "חזרה למיומנויות",
  questionOf: "שאלה {current} מתוך {total}",
  professionalTip: "טיפ מקצועי",
  yourProgress: "ההישגים שלך",
  community: "קהילה",
  avgTime: "זמן ממוצע לפתרון: 45 שניות",
  correctFeedback: "כל הכבוד! תשובה נכונה.",
  incorrectFeedback: "לא בדיוק... נסה לחשוב שוב.",
  saving: "שומר...",
} as const;

export const RIGHTS = {
  title: "זכויות",
  subtitle: "מידע על זכויות תעסוקתיות",
  topics: "נושאים מרכזיים",
  faq: "שאלות נפוצות",
  organizations: "גופים מסייעים",
} as const;

export const PROFILE = {
  title: "הגדרות פרופיל",
  subtitle: "נהל את המידע האישי שלך ואת העדפות המערכת",
  personalInfo: "פרטים אישיים",
  skillsInterests: "כישורים ותחומי עניין",
  preferences: "העדפות מערכת",
  security: "חשבון ואבטחה",
  assessmentResults: "תוצאות אבחון",
  savedProfessions: "מקצועות שמורים",
  progress: "התקדמות",
  name: "שם מלא",
  age: "גיל",
  city: "מיקום",
  sector: "מגזר",
  disability: "מוגבלות",
  email: "כתובת אימייל",
  phone: "מספר טלפון",
  bioPlaceholder: "ספר/י קצת על עצמך...",
  statusLooking: "סטטוס: מחפש/ת הזדמנויות",
  completion: "השלמת פרופיל",
  advisorTitle: "יועץ הקריירה החכם",
  advisorDesc: "שוחח/י עם היועץ לקבלת המלצות מותאמות לפי האבחון והפרופיל שלך",
  advisorCta: "לשיחה עם היועץ",
  mainSkills: "כישורים מרכזיים",
  addSkill: "+ הוסף כישור",
  interests: "תחומי עניין מקצועיים",
  emailNotifications: "התראות באימייל",
  emailNotificationsDesc: "קבל/י עדכונים על משרות חדשות ישירות למייל",
  preferencesHint: "ההעדפות נשמרות יחד עם שאר פרטי הפרופיל בלחיצה על שמור שינויים.",
  changePassword: "שינוי סיסמה",
  deleteAccount: "מחיקת חשבון",
  cancel: "ביטול",
  save: "שמור שינויים",
  saved: "השינויים נשמרו בהצלחה",
  saveError: "לא ניתן לשמור את השינויים",
  deleteConfirmText: "פעולה זו תמחק לצמיתות את החשבון וכל הנתונים שלך. לא ניתן לשחזר.",
  deleteConfirmCta: "מחק לצמיתות",
  deleting: "מוחק...",
  deleteError: "שגיאה במחיקת החשבון",
  updateDiagnosis: "עדכון אבחנה ומגזר",
  changeAvatar: "שינוי תמונת פרופיל",
  avatarPickerHint: "בחר/י תמונה מוכנה או העלה/י מהמכשיר (JPG, PNG, WebP — עד 500KB)",
  uploadAvatar: "העלאת תמונה מהמכשיר",
  avatarSaved: "תמונת הפרופיל עודכנה",
  avatarSaveError: "לא ניתן לשמור את תמונת הפרופיל",
} as const;

export const ACHIEVEMENTS = {
  title: "המסע שלך עד כה",
  subtitle: "הישגים ונקודות ציון",
  heroDesc: (name: string, badgeCount: number, percent: number) =>
    `כל צעד קטן מוביל להישג גדול. ${name}, צברת כבר ${badgeCount} תגים והשלמת ${percent}% מהדרך למטרה הבאה שלך בקריירה.`,
  showCertificates: "הצג תעודות",
  shareProfile: "שתף פרופיל הישגים",
  badgeCollection: "אוסף התגים שלי",
  filterCategory: "סינון לפי קטגוריה",
  recentActivity: "פעילות אחרונה",
  careerPath: "מסלול קריירה",
  stepOf: (step: number, total: number) => `שלב ${step} מתוך ${total}`,
  continueLearning: "המשך בלמידה",
  leaderboard: "דירוג חברים",
  you: "את/ה",
  earned: "הושג!",
} as const;

export const HOME = {
  title: "עתיד מתאים",
  subtitle: "פלטפורמת הכוונה תעסוקתית לאנשים על הרצף האוטיסטי בישראל",
  cta: "כניסה למערכת",
} as const;

export const FOOTER = {
  rights: "כל הזכויות שמורות",
  tagline: "עתיד מתאים – הכוונה תעסוקתית לכל אחד",
  contactEmail: "info@atid-matim.co.il",
} as const;

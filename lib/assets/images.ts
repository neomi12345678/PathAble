/** Static image paths — files live in public/images/ (see scripts/download-images.mjs) */

function svgUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const AI_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="bg" x1="16" y1="8" x2="112" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#004c6e"/>
      <stop offset="0.45" stop-color="#006591"/>
      <stop offset="1" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="halo" x1="64" y1="24" x2="64" y2="88" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="face" x1="48" y1="42" x2="80" y2="78" gradientUnits="userSpaceOnUse">
      <stop stop-color="#e8f4ff"/>
      <stop offset="1" stop-color="#89ceff"/>
    </linearGradient>
    <linearGradient id="shoulder" x1="64" y1="78" x2="64" y2="108" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.12"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>
  <circle cx="22" cy="26" r="10" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="108" cy="18" r="6" fill="#ffc329" fill-opacity="0.35"/>
  <circle cx="14" cy="98" r="14" fill="#89ceff" fill-opacity="0.18"/>
  <ellipse cx="64" cy="56" rx="44" ry="40" fill="url(#halo)"/>
  <path d="M34 58c0-18 13-30 30-30s30 12 30 30" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="64" cy="28" r="5" fill="#ffc329"/>
  <circle cx="64" cy="28" r="8" stroke="#ffc329" stroke-opacity="0.35" stroke-width="2"/>
  <circle cx="64" cy="56" r="27" fill="url(#face)"/>
  <path d="M44 56c0-11 9-20 20-20s20 9 20 20v6c0 8-6 14-14 14H58c-8 0-14-6-14-14v-6z" fill="#006591" fill-opacity="0.08"/>
  <circle cx="53" cy="54" r="4.5" fill="#006591"/>
  <circle cx="75" cy="54" r="4.5" fill="#006591"/>
  <circle cx="54.5" cy="52.5" r="1.6" fill="#ffffff"/>
  <circle cx="76.5" cy="52.5" r="1.6" fill="#ffffff"/>
  <path d="M56 65.5C59 66.5 62 67 64 67C66 67 69 66.5 72 65.5" stroke="#006591" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M36 92c8-10 20-16 28-16s20 6 28 16" fill="url(#shoulder)"/>
  <path d="M36 92c8-10 20-16 28-16s20 6 28 16v12c-10-6-20-9-28-9s-18 3-28 9v-12z" fill="#ffffff" fill-opacity="0.18"/>
  <path d="M92 34l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8 1.8-4.2z" fill="#ffc329"/>
  <path d="M28 44l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2 1.2-2.8z" fill="#ffffff" fill-opacity="0.55"/>
  <rect x="46" y="88" width="36" height="22" rx="11" fill="#ffffff" fill-opacity="0.14"/>
  <path d="M58 98h12M64 92v12" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="98" cy="88" r="3" fill="#89ceff" filter="url(#soft)"/>
</svg>`;

export const IMAGES = {
  profileAvatar: "/images/ui/profile-avatar.png",
  learningFeature: "/images/ui/learning-feature.png",
  mentor: "/images/ui/mentor.png",
  loginIllustration: "/images/ui/login.png",
  professionHero: "/images/ui/profession-hero.png",
  professionWorkstation: "/images/ui/profession-workstation.png",
  rightsGuide: "/images/ui/rights-guide.png",
  aiAvatar: svgUri(AI_AVATAR_SVG),
  coachPortrait: "/images/ui/coach.png",
  skillsUserPortrait: "/images/ui/skills-portrait.png",
  adminAvatar: "/images/ui/admin-avatar.png",
} as const;

export const PROFESSION_IMAGES: readonly string[] = [
  "/images/professions/ux.png",
  "/images/professions/data.png",
  "/images/professions/marketing.png",
  "/images/professions/tech.png",
];

export const COURSE_IMAGES: readonly string[] = [
  "/images/courses/coding.png",
  "/images/courses/ux-design.png",
  "/images/courses/data.png",
  "/images/courses/interview.png",
  "/images/courses/office.png",
  "/images/courses/teamwork.png",
  "/images/courses/feedback.png",
  "/images/courses/time-management.png",
  "/images/courses/customer-service.png",
];

const COURSE_IMAGE_BY_CATEGORY: Record<string, string> = {
  "הכנה לראיון": "/images/courses/interview.png",
  "קורות חיים": "/images/courses/data.png",
  "התנהלות בעבודה": "/images/courses/office.png",
  "עבודה בצוות": "/images/courses/teamwork.png",
  "קבלת ביקורת": "/images/courses/feedback.png",
  "ניהול זמן": "/images/courses/time-management.png",
  "שירות לקוחות": "/images/courses/customer-service.png",
};

export function professionImage(index: number): string {
  return PROFESSION_IMAGES[index % PROFESSION_IMAGES.length];
}

export function courseImage(index: number): string {
  return COURSE_IMAGES[index % COURSE_IMAGES.length];
}

export function courseImageForCategory(category: string, fallbackIndex = 0): string {
  return COURSE_IMAGE_BY_CATEGORY[category] ?? courseImage(fallbackIndex);
}

-- רמת מבניות ותמיכה בתפקיד (מנותח ב-sync, לא לפי אוטיזם)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS support_level text NOT NULL DEFAULT 'moderate';

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_support_level_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_support_level_check
  CHECK (support_level IN ('structured', 'moderate', 'independent'));

CREATE INDEX IF NOT EXISTS jobs_support_level_active_idx
  ON public.jobs (support_level)
  WHERE active = true;

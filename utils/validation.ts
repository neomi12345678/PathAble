import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "הודעה ריקה")
    .max(2000, "הודעה ארוכה מדי"),
});

export const assessmentSubmitSchema = z.object({
  answers: z.record(
    z.string().regex(/^q-\d{3}$/),
    z.number().int().min(1).max(5)
  ),
});

export const professionIdSchema = z
  .string()
  .regex(/^prof-\d{3}$/, "מזהה מקצוע לא תקין");

export const jobIdSchema = z
  .string()
  .regex(
    /^(job-\d{3}|drushim-\d+|gotfriends-[a-z0-9\u0590-\u05FF-]+|alljobs-\d+|jobmaster-\d+|jobnet-\d+)$/,
    "מזהה משרה לא תקין"
  );

export const learningModuleIdSchema = z
  .string()
  .regex(/^learn-\d{3}$/, "מזהה מודול לא תקין");

export const skillModuleIdSchema = z
  .string()
  .regex(/^skill-\d{3}$/, "מזהה מיומנות לא תקין");

export const learningCompleteSchema = z.object({
  moduleId: learningModuleIdSchema,
  answers: z.record(z.string(), z.string()),
});

export const skillsProgressSchema = z.object({
  skillId: skillModuleIdSchema,
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
  isLast: z.boolean(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type AssessmentSubmitInput = z.infer<typeof assessmentSubmitSchema>;

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { data: T } | { error: string } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "קלט לא תקין";
    return { error: firstError };
  }

  return { data: result.data };
}

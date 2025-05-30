import { z } from "zod";

export const updateUserRequestSchema = z.object({
  name: z.string().min(1),
  resumeContent1: z.string().min(1500).max(5000),
  resumeContent2: z
    .string()
    .max(5000)
    .or(z.literal(""))
    .transform((val) => val || null),
  resumeContent3: z
    .string()
    .max(5000)
    .or(z.literal(""))
    .transform((val) => val || null),
  geminiKey: z.string().min(10),
  email: z.string().email(),
  coverLetterPrompt: z.string().min(100),
});
export type UpdateUserRequestType = z.infer<typeof updateUserRequestSchema>;

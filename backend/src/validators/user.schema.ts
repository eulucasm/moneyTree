import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  loginType: z.string().optional(),
  activePlan: z.string().optional(),
  savingsGoal: z.union([z.string(), z.number()]).optional(),
  language: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
});

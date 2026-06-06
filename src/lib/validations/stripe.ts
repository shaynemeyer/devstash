import { z } from 'zod';

export const CheckoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

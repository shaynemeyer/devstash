import { z } from 'zod';

// Used in Phase 2 for checkout session creation
export const CheckoutSchema = z.object({
  priceId: z.string().min(1),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

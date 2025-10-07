import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  company: z.string().max(100, "Company must be less than 100 characters").optional(),
  stage: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]).default("new"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadIdSchema = z.object({
  id: z.string().uuid("Invalid lead ID"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
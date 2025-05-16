import { z } from 'zod';

export const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  templateId: z.string().min(1, 'Template is required'),
  objectVariables: z.record(z.union([z.string(), z.number(), z.boolean()])),
  contactVariables: z.record(z.union([z.string(), z.number(), z.boolean()])),
  lineItemVariables: z.array(z.record(z.union([z.string(), z.number(), z.boolean()]))),
});

export type FormValues = z.infer<typeof documentSchema>; 
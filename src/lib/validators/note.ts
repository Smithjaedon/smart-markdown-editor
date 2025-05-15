import { z } from 'zod';

export const createNoteSchema = z.object({
	title: z.string().min(1),
	content: z.string().optional()
});

export const updateNoteSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).optional(),
	content: z.string().optional()
});

export type CreateNoteSchema = z.infer<typeof createNoteSchema>;
export type UpdateNoteSchema = z.infer<typeof updateNoteSchema>;

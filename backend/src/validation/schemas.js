const { z } = require('zod');

const roleEnum = z.enum(['admin', 'member']);
const taskStatusEnum = z.enum(['todo', 'in_progress', 'done']);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const signUpSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  password: z.string().min(6).max(64),
  role: roleEnum.optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const projectCreateSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional().or(z.literal('')),
});

const projectUpdateSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
});

const memberAssignSchema = z.object({
  userId: z.number().int().positive(),
});

const taskCreateSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(3000).optional().or(z.literal('')),
  status: taskStatusEnum.optional(),
  dueDate: isoDateSchema.optional().nullable(),
  assigneeId: z.number().int().positive().optional().nullable(),
});

const taskUpdateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(3000).optional().or(z.literal('')),
  status: taskStatusEnum.optional(),
  dueDate: isoDateSchema.optional().nullable(),
  assigneeId: z.number().int().positive().optional().nullable(),
});

module.exports = {
  signUpSchema,
  loginSchema,
  projectCreateSchema,
  projectUpdateSchema,
  memberAssignSchema,
  taskCreateSchema,
  taskUpdateSchema,
};

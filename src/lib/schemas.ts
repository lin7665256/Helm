import { z } from "zod";

// --- Report API Schema ---
export const reportSchema = z.object({
  agent_id: z.string().min(1).max(64),
  status: z.enum(["online", "busy", "error", "offline"]),
  current_task: z.string().nullable().optional(),
  tasks: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        title: z.string().min(1).max(256),
        status: z.enum(["pending", "in_progress", "done"]),
        priority: z.enum(["high", "medium", "low"]),
      })
    )
    .max(20)
    .optional(),
  activity: z
    .object({
      type: z.enum(["task_start", "task_done", "error", "heartbeat"]),
      description: z.string().max(1024),
      artifact_path: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  next_trigger: z.number().int().nullable().optional(),
  heartbeat: z.boolean().optional(),
});

// --- Agent Registration Schema ---
export const registerAgentSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, hyphens and underscores"),
  name: z.string().min(1).max(128),
});

// Type exports
export type ReportInput = z.infer<typeof reportSchema>;
export type RegisterAgentInput = z.infer<typeof registerAgentSchema>;

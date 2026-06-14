import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/errors";
import { reportSchema } from "@/lib/schemas";
import { verifyApiKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/v1/report — Agent status report (idempotent)
export async function POST(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.valid) return apiError("INVALID_API_KEY", "Invalid or missing API key");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON body");
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join("; "));
  }

  const data = parsed.data;
  const now = Math.floor(Date.now() / 1000);

  // Verify agent exists and matches API key
  const agent = await prisma.agent.findFirst({
    where: { id: data.agent_id },
  });
  if (!agent) {
    return apiError("AGENT_NOT_FOUND", `Agent '${data.agent_id}' not found`);
  }

  // Upsert agent_status
  await prisma.agentStatus.upsert({
    where: { agentId: data.agent_id },
    update: {
      status: data.status,
      currentTask: data.current_task ?? null,
      taskCount: data.tasks?.length ?? 0,
      nextTrigger: data.next_trigger ?? null,
      lastHeartbeat: data.heartbeat ? now : undefined,
      lastActivity: data.activity?.description ?? undefined,
      updatedAt: now,
    },
    create: {
      agentId: data.agent_id,
      status: data.status,
      currentTask: data.current_task ?? null,
      taskCount: data.tasks?.length ?? 0,
      nextTrigger: data.next_trigger ?? null,
      lastHeartbeat: data.heartbeat ? now : null,
      lastActivity: data.activity?.description ?? null,
      updatedAt: now,
    },
  });

  // Upsert tasks (idempotent: same agent_id + task_id → update, else create)
  if (data.tasks && data.tasks.length > 0) {
    const upsertOps = data.tasks.map((task) =>
      prisma.task.upsert({
        where: {
          agentId_id: { agentId: data.agent_id, id: task.id },
        },
        update: {
          title: task.title,
          status: task.status,
          priority: task.priority,
          completedAt: task.status === "done" ? now : null,
        },
        create: {
          id: task.id,
          agentId: data.agent_id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          createdAt: now,
          completedAt: task.status === "done" ? now : null,
        },
      })
    );
    await Promise.all(upsertOps);
  }

  // Create activity log
  if (data.activity) {
    await prisma.activity.create({
      data: {
        agentId: data.agent_id,
        eventType: data.activity.type,
        description: data.activity.description,
        artifactPath: data.activity.artifact_path ?? null,
        createdAt: now,
      },
    });
  }

  return apiSuccess({
    ok: true,
    agent_id: data.agent_id,
    timestamp: now,
    tasks_updated: data.tasks?.length ?? 0,
    activity_logged: !!data.activity,
  });
}

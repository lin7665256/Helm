import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/errors";
import { verifyApiKey, verifyDashboardAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/v1/agents/:id — Agent detail (supports API key self-query or dashboard auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Allow either API key auth (self-query) or dashboard auth
  const apiKeyAuth = await verifyApiKey(request);
  const dashAuthed = apiKeyAuth.valid ? false : await verifyDashboardAuth(request);

  if (!apiKeyAuth.valid && !dashAuthed) {
    return apiError("INVALID_API_KEY", "Authentication required");
  }

  // If API key auth, can only query own agent
  if (apiKeyAuth.valid && apiKeyAuth.agentId !== id) {
    return apiError("INVALID_API_KEY", "Cannot query other agents");
  }

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      status: true,
      tasks: {
        where: { status: { not: "done" } },
        orderBy: [
          { priority: "asc" }, // high < low alphabetically; we'll sort in code
          { createdAt: "desc" },
        ],
      },
      activities: {
        take: 20,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agent) {
    return apiError("AGENT_NOT_FOUND", `Agent '${id}' not found`);
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedTasks = agent.tasks.sort(
    (a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1)
  );

  return apiSuccess({
    agent: {
      id: agent.id,
      name: agent.name,
      source: agent.source,
      created_at: agent.createdAt,
      status: agent.status?.status ?? "offline",
      current_task: agent.status?.currentTask ?? null,
      task_count: agent.status?.taskCount ?? 0,
      next_trigger: agent.status?.nextTrigger ?? null,
      last_heartbeat: agent.status?.lastHeartbeat ?? null,
      last_activity: agent.status?.lastActivity ?? null,
    },
    tasks: sortedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      created_at: t.createdAt,
    })),
    recent_activities: agent.activities.map((a) => ({
      id: a.id,
      type: a.eventType,
      description: a.description,
      created_at: a.createdAt,
    })),
  });
}

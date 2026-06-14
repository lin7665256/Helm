import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/errors";
import { verifyDashboardAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const HEARTBEAT_TIMEOUT = 5 * 60; // 5 minutes in seconds

// GET /api/v1/dashboard — Aggregated dashboard data
export async function GET(request: NextRequest) {
  const authed = await verifyDashboardAuth(request);
  if (!authed) return apiError("INVALID_API_KEY", "Dashboard authentication required");

  const now = Math.floor(Date.now() / 1000);

  const [agents, recentActivities] = await Promise.all([
    prisma.agent.findMany({
      include: {
        status: true,
        tasks: {
          where: { status: { not: "done" } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activity.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        agent: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Build agent summaries with heartbeat anomaly detection
  const agentSummaries = agents.map((agent) => {
    const lastHb = agent.status?.lastHeartbeat ?? null;
    const heartbeatHealthy = lastHb !== null && (now - lastHb) < HEARTBEAT_TIMEOUT;

    return {
      id: agent.id,
      name: agent.name,
      source: agent.source,
      status: agent.status?.status ?? "offline",
      current_task: agent.status?.currentTask ?? null,
      task_count: agent.status?.taskCount ?? 0,
      next_trigger: agent.status?.nextTrigger ?? null,
      last_heartbeat: lastHb,
      heartbeat_healthy: heartbeatHealthy,
      last_activity: agent.status?.lastActivity ?? null,
      pending_tasks: agent.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
      })),
    };
  });

  // Global task stats
  const allPendingTasks = agents.flatMap((a) => a.tasks);
  const highPriority = allPendingTasks.filter((t) => t.priority === "high").length;

  // Activity feed
  const activityFeed = recentActivities.map((a) => ({
    id: a.id,
    agent_id: a.agentId,
    agent_name: a.agent.name,
    type: a.eventType,
    description: a.description,
    created_at: a.createdAt,
  }));

  return apiSuccess({
    summary: {
      total_agents: agents.length,
      online: agentSummaries.filter((a) => a.status === "online" || a.status === "busy").length,
      error: agentSummaries.filter((a) => a.status === "error").length,
      offline: agentSummaries.filter((a) => a.status === "offline").length,
      pending_tasks: allPendingTasks.length,
      high_priority_tasks: highPriority,
    },
    agents: agentSummaries,
    activity_feed: activityFeed,
    server_time: now,
  });
}

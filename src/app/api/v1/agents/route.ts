import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/errors";
import { registerAgentSchema } from "@/lib/schemas";
import { generateApiKey, hashApiKey, verifyDashboardAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/v1/agents — Register a new Agent
export async function POST(request: NextRequest) {
  // Dashboard auth required for registration
  const authed = await verifyDashboardAuth(request);
  if (!authed) return apiError("INVALID_API_KEY", "Dashboard authentication required");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON body");
  }

  const parsed = registerAgentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join("; "));
  }

  const { id, name } = parsed.data;

  // Check if agent already exists
  const existing = await prisma.agent.findUnique({ where: { id } });
  if (existing) {
    return apiError("VALIDATION_ERROR", `Agent '${id}' already exists`);
  }

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  const now = Math.floor(Date.now() / 1000);

  await prisma.agent.create({
    data: {
      id,
      name,
      apiKeyHash,
      source: "push",
      createdAt: now,
      status: {
        create: {
          status: "offline",
          updatedAt: now,
        },
      },
    },
  });

  return apiSuccess(
    {
      agent: { id, name, source: "push", created_at: now },
      api_key: apiKey, // Only returned once
      warning: "Save this API key securely. It will not be shown again.",
    },
    201
  );
}

// GET /api/v1/agents — List all agents (dashboard use)
export async function GET(request: NextRequest) {
  const authed = await verifyDashboardAuth(request);
  if (!authed) return apiError("INVALID_API_KEY", "Dashboard authentication required");

  const agents = await prisma.agent.findMany({
    include: {
      status: true,
      _count: { select: { tasks: true, activities: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess({
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      source: a.source,
      created_at: a.createdAt,
      status: a.status?.status ?? "offline",
      current_task: a.status?.currentTask ?? null,
      task_count: a.status?.taskCount ?? 0,
      last_heartbeat: a.status?.lastHeartbeat ?? null,
      pending_tasks: a._count.tasks,
      total_activities: a._count.activities,
    })),
  });
}

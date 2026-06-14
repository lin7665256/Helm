import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/errors";
import { verifyDashboardAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/v1/activities — Activity log with cursor-based pagination
export async function GET(request: NextRequest) {
  const authed = await verifyDashboardAuth(request);
  if (!authed) return apiError("INVALID_API_KEY", "Dashboard authentication required");

  const url = request.nextUrl;
  const cursor = url.searchParams.get("cursor"); // activity id for cursor
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const agentId = url.searchParams.get("agent_id"); // optional filter
  const eventType = url.searchParams.get("type"); // optional filter

  const where: Record<string, unknown> = {};
  if (agentId) where.agentId = agentId;
  if (eventType) where.eventType = eventType;

  const activities = await prisma.activity.findMany({
    where: cursor
      ? { ...where, id: { lt: parseInt(cursor) } }
      : where,
    take: limit + 1, // fetch one extra to check if there's more
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { id: true, name: true } },
    },
  });

  const hasMore = activities.length > limit;
  const page = hasMore ? activities.slice(0, limit) : activities;
  const nextCursor = hasMore ? String(page[page.length - 1].id) : null;

  return apiSuccess({
    activities: page.map((a) => ({
      id: a.id,
      agent_id: a.agentId,
      agent_name: a.agent.name,
      type: a.eventType,
      description: a.description,
      artifact_path: a.artifactPath,
      created_at: a.createdAt,
    })),
    pagination: {
      limit,
      next_cursor: nextCursor,
      has_more: hasMore,
    },
  });
}

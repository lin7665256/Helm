import { prisma } from "@/lib/db";
import { apiSuccess } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  let dbStatus = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  return apiSuccess({
    status: dbStatus === "ok" ? "healthy" : "degraded",
    database: dbStatus,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: Math.floor(Date.now() / 1000),
  });
}

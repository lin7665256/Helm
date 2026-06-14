import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

/** Generate a random API key with prefix */
export function generateApiKey(): string {
  return `helm_sk_${randomBytes(24).toString("hex")}`;
}

/** Hash API key with SHA-256 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** Verify API key from X-API-Key header */
export async function verifyApiKey(
  request: Request
): Promise<{ valid: boolean; agentId?: string }> {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return { valid: false };

  const hash = hashApiKey(apiKey);
  const agent = await prisma.agent.findFirst({
    where: { apiKeyHash: hash },
    select: { id: true },
  });

  if (!agent) return { valid: false };
  return { valid: true, agentId: agent.id };
}

/** Check dashboard password (simple session-based for Phase 1) */
export async function verifyDashboardAuth(
  request: Request
): Promise<boolean> {
  // For MVP: check Authorization Bearer token matches DASHBOARD_PASSWORD
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.slice(7);
  const expected = process.env.DASHBOARD_PASSWORD || "helm-admin";
  return token === expected;
}

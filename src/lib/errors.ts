import { NextResponse } from "next/server";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_API_KEY"
  | "AGENT_NOT_FOUND"
  | "DUPLICATE_TASK"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const statusMap: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  INVALID_API_KEY: 401,
  AGENT_NOT_FOUND: 404,
  DUPLICATE_TASK: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export function apiError(code: ErrorCode, message: string) {
  return NextResponse.json(
    { error: { code, message, status: statusMap[code] } },
    { status: statusMap[code] }
  );
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

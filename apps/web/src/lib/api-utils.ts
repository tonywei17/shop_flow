import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { verifyAdminSession, type VerifiedSessionPayload } from "./auth/verify-session";
import { parsePaginationParams, type PaginationParams } from "./pagination";

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

export type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// ---------------------------------------------------------------------------
// Response helpers (unchanged public API)
// ---------------------------------------------------------------------------

export function successResponse<T>(data: T, meta?: SuccessResponse<T>["meta"]) {
  return NextResponse.json({ success: true, data, meta } as SuccessResponse<T>, { status: 200 });
}

export function errorResponse(message: string, status: number = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details } as ErrorResponse, { status });
}

export function validationErrorResponse(error: ZodError) {
  return errorResponse("Validation failed", 400, error.flatten());
}

export function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return errorResponse(message, 500);
}

export async function withErrorHandler<T>(
  handler: () => Promise<T>,
): Promise<NextResponse<T | ErrorResponse>> {
  try {
    const result = await handler();
    if (result instanceof NextResponse) return result as NextResponse<T | ErrorResponse>;
    return successResponse(result) as NextResponse<T | ErrorResponse>;
  } catch (error) {
    console.error("[API Error]:", error);
    return serverErrorResponse(error);
  }
}

// Re-export pagination utilities so existing server-side imports still work
export { parsePaginationParams, type PaginationParams } from "./pagination";

// ---------------------------------------------------------------------------
// API handler factory  —  createApiHandler
// ---------------------------------------------------------------------------

export interface ApiContext {
  req: NextRequest;
  searchParams: URLSearchParams;
  session: VerifiedSessionPayload | null;
  pagination: PaginationParams;
  body: <T>(schema: ZodSchema<T>) => Promise<T>;
}

type HandlerFn = (ctx: ApiContext) => Promise<NextResponse>;

interface ApiHandlerConfig {
  auth?: boolean;
  pagination?: boolean | { defaultLimit?: number; maxLimit?: number };
}

export function createApiHandler(
  handler: HandlerFn,
  config: ApiHandlerConfig = {},
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Auth
      let session: VerifiedSessionPayload | null = null;
      if (config.auth !== false) {
        const result = await verifyAdminSession();
        if (!result.isValid || !result.payload) {
          return errorResponse(result.error ?? "Unauthorized", 401);
        }
        session = result.payload;
      }

      // Pagination
      const searchParams = new URL(req.url).searchParams;
      const paginationOpts = typeof config.pagination === "object" ? config.pagination : {};
      const pagination = config.pagination !== false
        ? parsePaginationParams(searchParams, paginationOpts)
        : { page: 1, limit: 50, offset: 0 };

      // Body parser with Zod validation (lazy)
      const body = async <T>(schema: ZodSchema<T>): Promise<T> => {
        const raw = await req.json().catch(() => ({}));
        const result = schema.safeParse(raw);
        if (!result.success) throw result.error;
        return result.data;
      };

      const ctx: ApiContext = { req, searchParams, session, pagination, body };
      return await handler(ctx);
    } catch (error) {
      if (error instanceof ZodError) {
        return validationErrorResponse(error);
      }
      console.error("[API Error]:", error);
      return serverErrorResponse(error);
    }
  };
}

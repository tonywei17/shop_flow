import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
  details?: any;
};

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * 统一成功响应
 */
export function successResponse<T>(data: T, meta?: SuccessResponse<T>["meta"]) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    } as SuccessResponse<T>,
    { status: 200 }
  );
}

/**
 * 统一错误响应
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    } as ErrorResponse,
    { status }
  );
}

/**
 * 统一 Zod 校验错误响应
 */
export function validationErrorResponse(error: ZodError<any>) {
  return errorResponse("Validation failed", 400, error.flatten());
}

/**
 * 统一服务器错误响应
 */
export function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return errorResponse(message, 500);
}

/**
 * API 处理包装器，用于捕获错误并统一格式
 */
export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse<T | ErrorResponse>> {
  try {
    const result = await handler();
    if (result instanceof NextResponse) {
      return result as NextResponse<T | ErrorResponse>;
    }
    return successResponse(result) as NextResponse<T | ErrorResponse>;
  } catch (error) {
    console.error("[API Error]:", error);
    return serverErrorResponse(error);
  }
}

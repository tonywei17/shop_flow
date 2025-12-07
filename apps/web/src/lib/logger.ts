/**
 * 统一日志处理工具
 * 在开发环境输出日志，生产环境可以对接外部日志服务
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const isDev = process.env.NODE_ENV === "development";

/**
 * 格式化日志消息
 */
function formatMessage(level: LogLevel, module: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}${contextStr}`;
}

/**
 * 创建模块级别的 logger
 */
export function createLogger(module: string) {
  return {
    debug: (message: string, context?: LogContext) => {
      if (isDev) {
        console.debug(formatMessage("debug", module, message, context));
      }
    },

    info: (message: string, context?: LogContext) => {
      if (isDev) {
        console.info(formatMessage("info", module, message, context));
      }
    },

    warn: (message: string, context?: LogContext) => {
      console.warn(formatMessage("warn", module, message, context));
    },

    error: (message: string, error?: unknown, context?: LogContext) => {
      const errorContext = {
        ...context,
        ...(error instanceof Error
          ? { errorMessage: error.message, stack: error.stack }
          : { error }),
      };
      console.error(formatMessage("error", module, message, errorContext));
    },
  };
}

/**
 * 默认 logger（用于快速使用）
 */
export const logger = createLogger("app");

/**
 * API 路由专用 logger
 */
export const apiLogger = createLogger("api");

/**
 * 数据库操作专用 logger
 */
export const dbLogger = createLogger("db");

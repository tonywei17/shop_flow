import { getSupabaseAdmin } from "./client";

export type AuditAction =
  | "login_success"
  | "login_failed"
  | "login_locked"
  | "order_created"
  | "order_cancelled"
  | "order_status_changed"
  | "inventory_adjusted"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "settings_updated"
  | "account_created"
  | "account_updated"
  | "password_changed";

export type AuditLogEntry = {
  id: string;
  action: AuditAction;
  actor_id: string | null;
  actor_type: "admin" | "user" | "system";
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type CreateAuditLogInput = {
  action: AuditAction;
  actorId?: string | null;
  actorType: "admin" | "user" | "system";
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  try {
    const sb = getSupabaseAdmin();

    await sb.from("audit_logs").insert({
      action: input.action,
      actor_id: input.actorId ?? null,
      actor_type: input.actorType,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      details: input.details ?? null,
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
    });
  } catch (error) {
    console.error("[createAuditLog] Failed to create audit log:", error);
  }
}

export type ListAuditLogsParams = {
  action?: AuditAction;
  actorId?: string;
  actorType?: "admin" | "user" | "system";
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
};

export async function listAuditLogs(
  params: ListAuditLogsParams = {}
): Promise<{ items: AuditLogEntry[]; count: number }> {
  const sb = getSupabaseAdmin();

  let query = sb
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.action) {
    query = query.eq("action", params.action);
  }
  if (params.actorId) {
    query = query.eq("actor_id", params.actorId);
  }
  if (params.actorType) {
    query = query.eq("actor_type", params.actorType);
  }
  if (params.targetType) {
    query = query.eq("target_type", params.targetType);
  }
  if (params.targetId) {
    query = query.eq("target_id", params.targetId);
  }
  if (params.startDate) {
    query = query.gte("created_at", params.startDate);
  }
  if (params.endDate) {
    query = query.lte("created_at", params.endDate);
  }

  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[listAuditLogs] Error:", error);
    return { items: [], count: 0 };
  }

  return {
    items: (data ?? []) as AuditLogEntry[],
    count: count ?? 0,
  };
}

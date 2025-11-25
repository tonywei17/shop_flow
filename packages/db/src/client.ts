import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY envs");
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[getSupabaseAdmin] Using Supabase config", {
      url,
      serviceKeyPrefix: typeof serviceKey === "string" ? serviceKey.slice(0, 8) : null,
    });
  }
  cached = createClient(url, serviceKey, { auth: { persistSession: false } });
  return cached;
}

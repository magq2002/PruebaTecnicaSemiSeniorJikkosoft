"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
    }
    return null;
  }

  if (cachedClient) return cachedClient;

  // Client component que sincroniza sesión vía cookies para SSR
  cachedClient = createClientComponentClient({
    supabaseUrl: url,
    supabaseKey: anonKey,
  }) as unknown as SupabaseClient;
  return cachedClient;
}
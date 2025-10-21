import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export function getSupabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  // Server client que usa cookies para adjuntar automáticamente el Authorization Bearer
  const client = createServerComponentClient({ cookies }, {
    supabaseUrl: url,
    supabaseKey: anonKey,
  }) as unknown as SupabaseClient;
  return client;
}
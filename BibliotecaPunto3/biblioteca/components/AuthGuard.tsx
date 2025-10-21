"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // If env missing, treat as unauthenticated and send to login
      router.replace("/login");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const hasSession = !!data.session;
      if (!hasSession) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-500">
        Comprobando sesión...
      </div>
    );
  }

  return <>{children}</>;
}
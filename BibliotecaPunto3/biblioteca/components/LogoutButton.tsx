"use client";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function LogoutButton() {
  const router = useRouter();
  const { success, error } = useToast();

  async function handleLogout() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      router.replace("/login");
      return;
    }
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      error("Error al cerrar sesión", signOutError.message);
    } else {
      success("Sesión cerrada");
    }
    router.replace("/login");
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleLogout}
      aria-label="Salir"
      title="Salir"
    >
      <LogOut />
    </Button>
  );
}
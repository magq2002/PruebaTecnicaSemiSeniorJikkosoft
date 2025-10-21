"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import EditProfileModal from "./ui/EditProfileModal";

export const dynamic = 'force-dynamic';

interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

export default function MyProfilePage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const id = session?.user?.id ?? null;
      if (!id) {
        // Si no hay sesión, nos apoyamos en el AuthGuard del layout para redirigir.
        setLoading(false);
        return;
      }
      setUserId(id);
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) console.error(error);
      setProfile(data ?? { id, full_name: null, email: session?.user?.email ?? null });
      setLoading(false);
    };
    run();
    // No deps; queremos correr una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mi Perfil</h2>
        <button
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          onClick={() => setEditOpen(true)}
          disabled={loading || !userId}
        >
          Editar perfil
        </button>
      </div>

      <div className="rounded border bg-white p-4">
        {loading ? (
          <p>Obteniendo perfil…</p>
        ) : profile ? (
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="text-sm text-gray-600">Nombre completo</span>
              <div>{profile.full_name ?? "—"}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Email</span>
              <div>{profile.email ?? "—"}</div>
            </div>
          </div>
        ) : (
          <p>No hay datos de perfil todavía.</p>
        )}
      </div>

      {editOpen && profile && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={profile}
          onSaved={async () => {
            setEditOpen(false);
            if (!supabase) return;
            const { data } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
            if (data) setProfile(data);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
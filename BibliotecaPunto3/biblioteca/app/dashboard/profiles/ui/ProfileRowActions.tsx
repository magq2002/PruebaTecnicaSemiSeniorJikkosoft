"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function ProfileRowActions({ id, init }: { id: string; init: { full_name: string; email: string } }) {
  const router = useRouter();
  const [full_name, setFullName] = useState(init.full_name);
  const [email, setEmail] = useState(init.email);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.from("profiles").update({ full_name, email }).eq("id", id);
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("¿Eliminar este profile?")) return;
    setDeleting(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.from("profiles").delete().eq("id", id);
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <input className="border rounded p-1" value={full_name} onChange={(e) => setFullName(e.target.value)} />
      <input className="border rounded p-1" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={save} className="rounded bg-gray-800 text-white px-3 py-1 text-sm" disabled={saving}>{saving ? "Guardando" : "Guardar"}</button>
        <button onClick={remove} className="rounded bg-red-600 text-white px-3 py-1 text-sm" disabled={deleting}>{deleting ? "Eliminando" : "Eliminar"}</button>
      </div>
    </div>
  );
}
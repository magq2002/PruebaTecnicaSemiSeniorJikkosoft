"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function NewLibraryForm() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError("Nombre mínimo 2 caracteres");
      return false;
    }
    if (address && address.trim().length < 5) {
      setError("Dirección muy corta");
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    if (!supabase) {
      setSaving(false);
      setError("Error de configuración de Supabase");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      setSaving(false);
      setError("No hay usuario autenticado.");
      return;
    }
    const payload = {
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      owner_id: user.id,
    };
    const { error: insertError } = await supabase.from("libraries").insert(payload);
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.refresh();
    setName("");
    setAddress("");
    setPhone("");
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Nombre</span>
        <input
          className="rounded border px-3 py-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          minLength={2}
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Dirección</span>
        <input
          className="rounded border px-3 py-2"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Teléfono</span>
        <input className="rounded border px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
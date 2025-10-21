"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function NewProfileForm() {
  const router = useRouter();
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase client no disponible en cliente");
      setLoading(false);
      return;
    }
    if (!supabase) {
      return;
    }
    const { error } = await supabase.from("profiles").insert({ full_name, email });
    if (error) setError(error.message);
    setLoading(false);
    setFullName("");
    setEmail("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-white p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="border rounded p-2" placeholder="Full Name" value={full_name} onChange={(e) => setFullName(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50">
          {loading ? "Guardando..." : "Crear Profile"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </form>
  );
}
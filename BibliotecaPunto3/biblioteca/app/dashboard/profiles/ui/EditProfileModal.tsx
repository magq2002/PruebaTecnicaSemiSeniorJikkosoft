"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/ui/Modal";

interface ProfileInitial {
  id?: string; // should match auth.users.id
  full_name?: string | null;
  email?: string | null;
}

export default function EditProfileModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ProfileInitial;
  onSaved?: () => void;
}) {
  const supabase = getSupabaseClient();
  const { error: errorToast } = useToast();
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  
  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!fullName.trim() || fullName.trim().length < 2) err.full_name = "Nombre mínimo 2 caracteres";
    if (email && email.trim()) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!ok) err.email = "Email inválido";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  
  const save = async () => {
    if (!initial?.id) {
      setErrors({ form: "No se encontró el usuario para actualizar el perfil." });
      return;
    }
    if (!validate()) return;
    setSaving(true);
    const payload = {
      full_name: fullName.trim() || null,
      email: email.trim() || null,
    };
    if (!supabase) {
      errorToast("Error de configuración de Supabase");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({ id: initial.id, ...payload });
    setSaving(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    onClose();
    onSaved?.();
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={"Editar perfil"}
      footer={
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-2" onClick={onClose} disabled={saving}>Cancelar</button>
          <button
            className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Nombre completo</span>
          <input
            className="rounded border px-3 py-2"
            value={fullName ?? ""}
            onChange={e => setFullName(e.target.value)}
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? "error-fullname" : undefined}
            required
            minLength={2}
          />
          {errors.full_name && <span id="error-fullname" className="text-xs text-red-600">{errors.full_name}</span>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Email</span>
          <input
            className="rounded border px-3 py-2"
            value={email ?? ""}
            onChange={e => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "error-email" : undefined}
            type="email"
          />
          {errors.email && <span id="error-email" className="text-xs text-red-600">{errors.email}</span>}
        </label>
        {errors.form && <div className="mb-2 text-sm text-red-700">{errors.form}</div>}
      </div>
    </Modal>
  );
}
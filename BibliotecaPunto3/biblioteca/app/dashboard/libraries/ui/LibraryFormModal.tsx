"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

interface LibraryInitial {
  id?: string;
  name?: string;
  address?: string | null;
  phone?: string | null;
}

export default function LibraryFormModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: LibraryInitial;
  onSaved?: () => void;
}) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { success, error: errorToast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  
  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!name.trim() || name.trim().length < 2) err.name = "Nombre mínimo 2 caracteres";
    if (address && address.trim().length < 5) err.address = "Dirección muy corta";
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  
  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const basePayload = {
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
    };
  
    let error: any = null;
    if (!supabase) {
      errorToast("Error de configuración de Supabase");
      return;
    }
    
    if (initial?.id) {
      // No cambiamos owner_id en edición para no romper políticas RLS
      const { error: e } = await supabase.from("libraries").update(basePayload).eq("id", initial.id);
      error = e;
    } else {
      // Obtener usuario autenticado para asignar owner_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        setSaving(false);
        const msg = "No hay usuario autenticado.";
        setErrors({ form: msg });
        errorToast("Error al crear librería", msg);
        return;
      }
      const payload = { ...basePayload, owner_id: user.id };
      const { error: e } = await supabase.from("libraries").insert(payload);
      error = e;
    }
    setSaving(false);
    if (error) {
      setErrors({ form: error.message });
      errorToast("Error al guardar librería", error.message);
      return;
    }
    onClose();
    onSaved?.();
    success(initial?.id ? "Librería actualizada" : "Librería creada");
    router.refresh();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Editar librería" : "Nueva librería"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            variant="default"
            onClick={save}
            disabled={saving}
            aria-live="polite"
          >
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      }
    >
      {errors.form && (
        <div className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Nombre</span>
          <input
            className="rounded border px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "error-name" : undefined}
            required
            minLength={2}
          />
          {errors.name && <span id="error-name" className="text-xs text-red-600">{errors.name}</span>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Dirección</span>
          <input
            className="rounded border px-3 py-2"
            value={address ?? ""}
            onChange={e => setAddress(e.target.value)}
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "error-address" : undefined}
          />
          {errors.address && <span id="error-address" className="text-xs text-red-600">{errors.address}</span>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Teléfono</span>
          <input className="rounded border px-3 py-2" value={phone ?? ""} onChange={e => setPhone(e.target.value)} />
        </label>
      </div>
    </Modal>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserFormModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void; }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!email.trim()) err.email = "Email requerido";
    if (!fullName.trim()) err.full_name = "Nombre requerido";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/members/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error creando miembro");
      success("Usuario creado");
      onSaved?.();
    } catch (e: any) {
      error("No se pudo crear el usuario", e?.message ?? "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo usuario"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="default" onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Nombre completo</span>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? "error-fullname" : undefined}
          />
          {errors.full_name && <span id="error-fullname" className="text-xs text-red-600">{errors.full_name}</span>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "error-email" : undefined}
          />
          {errors.email && <span id="error-email" className="text-xs text-red-600">{errors.email}</span>}
        </label>
      </div>
    </Modal>
  );
}
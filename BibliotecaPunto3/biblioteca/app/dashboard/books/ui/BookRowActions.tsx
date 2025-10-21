"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function BookRowActions({ id, onEdit }: { id: string; onEdit: () => void; }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { success, error } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);

  const remove = async () => {
    setConfirming(true);
    if (!supabase) {
      setConfirming(false);
      setConfirmOpen(false);
      return;
    }
    const { error: e } = await supabase.from("books").delete().eq("id", id);
    setConfirming(false);
    setConfirmOpen(false);
    if (e) {
      error("Error al eliminar libro", e.message);
      return;
    }
    success("Libro eliminado");
    router.refresh();
  };

  const openEdit = () => setEditConfirmOpen(true);
  const confirmEdit = () => {
    setEditConfirmOpen(false);
    onEdit();
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" size="icon-sm" onClick={openEdit} aria-label="Editar" title="Editar">
        <Pencil />
      </Button>
      <Button variant="destructive" size="icon-sm" onClick={() => setConfirmOpen(true)} aria-label="Eliminar" title="Eliminar">
        <Trash2 />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar libro"
        description="Esta acción no se puede deshacer. ¿Deseas eliminar este libro?"
        confirmText="Eliminar"
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
        confirming={confirming}
      />

      <ConfirmDialog
        open={editConfirmOpen}
        title="Editar libro"
        description="¿Deseas editar la información de este libro?"
        confirmText="Editar"
        onConfirm={confirmEdit}
        onCancel={() => setEditConfirmOpen(false)}
      />
    </div>
  );
}
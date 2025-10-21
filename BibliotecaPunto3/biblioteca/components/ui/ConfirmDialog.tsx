"use client";

import Modal from "./Modal";
import { Button } from "./button";

export default function ConfirmDialog({
  open,
  title = "Confirmar",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  confirming = false,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      maxWidthClass="max-w-sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={confirming}>{cancelText}</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Confirmando…" : confirmText}
          </Button>
        </div>
      }
    >
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </Modal>
  );
}
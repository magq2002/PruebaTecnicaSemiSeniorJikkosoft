"use client";

import React, { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string; // e.g. "max-w-lg"
}

// Lightweight modal without external deps; uses Tailwind utility classes.
export default function Modal({ open, onClose, title, children, footer, maxWidthClass = "max-w-xl" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    // Cerrar con Escape
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement as HTMLElement | null;
          if (e.shiftKey) {
            if (active === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (active === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    // Bloquear scroll del body y enfocar el modal
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClass} rounded-md bg-card text-card-foreground border border-border shadow-xl mx-4`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 id="modal-title" className="text-lg font-semibold">{title}</h3>
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && <div className="border-t border-border px-4 py-3 bg-secondary">{footer}</div>}
      </div>
    </div>
  );
}
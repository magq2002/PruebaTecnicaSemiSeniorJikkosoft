"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  durationMs?: number; // default 3000
}

interface ToastContextValue {
  showToast: (t: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = t.durationMs ?? 3000;
    const item: ToastItem = { id, ...t };
    setToasts((prev) => [...prev, item]);
    // Auto-dismiss
    window.setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: "success" });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: "error" });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: "info" });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <Toaster toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function Toaster({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: string) => void }) {
  useEffect(() => {
    // Close on Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Close latest
        const last = toasts[toasts.length - 1];
        if (last) onClose(last.id);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toasts, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border bg-white p-3 shadow-md"
        >
          <div className="mt-0.5">
            {t.type === "success" && <CheckCircle2 className="text-green-600" />}
            {t.type === "error" && <AlertCircle className="text-red-600" />}
            {(!t.type || t.type === "info") && <Info className="text-blue-600" />}
          </div>
          <div>
            {t.title && <div className="text-sm font-medium">{t.title}</div>}
            {t.description && <div className="text-xs text-gray-600">{t.description}</div>}
          </div>
          <button
            aria-label="Cerrar"
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            onClick={() => onClose(t.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
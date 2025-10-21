"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

interface Library {
  id: string;
  name: string;
}

interface BookInitial {
  id?: string;
  title?: string;
  author?: string | null;
  isbn?: string | null;
  published_year?: string | null;
  available?: boolean | null;
  library_id?: string | null;
}

export default function BookFormModal({
  open,
  onClose,
  libraries,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  libraries: Library[];
  initial?: BookInitial;
  onSaved?: () => void;
}) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { success, error: errorToast } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [isbn, setIsbn] = useState(initial?.isbn ?? "");
  const [publishedYear, setPublishedYear] = useState(initial?.published_year ?? "");
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [libraryId, setLibraryId] = useState(initial?.library_id ?? (libraries[0]?.id ?? ""));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  
  const validate = () => {
    const err: { [k: string]: string } = {};
    const year = publishedYear.trim();
    const isbnVal = isbn.trim();
    if (!title.trim() || title.trim().length < 2) err.title = "Título mínimo 2 caracteres";
    if (!libraryId) err.library_id = "Selecciona una librería";
    if (year) {
      if (!/^\d{4}$/.test(year)) err.published_year = "Año debe ser 4 dígitos";
      else {
        const y = parseInt(year, 10);
        const current = new Date().getFullYear();
        if (y < 1000 || y > current) err.published_year = `Año entre 1000 y ${current}`;
      }
    }
    if (isbnVal) {
      // Básica: ISBN-10 o ISBN-13 con dígitos y guiones
      const clean = isbnVal.replace(/-/g, "");
      if (!(clean.length === 10 || clean.length === 13) || /[^0-9Xx]/.test(clean)) {
        err.isbn = "ISBN debe ser 10 o 13 dígitos";
      }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  
  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      author: author.trim() || null,
      isbn: isbn.trim() || null,
      published_year: publishedYear.trim() || null,
      available,
      library_id: libraryId,
    };
  
    let error: any = null;
    if (!supabase) {
      errorToast("Error de configuración de Supabase");
      return;
    }
    
    if (initial?.id) {
      const { error: e } = await supabase.from("books").update(payload).eq("id", initial.id);
      error = e;
    } else {
      const { error: e } = await supabase.from("books").insert(payload);
      error = e;
    }
  
    setSaving(false);
    if (error) {
      setErrors({ form: error.message });
      errorToast("Error al guardar libro", error.message);
      return;
    }
    onClose();
    onSaved?.();
    success(initial?.id ? "Libro actualizado" : "Libro creado");
    router.refresh();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Editar libro" : "Nuevo libro"}
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
      <div className="grid grid-cols-1 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Título</span>
          <input
            className="rounded border px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "error-title" : undefined}
            required
            minLength={2}
          />
          {errors.title && <span id="error-title" className="text-xs text-red-600">{errors.title}</span>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Autor</span>
          <input className="rounded border px-3 py-2" value={author ?? ""} onChange={e => setAuthor(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">ISBN</span>
            <input
              className="rounded border px-3 py-2"
              value={isbn ?? ""}
              onChange={e => setIsbn(e.target.value)}
              aria-invalid={!!errors.isbn}
              aria-describedby={errors.isbn ? "error-isbn" : undefined}
              inputMode="numeric"
            />
            {errors.isbn && <span id="error-isbn" className="text-xs text-red-600">{errors.isbn}</span>}
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Año de publicación</span>
            <input
              className="rounded border px-3 py-2"
              value={publishedYear ?? ""}
              onChange={e => setPublishedYear(e.target.value)}
              aria-invalid={!!errors.published_year}
              aria-describedby={errors.published_year ? "error-year" : undefined}
            />
            {errors.published_year && <span id="error-year" className="text-xs text-red-600">{errors.published_year}</span>}
          </label>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!available} onChange={e => setAvailable(e.target.checked)} />
          <span className="text-sm">Disponible</span>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Librería</span>
          <select
            className="rounded border px-3 py-2"
            value={libraryId}
            onChange={e => setLibraryId(e.target.value)}
            aria-invalid={!!errors.library_id}
            aria-describedby={errors.library_id ? "error-library" : undefined}
            required
          >
            {libraries.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {errors.library_id && <span id="error-library" className="text-xs text-red-600">{errors.library_id}</span>}
        </label>
      </div>
    </Modal>
  );
}
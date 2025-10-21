"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

interface Book { id: string; title: string; }
interface Library { id: string; name: string; }
interface Member { id: string; full_name?: string | null; email?: string | null; }
interface LoanInitial {
  id?: string;
  book_id?: string;
  borrower_id?: string;
  library_id?: string;
  loan_date?: string;
  return_date?: string | null;
  returned?: boolean | null;
}

export default function LoanFormModal({
  open,
  onClose,
  books,
  libraries,
  members,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  books: Book[];
  libraries: Library[];
  members: Member[];
  initial?: LoanInitial;
  onSaved?: () => void;
}) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { success, error: errorToast } = useToast();
  const [bookId, setBookId] = useState(initial?.book_id ?? (books[0]?.id ?? ""));
  const [borrowerId, setBorrowerId] = useState(initial?.borrower_id ?? (members[0]?.id ?? ""));
  const [libraryId, setLibraryId] = useState(initial?.library_id ?? (libraries[0]?.id ?? ""));
  const [loanDate, setLoanDate] = useState(initial?.loan_date ?? new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(initial?.return_date ?? "");
  const [returned, setReturned] = useState(initial?.returned ?? false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // Eliminado el valor por defecto del usuario autenticado; ahora se selecciona explícitamente en el formulario.

  const validate = () => {
    const err: { [k: string]: string } = {};
    if (!bookId) err.book_id = "Selecciona un libro";
    if (!libraryId) err.library_id = "Selecciona una librería";
    if (!borrowerId) err.borrower_id = "Selecciona un usuario";
    const start = loanDate?.trim();
    const end = returnDate?.trim();
    if (!start) err.loan_date = "Fecha de préstamo requerida";
    if (!end) err.return_date = "Fecha de devolución requerida";
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        err.date = "Fechas inválidas";
      } else if (e < s) {
        err.return_date = "Devolución debe ser posterior al préstamo";
      }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      book_id: bookId,
      borrower_id: borrowerId,
      library_id: libraryId,
      loan_date: loanDate,
      return_date: returnDate?.trim() ? returnDate : null,
      returned,
    };

    let error: any = null;
    if (!supabase) {
      errorToast("Error de configuración de Supabase");
      return;
    }
    
    if (initial?.id) {
      const { error: e } = await supabase.from("loans").update(payload).eq("id", initial.id);
      error = e;
    } else {
      const { error: e } = await supabase.from("loans").insert(payload);
      error = e;
    }

    setSaving(false);
    if (error) {
      setErrors({ form: error.message });
      errorToast("Error al guardar préstamo", error.message);
      return;
    }
    onClose();
    onSaved?.();
    success(initial?.id ? "Préstamo actualizado" : "Préstamo creado");
    router.refresh();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Editar préstamo" : "Nuevo préstamo"}
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
        {errors.form && <div className="mb-2 text-sm text-red-700">{errors.form}</div>}
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Libro</span>
          <select
            className="rounded border px-3 py-2"
            value={bookId}
            onChange={e => setBookId(e.target.value)}
            aria-invalid={!!errors.book_id}
            aria-describedby={errors.book_id ? "error-book" : undefined}
            required
          >
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
          {errors.book_id && <span id="error-book" className="text-xs text-red-600">{errors.book_id}</span>}
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Usuario</span>
          <select
            className="rounded border px-3 py-2"
            value={borrowerId}
            onChange={e => setBorrowerId(e.target.value)}
            aria-invalid={!!errors.borrower_id}
            aria-describedby={errors.borrower_id ? "error-borrower" : undefined}
            required
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.full_name || m.email || m.id}</option>
            ))}
          </select>
          {errors.borrower_id && <span id="error-borrower" className="text-xs text-red-600">{errors.borrower_id}</span>}
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
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Fecha préstamo</span>
            <input
              type="date"
              className="rounded border px-3 py-2"
              value={loanDate}
              onChange={e => setLoanDate(e.target.value)}
              aria-invalid={!!errors.loan_date}
              aria-describedby={errors.loan_date ? "error-loan-date" : undefined}
              required
            />
            {errors.loan_date && <span id="error-loan-date" className="text-xs text-red-600">{errors.loan_date}</span>}
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Fecha devolución</span>
            <input
              type="date"
              className="rounded border px-3 py-2"
              value={returnDate ?? ""}
              onChange={e => setReturnDate(e.target.value)}
              aria-invalid={!!errors.return_date}
              aria-describedby={errors.return_date ? "error-return-date" : undefined}
              required
            />
            {errors.return_date && <span id="error-return-date" className="text-xs text-red-600">{errors.return_date}</span>}
          </label>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!returned} onChange={e => setReturned(e.target.checked)} />
          <span className="text-sm">Devuelto</span>
        </label>
      </div>
    </Modal>
  );
}
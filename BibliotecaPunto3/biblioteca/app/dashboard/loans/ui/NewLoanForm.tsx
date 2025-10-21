"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function NewLoanForm() {
  const router = useRouter();
  const [book_id, setBookId] = useState("");
  const [borrower_id, setBorrowerId] = useState("");
  const [library_id, setLibraryId] = useState("");
  const [loan_date, setLoanDate] = useState("");
  const [return_date, setReturnDate] = useState("");
  const [returned, setReturned] = useState(false);
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
    const payload = { book_id, borrower_id, library_id, loan_date, return_date: return_date || null, returned };
    if (!supabase) {
      return;
    }
    const { error } = await supabase.from("loans").insert(payload);
    if (error) setError(error.message);
    setLoading(false);
    setBookId("");
    setBorrowerId("");
    setLibraryId("");
    setLoanDate("");
    setReturnDate("");
    setReturned(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-white p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input className="border rounded p-2" placeholder="Book ID" value={book_id} onChange={(e) => setBookId(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Borrower ID" value={borrower_id} onChange={(e) => setBorrowerId(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Library ID" value={library_id} onChange={(e) => setLibraryId(e.target.value)} required />
        <input className="border rounded p-2" type="date" placeholder="Loan Date" value={loan_date} onChange={(e) => setLoanDate(e.target.value)} required />
        <input className="border rounded p-2" type="date" placeholder="Return Date" value={return_date} onChange={(e) => setReturnDate(e.target.value)} />
        <div className="flex items-center gap-2">
          <input id="returned" type="checkbox" checked={returned} onChange={(e) => setReturned(e.target.checked)} />
          <label htmlFor="returned">Returned</label>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50">
          {loading ? "Guardando..." : "Crear Loan"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </form>
  );
}
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoanFormModal from "./ui/LoanFormModal";
import LoanRowActions from "./ui/LoanRowActions";

interface Book { id: string; title: string; }
interface Library { id: string; name: string; }
interface Member { id: string; full_name?: string | null; email?: string | null; }
interface Loan {
  id: string;
  book_id: string;
  borrower_id: string;
  library_id: string;
  loan_date: string; // YYYY-MM-DD
  return_date?: string | null;
  returned?: boolean | null;
}

export default function LoansClient({ initialLoans, books, libraries, members }: { initialLoans: Loan[]; books: Book[]; libraries: Library[]; members: Member[] }) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editLoan, setEditLoan] = useState<Loan | null>(null);

  const bookMap = useMemo(() => new Map(books.map(b => [b.id, b.title])), [books]);
  const libraryMap = useMemo(() => new Map(libraries.map(l => [l.id, l.name])), [libraries]);
  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m.full_name || m.email || m.id])), [members]);

  // Filtros
  const [search, setSearch] = useState(""); // por libro o usuario
  const [filterLibrary, setFilterLibrary] = useState<string>("all");
  const [filterReturned, setFilterReturned] = useState<string>("all"); // all | true | false

  const filteredLoans = useMemo(() => {
    const s = search.trim().toLowerCase();
    return initialLoans.filter((loan) => {
      const bookName = (bookMap.get(loan.book_id) ?? "").toLowerCase();
      const borrowerName = (memberMap.get(loan.borrower_id) ?? "").toLowerCase();
      const matchesSearch = s === "" || bookName.includes(s) || borrowerName.includes(s);
      const matchesLibrary = filterLibrary === "all" || loan.library_id === filterLibrary;
      const matchesReturned =
        filterReturned === "all" ||
        (filterReturned === "true" && !!loan.returned) ||
        (filterReturned === "false" && !loan.returned);
      return matchesSearch && matchesLibrary && matchesReturned;
    });
  }, [initialLoans, search, filterLibrary, filterReturned, bookMap, memberMap]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Préstamos</h2>
        <Button onClick={() => setCreateOpen(true)}>Nuevo préstamo</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Input
            placeholder="Buscar por libro o usuario"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar"
          />
        </div>
        <div>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            value={filterLibrary}
            onChange={(e) => setFilterLibrary(e.target.value)}
            aria-label="Filtrar por librería"
          >
            <option value="all">Todas las librerías</option>
            {libraries.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            value={filterReturned}
            onChange={(e) => setFilterReturned(e.target.value)}
            aria-label="Filtrar por estado de devolución"
          >
            <option value="all">Todos</option>
            <option value="true">Devueltos</option>
            <option value="false">No devueltos</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Libro</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Usuario</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Librería</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Fecha préstamo</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Fecha devolución</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Devuelto</th>
              <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLoans.map((l) => (
              <tr key={l.id}>
                <td className="px-3 py-2">{bookMap.get(l.book_id) ?? l.book_id}</td>
                <td className="px-3 py-2">{memberMap.get(l.borrower_id) ?? l.borrower_id}</td>
                <td className="px-3 py-2">{libraryMap.get(l.library_id) ?? l.library_id}</td>
                <td className="px-3 py-2">{l.loan_date}</td>
                <td className="px-3 py-2">{l.return_date ?? "—"}</td>
                <td className="px-3 py-2">{l.returned ? "Sí" : "No"}</td>
                <td className="px-3 py-2 text-right">
                  <LoanRowActions id={l.id} onEdit={() => setEditLoan(l)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <LoanFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          books={books}
          libraries={libraries}
          members={members}
          onSaved={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      )}

      {editLoan && (
        <LoanFormModal
          open={!!editLoan}
          onClose={() => setEditLoan(null)}
          books={books}
          libraries={libraries}
          members={members}
          initial={editLoan}
          onSaved={() => {
            setEditLoan(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
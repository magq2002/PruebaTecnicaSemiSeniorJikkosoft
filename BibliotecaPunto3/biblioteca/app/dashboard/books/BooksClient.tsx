"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BookFormModal from "./ui/BookFormModal";
import BookRowActions from "./ui/BookRowActions";

interface Library {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author?: string | null;
  isbn?: string | null;
  published_year?: string | null;
  available?: boolean | null;
  library_id?: string | null;
}

export default function BooksClient({ initialBooks, libraries }: { initialBooks: Book[]; libraries: Library[] }) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterLibrary, setFilterLibrary] = useState<string>("all");

  const libraryMap = useMemo(() => new Map(libraries.map(l => [l.id, l.name])), [libraries]);

  const filteredBooks = useMemo(() => {
    const s = search.trim().toLowerCase();
    return initialBooks.filter((b) => {
      const matchesSearch = s === "" ||
        (b.title?.toLowerCase().includes(s) || (b.author ?? "").toLowerCase().includes(s));
      const matchesLibrary = filterLibrary === "all" || b.library_id === filterLibrary;
      return matchesSearch && matchesLibrary;
    });
  }, [initialBooks, search, filterLibrary]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Libros</h2>
        <Button onClick={() => setCreateOpen(true)}>Nuevo libro</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Input
            placeholder="Buscar por título o autor"
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
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Título</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Autor</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">ISBN</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Año</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Disponible</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Librería</th>
              <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBooks.map((b) => (
              <tr key={b.id}>
                <td className="px-3 py-2">{b.title}</td>
                <td className="px-3 py-2">{b.author ?? "—"}</td>
                <td className="px-3 py-2">{b.isbn ?? "—"}</td>
                <td className="px-3 py-2">{b.published_year ?? "—"}</td>
                <td className="px-3 py-2">{b.available ? "Sí" : "No"}</td>
                <td className="px-3 py-2">{libraryMap.get(b.library_id || "") ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  <BookRowActions id={b.id} onEdit={() => setEditBook(b)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <BookFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          libraries={libraries}
          onSaved={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      )}

      {editBook && (
        <BookFormModal
          open={!!editBook}
          onClose={() => setEditBook(null)}
          libraries={libraries}
          initial={editBook}
          onSaved={() => {
            setEditBook(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
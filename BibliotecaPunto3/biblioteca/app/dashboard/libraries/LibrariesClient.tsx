"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LibraryFormModal from "./ui/LibraryFormModal";
import LibraryRowActions from "./ui/LibraryRowActions";

interface Library {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
}

export default function LibrariesClient({ initialLibraries }: { initialLibraries: Library[] }) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editLibrary, setEditLibrary] = useState<Library | null>(null);

  // Filtros
  const [search, setSearch] = useState("");

  const filteredLibraries = useMemo(() => {
    const s = search.trim().toLowerCase();
    return initialLibraries.filter((l) => s === "" || l.name.toLowerCase().includes(s));
  }, [initialLibraries, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Librerías</h2>
        <Button onClick={() => setCreateOpen(true)}>Nueva librería</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Input
            placeholder="Buscar por nombre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Dirección</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Teléfono</th>
              <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLibraries.map((l) => (
              <tr key={l.id}>
                <td className="px-3 py-2">{l.name}</td>
                <td className="px-3 py-2">{l.address ?? "—"}</td>
                <td className="px-3 py-2">{l.phone ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  <LibraryRowActions id={l.id} onEdit={() => setEditLibrary(l)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <LibraryFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      )}

      {editLibrary && (
        <LibraryFormModal
          open={!!editLibrary}
          onClose={() => setEditLibrary(null)}
          initial={editLibrary}
          onSaved={() => {
            setEditLibrary(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
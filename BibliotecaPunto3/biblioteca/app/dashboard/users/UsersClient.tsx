"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserFormModal from "./ui/UserFormModal";

interface Member {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

export default function UsersClient({ initialUsers }: { initialUsers: Member[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const users = initialUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    const name = (u.full_name ?? "").toLowerCase();
    const email = (u.email ?? "").toLowerCase();
    return q === "" || name.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Usuarios</h2>
        <Button onClick={() => setCreateOpen(true)}>Nuevo usuario</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Buscar por nombre o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar usuarios"
        />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-3 py-2">{u.full_name ?? "—"}</td>
                <td className="px-3 py-2">{u.email ?? "—"}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={2} className="px-3 py-6 text-center text-muted-foreground">No hay usuarios que coincidan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <UserFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
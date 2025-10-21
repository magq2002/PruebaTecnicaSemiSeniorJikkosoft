import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import { Home, Library, BookOpen, ClipboardList, Users } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Gestor de Librería</h1>
          <nav className="flex gap-2 text-sm">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
              <Home className="size-4" />
              <span>Inicio</span>
            </Link>
            <Link href="/dashboard/libraries" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
              <Library className="size-4" />
              <span>Librerías</span>
            </Link>
            <Link href="/dashboard/books" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
              <BookOpen className="size-4" />
              <span>Libros</span>
            </Link>
            <Link href="/dashboard/loans" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
              <ClipboardList className="size-4" />
              <span>Préstamos</span>
            </Link>
            <Link href="/dashboard/users" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
              <Users className="size-4" />
              <span>Usuarios</span>
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <AuthGuard>
        <main className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
      </AuthGuard>
    </div>
  );
}
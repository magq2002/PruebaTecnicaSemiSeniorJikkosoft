import { BooksRepo, LibrariesRepo, LoansRepo, ProfilesRepo } from "@/lib/repositories";

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const [libraries, books, loans, profiles] = await Promise.all([
    LibrariesRepo.list(),
    BooksRepo.list(),
    LoansRepo.list(),
    ProfilesRepo.list(),
  ]);

  const stats = [
    { label: "Librerías", value: libraries.length },
    { label: "Libros", value: books.length },
    { label: "Préstamos", value: loans.length },
    { label: "Perfiles", value: profiles.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bienvenido</h2>
        <p className="text-sm text-muted-foreground">Resumen del sistema</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
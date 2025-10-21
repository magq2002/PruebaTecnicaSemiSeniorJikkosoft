import { LoansRepo, BooksRepo, LibrariesRepo, MembersRepo } from "@/lib/repositories";
import LoansClient from "./LoansClient";

export const dynamic = 'force-dynamic';

export default async function LoansPage() {
  const [loans, books, libraries, members] = await Promise.all([
    LoansRepo.list(),
    BooksRepo.list(),
    LibrariesRepo.list(),
    MembersRepo.list(),
  ]);

  return (
    <div className="space-y-6">
      <LoansClient initialLoans={loans} books={books as any} libraries={libraries as any} members={members as any} />
    </div>
  );
}
import { BooksRepo, LibrariesRepo } from "@/lib/repositories";
import BooksClient from "./BooksClient";

export const dynamic = 'force-dynamic';

export default async function BooksPage() {
  const [books, libraries] = await Promise.all([
    BooksRepo.list(),
    LibrariesRepo.list(),
  ]);

  return (
    <div className="space-y-6">
      <BooksClient initialBooks={books} libraries={libraries as any} />
    </div>
  );
}
import { LibrariesRepo } from "@/lib/repositories";
import LibrariesClient from "./LibrariesClient";

export const dynamic = 'force-dynamic';

export default async function LibrariesPage() {
  const libraries = await LibrariesRepo.list();

  return (
    <div className="space-y-6">
      <LibrariesClient initialLibraries={libraries} />
    </div>
  );
}
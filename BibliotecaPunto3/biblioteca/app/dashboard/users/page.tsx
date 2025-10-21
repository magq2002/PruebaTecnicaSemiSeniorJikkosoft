import { MembersRepo } from "@/lib/repositories";
import UsersClient from "./UsersClient";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await MembersRepo.list();

  return (
    <div className="space-y-6">
      <UsersClient initialUsers={users as any} />
    </div>
  );
}
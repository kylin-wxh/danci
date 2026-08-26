import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { requireSuperAdmin } from "@/lib/session";
import { AdminUsersClient } from "./admin-users-client";

export default async function AdminUsersPage() {
  const current = await requireSuperAdmin();
  const users = await db
    .select()
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt));

  return <AdminUsersClient users={users} currentUserId={current.id} />;
}
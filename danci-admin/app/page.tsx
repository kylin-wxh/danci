import { redirect } from "next/navigation";
import { count } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { getSessionUser } from "@/lib/session";

export default async function Home() {
  const user = await getSessionUser();

  if (user) {
    redirect(user.role === "super" ? "/admin-users" : "/books");
  }

  const [row] = await db.select({ count: count() }).from(adminUsers);
  const hasAdmin = (row?.count ?? 0) > 0;

  redirect(hasAdmin ? "/signin" : "/signup");
}
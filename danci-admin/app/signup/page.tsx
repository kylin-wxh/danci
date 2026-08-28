import { redirect } from "next/navigation";
import { count } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { SignUpForm } from "./signup-form";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  // 已有系统管理员时，禁止再次注册，跳转到登录页
  const [row] = await db.select({ count: count() }).from(adminUsers);
  if ((row?.count ?? 0) > 0) {
    redirect("/signin");
  }

  return <SignUpForm />;
}
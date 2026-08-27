"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers, books, words, type AdminRole } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession, getSessionUser } from "@/lib/session";

export type ActionState = { ok: true } | { ok: false; error: string };

// 注册首个系统管理员
export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionState> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing) {
    return { ok: false, error: "系统管理员已存在，无法重复注册" };
  }

  const passwordHash = await hashPassword(input.password);
  await db.insert(adminUsers).values({
    name,
    email,
    passwordHash,
    role: "super",
  });

  return { ok: true };
}

// 管理员登录
export async function signIn(input: {
  email: string;
  password: string;
}): Promise<ActionState> {
  const email = input.email.trim().toLowerCase();

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (!user) {
    return { ok: false, error: "邮箱或密码错误" };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "邮箱或密码错误" };
  }

  await createSession(user.id);
  return { ok: true };
}

// 退出登录
export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/signin");
}

// 校验是否为系统管理员，否则拒绝（后端接口权限守卫）
async function guardSuperAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");
  if (user.role !== "super") {
    return { ok: false, error: "无权限执行此操作" };
  }
  return { ok: true, userId: user.id };
}

export async function createAdmin(input: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): Promise<ActionState> {
  const guard = await guardSuperAdmin();
  if (!guard.ok) return guard;

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const [existing] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);
  if (existing) {
    return { ok: false, error: "该邮箱已被注册" };
  }

  const passwordHash = await hashPassword(input.password);
  await db.insert(adminUsers).values({
    name,
    email,
    passwordHash,
    role: input.role,
  });

  revalidatePath("/admin-users");
  return { ok: true };
}

export async function updateAdmin(input: {
  id: string;
  name: string;
  role: AdminRole;
}): Promise<ActionState> {
  const guard = await guardSuperAdmin();
  if (!guard.ok) return guard;

  // 系统管理员不能修改自己的角色，只能修改他人
  if (guard.userId === input.id && input.role !== "super") {
    return { ok: false, error: "系统管理员不能修改自己的角色" };
  }

  await db
    .update(adminUsers)
    .set({ name: input.name.trim(), role: input.role, updatedAt: new Date() })
    .where(eq(adminUsers.id, input.id));

  revalidatePath("/admin-users");
  return { ok: true };
}

export async function deleteAdmin(input: { id: string }): Promise<ActionState> {
  const guard = await guardSuperAdmin();
  if (!guard.ok) return guard;

  if (guard.userId === input.id) {
    return { ok: false, error: "不能删除当前登录的账号" };
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, input.id));
  revalidatePath("/admin-users");
  return { ok: true };
}

// ---------- 单词书 ----------

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createBook(input: {
  title: string;
  wordCount: number;
  coverUrl: string;
  bookId: string;
  tags: string;
}): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  await db.insert(books).values({
    title: input.title.trim(),
    wordCount: input.wordCount,
    coverUrl: input.coverUrl.trim() || null,
    bookId: input.bookId.trim(),
    tags: parseTags(input.tags),
  });

  revalidatePath("/books");
  return { ok: true };
}

export async function updateBook(input: {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string;
  bookId: string;
  tags: string;
}): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  await db
    .update(books)
    .set({
      title: input.title.trim(),
      wordCount: input.wordCount,
      coverUrl: input.coverUrl.trim() || null,
      bookId: input.bookId.trim(),
      tags: parseTags(input.tags),
      updatedAt: new Date(),
    })
    .where(eq(books.id, input.id));

  revalidatePath("/books");
  return { ok: true };
}

export async function deleteBook(input: { id: string }): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  // 查出该单词书对应的 bookId
  const [book] = await db
    .select({ bookId: books.bookId })
    .from(books)
    .where(eq(books.id, input.id))
    .limit(1);

  if (!book) {
    return { ok: false, error: "单词书不存在" };
  }

  await db.transaction(async (tx) => {
    // 删除 words 表中该 bookId 的所有单词
    await tx.delete(words).where(eq(words.bookId, book.bookId));
    // 删除 books 表中的单词书记录
    await tx.delete(books).where(eq(books.id, input.id));
  });

  revalidatePath("/books");
  return { ok: true };
}
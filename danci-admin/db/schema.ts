import {
  bigserial,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", ["super", "admin"]);
export type AdminRole = "super" | "admin";

// 管理员表：保存普通管理员与系统管理员
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRole("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 会话表：保存登录 session，有效期 7 天
export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 单词表：已在 Supabase 后台创建，此处仅为 schema 映射
export const words = pgTable("words", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  wordRank: integer("wordRank"),
  headWord: text("headWord"),
  content: json("content"),
  bookId: text("bookId"),
});

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
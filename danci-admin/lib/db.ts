import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL 未配置，请在 .env 中设置");
}

// 开发环境下复用同一个连接，避免 Next.js 热重载导致连接泄漏
const globalForDb = globalThis as unknown as {
  conn: Sql | undefined;
};

// Supabase 连接池（Transaction Pooler）不支持 prepared statements，必须设为 false
const conn =
  globalForDb.conn ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn);
import { desc, count } from "drizzle-orm";

import { db } from "@/lib/db";
import { books, words, type Book } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { BooksClient } from "./books-client";

type BookWithLinked = Book & { linkedWordCount: number };

export default async function BooksPage() {
  await requireUser();

  // 每本单词书对应的 words 实际数量（通过 bookId 关联）
  const linkedCounts = await db
    .select({ bookId: words.bookId, count: count() })
    .from(words)
    .groupBy(words.bookId);

  const countMap = new Map(
    linkedCounts.map((r) => [r.bookId, Number(r.count)])
  );

  const list = await db.select().from(books).orderBy(desc(books.createdAt));

  const items: BookWithLinked[] = list.map((b) => ({
    ...b,
    linkedWordCount: countMap.get(b.bookId) ?? 0,
  }));

  return <BooksClient books={items} />;
}
"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2Icon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import Image from "next/image";

import { createBook, deleteBook, updateBook } from "@/lib/actions";
import type { Book } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BookItem = Book & { linkedWordCount: number };

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("zh-CN");
}

function BookCover({ url, title }: { url?: string | null; title: string }) {
  if (!url) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
        无封面
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt={title}
      width={40}
      height={40}
      className="size-10 shrink-0 rounded-md object-cover"
      unoptimized
    />
  );
}

export function BooksClient({ books }: { books: BookItem[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BookItem | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(book: BookItem) {
    setEditing(book);
    setDialogOpen(true);
  }

  async function handleDelete(book: BookItem) {
    if (!window.confirm(`确定删除单词书「${book.title}」吗？`)) return;
    const res = await deleteBook({ id: book.id });
    if (res.ok) {
      toast.success("已删除");
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">单词书管理</h1>
          <p className="text-sm text-muted-foreground">管理平台中的单词书</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          新增单词书
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>单词书列表</CardTitle>
          <CardDescription>共 {books.length} 本</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>封面</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>单词数量</TableHead>
                <TableHead>已关联</TableHead>
                <TableHead>bookId</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <BookCover url={book.coverUrl} title={book.title} />
                  </TableCell>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.wordCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {book.linkedWordCount > 0 ? (
                      <span className="text-muted-foreground">
                        {book.linkedWordCount}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        未关联
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {book.bookId}
                  </TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    {book.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(book.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="更多操作"
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(book)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(book)}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BookFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}

function BookFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: BookItem | null;
}) {
  const [title, setTitle] = React.useState("");
  const [wordCount, setWordCount] = React.useState("");
  const [coverUrl, setCoverUrl] = React.useState("");
  const [bookId, setBookId] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const isEdit = editing !== null;

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setWordCount(String(editing.wordCount));
      setCoverUrl(editing.coverUrl ?? "");
      setBookId(editing.bookId);
      setTags(editing.tags?.join(",") ?? "");
    } else {
      setTitle("");
      setWordCount("");
      setCoverUrl("");
      setBookId("");
      setTags("");
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = Number(wordCount);
    if (!Number.isInteger(count) || count < 0) {
      toast.error("单词数量必须是非负整数");
      return;
    }

    setSubmitting(true);
    const payload = { title, wordCount: count, coverUrl, bookId, tags };
    const res = isEdit
      ? await updateBook({ id: editing!.id, ...payload })
      : await createBook(payload);
    setSubmitting(false);

    if (res.ok) {
      toast.success(isEdit ? "已更新" : "已创建");
      onOpenChange(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑单词书" : "新增单词书"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改单词书信息" : "录入新的单词书"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="高中英语 3500 词"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wordCount">单词数量</Label>
            <Input
              id="wordCount"
              type="number"
              min={0}
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              required
              placeholder="3500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="coverUrl">封面 URL</Label>
            <Input
              id="coverUrl"
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bookId">bookId</Label>
            <Input
              id="bookId"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              required
              placeholder="PEPXiaoXue3_1"
            />
            <p className="text-xs text-muted-foreground">
              用于关联 words 表对应的单词
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">标签（逗号分隔）</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="小学,人教版"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2Icon className="animate-spin" />}
              {isEdit ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
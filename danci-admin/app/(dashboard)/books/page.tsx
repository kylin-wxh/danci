"use client"

import { toast } from "sonner"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type BookStatus = "published" | "auditing" | "draft"

type Book = {
  id: string
  name: string
  wordCount: number
  status: BookStatus
  createdAt: string
}

const initialBooks: Book[] = [
  { id: "1", name: "高中英语 3500 词", wordCount: 3500, status: "published", createdAt: "2026-08-01" },
  { id: "2", name: "考研英语核心词汇", wordCount: 2210, status: "auditing", createdAt: "2026-08-10" },
  { id: "3", name: "四级高频词汇", wordCount: 1800, status: "published", createdAt: "2026-08-15" },
  { id: "4", name: "GRE 8000 词库", wordCount: 8000, status: "draft", createdAt: "2026-08-20" },
]

const statusMap: Record<
  BookStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  published: { label: "已发布", variant: "default" },
  auditing: { label: "审核中", variant: "secondary" },
  draft: { label: "草稿", variant: "outline" },
}

export default function BooksPage() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">单词书管理</h1>
          <p className="text-sm text-muted-foreground">
            管理单词书及其审核状态
          </p>
        </div>
        <Button onClick={() => toast.info("演示环境：新建单词书")}>
          <PlusIcon />
          新建单词书
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>单词书列表</CardTitle>
          <CardDescription>共 {initialBooks.length} 本</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>书名</TableHead>
                <TableHead>单词数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialBooks.map((book) => {
                const status = statusMap[book.status]
                return (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.name}</TableCell>
                    <TableCell>{book.wordCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{book.createdAt}</TableCell>
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
                          <DropdownMenuItem
                            onClick={() => toast.info("演示环境：编辑")}
                          >
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.info("演示环境：审核")}
                          >
                            审核
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => toast.info("演示环境：删除")}
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
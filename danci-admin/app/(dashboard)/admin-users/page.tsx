"use client"

import { toast } from "sonner"
import { MoreHorizontalIcon, UserPlusIcon } from "lucide-react"

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

type AdminRole = "super" | "admin"
type AdminStatus = "active" | "disabled"

type Admin = {
  id: string
  name: string
  email: string
  role: AdminRole
  status: AdminStatus
  createdAt: string
}

const initialAdmins: Admin[] = [
  { id: "1", name: "张伟", email: "zhangwei@example.com", role: "super", status: "active", createdAt: "2026-07-01" },
  { id: "2", name: "李娜", email: "lina@example.com", role: "admin", status: "active", createdAt: "2026-08-05" },
  { id: "3", name: "王强", email: "wangqiang@example.com", role: "admin", status: "disabled", createdAt: "2026-08-18" },
]

const roleMap: Record<AdminRole, { label: string; variant: "default" | "secondary" }> = {
  super: { label: "超级管理员", variant: "default" },
  admin: { label: "管理员", variant: "secondary" },
}

const statusMap: Record<AdminStatus, { label: string; variant: "default" | "outline" }> = {
  active: { label: "启用", variant: "default" },
  disabled: { label: "禁用", variant: "outline" },
}

export default function AdminUsersPage() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">管理员管理</h1>
          <p className="text-sm text-muted-foreground">
            管理后台管理员账号与权限
          </p>
        </div>
        <Button onClick={() => toast.info("演示环境：添加管理员")}>
          <UserPlusIcon />
          添加管理员
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>管理员列表</CardTitle>
          <CardDescription>共 {initialAdmins.length} 位</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialAdmins.map((admin) => {
                const role = roleMap[admin.role]
                const status = statusMap[admin.status]
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={role.variant}>{role.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{admin.createdAt}</TableCell>
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
                            onClick={() => toast.info("演示环境：禁用")}
                          >
                            禁用
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
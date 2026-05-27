"use client";

import { useState, useTransition } from "react";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/lib/actions/admin-actions";
import type { AdminUser } from "@/lib/api/admin-client";

type Role = AdminUser["role"];

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "destructive"> = {
  STUDENT: "secondary",
  RECRUITER: "default",
  ADMIN: "destructive",
};

interface AdminUsersScreenProps {
  users: AdminUser[];
}

export function AdminUsersScreen({ users: initial }: AdminUsersScreenProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  function handleRoleChange(userId: string, role: Role) {
    setError(null);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u)),
    );
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (!result.success) {
        setError(result.error ?? "Failed to update role");
        setUsers(initial);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-6 py-10 space-y-6">

        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-500/10 text-blue-500 p-3">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Users
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} user{users.length !== 1 ? "s" : ""} on the platform.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name} {user.lastname}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.username ?? "—"}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v as Role)}
                        disabled={pending}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue>
                            <Badge variant={ROLE_VARIANT[user.role]} className="text-xs">
                              {user.role}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">
                            <Badge variant="secondary" className="text-xs">STUDENT</Badge>
                          </SelectItem>
                          <SelectItem value="RECRUITER">
                            <Badge variant="default" className="text-xs">RECRUITER</Badge>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <Badge variant="destructive" className="text-xs">ADMIN</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {user.id.slice(0, 8)}…
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

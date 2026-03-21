"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { match } from "ts-pattern";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  MoreHorizontal,
  Pencil,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, orpcClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { UserEditDialog } from "./_components/user-edit-dialog";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  emailVerified: boolean;
  banned?: boolean | null;
  banReason?: string | null;
  bio?: string | null;
  headline?: string | null;
  location?: string | null;
  createdAt: Date | string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const usersQuery = useQuery(orpc.auth.listUsers.queryOptions());

  const toggleRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "USER" | "ADMIN";
    }) => orpcClient.auth.adminUpdateUser({ userId, role }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.role === "ADMIN"
          ? "User promoted to Admin"
          : "User demoted to User",
      );
      queryClient.invalidateQueries({ queryKey: orpc.auth.listUsers.key() });
    },
    onError: () => toast.error("Failed to update role"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      orpcClient.auth.adminUpdateUser({ userId, isActive }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.isActive ? "User account activated" : "User account deactivated",
      );
      queryClient.invalidateQueries({ queryKey: orpc.auth.listUsers.key() });
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.auth.deleteUser({ id }),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: orpc.auth.listUsers.key() });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const total = usersQuery.data?.length ?? 0;
  const admins = usersQuery.data?.filter((u) => u.role === "ADMIN").length ?? 0;
  const active =
    usersQuery.data?.filter((u) => u.isActive && !u.banned).length ?? 0;
  const banned = usersQuery.data?.filter((u) => u.banned).length ?? 0;

  // ── Columns ───────────────────────────────────────────────────────────────────

  const columns: ColumnDef<User>[] = [
    {
      id: "sr",
      header: "Sr. No",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {row.index + 1}
        </span>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={u.image ?? undefined} />
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {getInitials(u.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {u.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const isAdmin = row.original.role === "ADMIN";
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 px-2 gap-1",
              isAdmin
                ? "bg-violet-500/10 text-violet-700 border-violet-200 dark:text-violet-400"
                : "bg-muted text-muted-foreground border-border",
            )}
          >
            {isAdmin && <Shield className="size-2.5" />}
            {isAdmin ? "Admin" : "User"}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        if (u.banned) {
          return (
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-2 bg-red-500/10 text-red-600 border-red-200 dark:text-red-400"
            >
              Banned
            </Badge>
          );
        }
        return u.isActive ? (
          <Badge
            variant="outline"
            className="text-[10px] h-5 px-2 bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] h-5 px-2 bg-muted text-muted-foreground border-border"
          >
            Inactive
          </Badge>
        );
      },
    },
    {
      id: "emailVerified",
      header: "Verified",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.emailVerified ? (
          <UserCheck className="size-4 text-emerald-500" />
        ) : (
          <UserX className="size-4 text-muted-foreground/40" />
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        const isAdmin = u.role === "ADMIN";
        const isActive = u.isActive;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {u.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setEditTarget(u)}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </DropdownMenuItem>

              {/* Toggle role */}
              <DropdownMenuItem
                onClick={() =>
                  toggleRoleMutation.mutate({
                    userId: u.id,
                    role: isAdmin ? "USER" : "ADMIN",
                  })
                }
                disabled={toggleRoleMutation.isPending}
              >
                {isAdmin ? (
                  <>
                    <ShieldOff className="mr-2 size-3.5" />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 size-3.5" />
                    Make Admin
                  </>
                )}
              </DropdownMenuItem>

              {/* Toggle active */}
              <DropdownMenuItem
                onClick={() =>
                  toggleActiveMutation.mutate({
                    userId: u.id,
                    isActive: !isActive,
                  })
                }
                disabled={toggleActiveMutation.isPending}
              >
                {isActive ? (
                  <>
                    <UserMinus className="mr-2 size-3.5" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 size-3.5" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(u)}
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Users",
            value: total,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Admins",
            value: admins,
            icon: Shield,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
          },
          {
            label: "Active",
            value: active,
            icon: UserCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Banned",
            value: banned,
            icon: UserX,
            color: "text-red-500",
            bg: "bg-red-500/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("rounded-xl p-2.5 shrink-0", bg)}>
                <Icon className={cn("size-5", color)} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Users</CardTitle>
          <CardDescription className="text-xs">
            {total} user{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pb-4 px-4">
          {match(usersQuery)
            .returnType<ReactNode>()
            .with({ status: "pending" }, () => (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ))
            .with({ status: "error" }, () => (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Users className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Failed to load users
                </p>
              </div>
            ))
            .with({ status: "success" }, ({ data }) =>
              data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Users className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No users yet</p>
                </div>
              ) : (
                <DataTable
                  data={data as User[]}
                  columns={columns}
                  hidePagination={false}
                />
              ),
            )
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <UserEditDialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        user={editTarget}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &quot;{deleteTarget?.name}&quot;
              </span>{" "}
              ({deleteTarget?.email}). All their sessions, accounts, and data
              will be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

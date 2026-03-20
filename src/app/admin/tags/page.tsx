"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { match } from "ts-pattern";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MoreHorizontal, Pencil, Plus, Tag, Trash2 } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, orpcClient } from "@/lib/client";
import { createTagInput } from "@/server/router/tag/tag.input";

type TagRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
};

type FormValues = z.input<typeof createTagInput>;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function TagFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(createTagInput),
    defaultValues: { name: "", slug: "" },
  });

  useEffect(() => {
    if (!open) form.reset({ name: "", slug: "" });
  }, [open, form]);

  const nameValue = form.watch("name");
  useEffect(() => {
    form.setValue("slug", toSlug(nameValue ?? ""));
  }, [nameValue, form]);

  const createMutation = useMutation({
    mutationFn: (v: FormValues) => orpcClient.tag.create(v),
    onSuccess: () => {
      toast.success("Tag created");
      queryClient.invalidateQueries({ queryKey: orpc.tag.list.key() });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create tag"),
  });

  const isPending = createMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isPending) return;
    createMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Tag</DialogTitle>
          <DialogDescription>
            Add a new tag to organise your blog posts and projects.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-1"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Next.js"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="next-js"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Auto-generated from name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? "Creating…" : "Create Tag"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TagRow | null>(null);

  const tagsQuery = useQuery(orpc.tag.list.queryOptions());

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.tag.delete({ id }),
    onSuccess: () => {
      toast.success("Tag deleted");
      queryClient.invalidateQueries({ queryKey: orpc.tag.list.key() });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete tag"),
  });

  const columns: ColumnDef<TagRow>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[11px]">
          {row.original.slug}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const tag = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                icon={<MoreHorizontal className="size-4" />}
              ></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(tag)}
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
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organise your blog posts and projects with tags
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setFormOpen(true)}
          icon={<Plus className="mr-1.5 size-4" />}
        >
          New Tag
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-xl p-2.5 shrink-0 bg-violet-500/10">
              <Tag className="size-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {tagsQuery.data?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Total Tags</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Tags</CardTitle>
          <CardDescription className="text-xs">
            {tagsQuery.data?.length ?? 0} tag
            {tagsQuery.data?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pb-4 px-4">
          {match(tagsQuery)
            .returnType<ReactNode>()
            .with({ status: "pending" }, () => (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ))
            .with({ status: "error" }, () => (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Tag className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Failed to load tags
                </p>
              </div>
            ))
            .with({ status: "success" }, ({ data }) =>
              data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Tag className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No tags yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs mt-1"
                    onClick={() => setFormOpen(true)}
                    icon={<Plus className="mr-1.5 size-3" />}
                  >
                    Create your first tag
                  </Button>
                </div>
              ) : (
                <DataTable
                  data={data as TagRow[]}
                  columns={columns}
                  hidePagination={false}
                />
              ),
            )
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <TagFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &quot;{deleteTarget?.name}&quot;
              </span>
              . It will be removed from all blog posts and projects that use it.
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

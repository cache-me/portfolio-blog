"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { match } from "ts-pattern";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { FolderOpen, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { orpc, orpcClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { createCategoryInput } from "@/server/router/category/category.input";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  createdAt: Date | string;
};

type FormValues = z.input<typeof createCategoryInput>;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const PRESET_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#64748b",
];

function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category?: Category | null;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const form = useForm<FormValues>({
    resolver: zodResolver(createCategoryInput),
    defaultValues: { name: "", slug: "", description: "", color: null },
  });

  useEffect(() => {
    form.reset(
      category
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            color: category.color ?? null,
          }
        : { name: "", slug: "", description: "", color: null },
    );
  }, [category, form]);

  const nameValue = form.watch("name");
  useEffect(() => {
    if (!isEditing) form.setValue("slug", toSlug(nameValue ?? ""));
  }, [nameValue, isEditing, form]);

  const watchedColor = form.watch("color");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.category.list.key() });

  const createMutation = useMutation({
    mutationFn: (v: FormValues) =>
      orpcClient.category.create({
        ...v,
        description: v.description || null,
        color: v.color || null,
      }),
    onSuccess: () => {
      toast.success("Category created");
      invalidate();
      onOpenChange(false);
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("CONFLICT")
          ? "Slug already exists"
          : "Failed to create",
      ),
  });

  const updateMutation = useMutation({
    mutationFn: (v: FormValues) =>
      orpcClient.category.update({
        id: category!.id,
        ...v,
        description: v.description || null,
        color: v.color || null,
      }),
    onSuccess: () => {
      toast.success("Category updated");
      invalidate();
      onOpenChange(false);
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("CONFLICT")
          ? "Slug already exists"
          : "Failed to update",
      ),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isPending) return;
    isEditing ? updateMutation.mutate(values) : createMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update category details."
              : "Create a new category for blogs and projects."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Web Development"
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
                      placeholder="web-development"
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional…"
                      rows={2}
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => field.onChange(c)}
                          className={cn(
                            "size-7 rounded-md border-2 transition-all",
                            watchedColor === c
                              ? "border-foreground scale-110"
                              : "border-transparent hover:scale-105",
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => field.onChange(null)}
                        className={cn(
                          "size-7 rounded-md border-2 border-dashed text-xs text-muted-foreground transition-all",
                          !watchedColor
                            ? "border-foreground"
                            : "border-muted-foreground/30",
                        )}
                      >
                        ✕
                      </button>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="#3b82f6"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        className="font-mono text-xs w-32"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
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
                {isPending
                  ? isEditing
                    ? "Saving…"
                    : "Creating…"
                  : isEditing
                    ? "Save Changes"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const categoriesQuery = useQuery(orpc.category.list.queryOptions());

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.category.delete({ id }),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: orpc.category.list.key() });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormOpen(true);
  };

  const columns: ColumnDef<Category>[] = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.color && (
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: row.original.color }}
            />
          )}
          <span className="text-sm font-medium">{row.original.name}</span>
        </div>
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) =>
        row.original.color ? (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.color}
          </span>
        ) : (
          <span className="text-muted-foreground/40 text-xs">—</span>
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => openEdit(cat)}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(cat)}
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
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organise your blog posts and projects
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 size-4" />
          New Category
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Categories</CardTitle>
          <CardDescription className="text-xs">
            {categoriesQuery.data?.length ?? 0} categor
            {categoriesQuery.data?.length !== 1 ? "ies" : "y"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-4 px-4">
          {match(categoriesQuery)
            .returnType<ReactNode>()
            .with({ status: "pending" }, () => (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ))
            .with({ status: "error" }, () => (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <FolderOpen className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Failed to load categories
                </p>
              </div>
            ))
            .with({ status: "success" }, ({ data }) =>
              data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <FolderOpen className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No categories yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs mt-1"
                    onClick={openCreate}
                  >
                    <Plus className="mr-1.5 size-3" />
                    Create your first category
                  </Button>
                </div>
              ) : (
                <DataTable
                  data={data as Category[]}
                  columns={columns}
                  hidePagination={false}
                />
              ),
            )
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        category={editing}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete{" "}
              <span className="font-medium text-foreground">
                &quot;{deleteTarget?.name}&quot;
              </span>
              . Blogs and projects will have their category set to none.
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

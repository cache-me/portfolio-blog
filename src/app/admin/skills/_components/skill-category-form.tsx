"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { orpc, orpcClient } from "@/lib/client";
import {
  createSkillCategoryInput,
  type CreateSkillCategoryInput,
} from "@/server/router/skill/skill.input";

type SkillCategory = {
  id: string;
  name: string;
  icon?: string | null;
  sortOrder: number;
};

type SkillCategoryFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: SkillCategory | null;
};

type FormValues = z.input<typeof createSkillCategoryInput>;

export function SkillCategoryForm({
  open,
  onOpenChange,
  category,
}: SkillCategoryFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const form = useForm<FormValues>({
    resolver: zodResolver(createSkillCategoryInput),
    defaultValues: { name: "", icon: "", sortOrder: 0 },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon ?? "",
        sortOrder: category.sortOrder,
      });
    } else {
      form.reset({ name: "", icon: "", sortOrder: 0 });
    }
  }, [category, form]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.skill.grouped.key() });

  const createMutation = useMutation({
    mutationFn: (v: CreateSkillCategoryInput) =>
      orpcClient.skill.createCategory({
        ...v,
        icon: v.icon || null,
      }),
    onSuccess: () => {
      toast.success("Category created");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: (v: CreateSkillCategoryInput) =>
      orpcClient.skill.updateCategory({
        id: category!.id,
        ...v,
        icon: v.icon || null,
      }),
    onSuccess: () => {
      toast.success("Category updated");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update category"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isPending) return;
    const parsed = values as unknown as CreateSkillCategoryInput;
    isEditing ? updateMutation.mutate(parsed) : createMutation.mutate(parsed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this skill category."
              : "Add a new skill category (e.g. Frontend, Backend, DevOps)."}
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
                      placeholder="Frontend"
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="code-2"
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Lucide icon name or emoji (e.g. ⚡ or code-2)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Lower = appears first
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
                {isPending
                  ? isEditing
                    ? "Saving…"
                    : "Creating…"
                  : isEditing
                    ? "Save"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

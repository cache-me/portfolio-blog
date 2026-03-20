"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { orpc, orpcClient } from "@/lib/client";
import {
  createSkillInput,
  type CreateSkillInput,
} from "@/server/router/skill/skill.input";

type Skill = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  yearsOfExperience?: number | null;
  categoryId?: string | null;
  isVisible: boolean;
  sortOrder: number;
};

type SkillFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: Skill | null;
  defaultCategoryId?: string | null;
};

type FormValues = z.input<typeof createSkillInput>;

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function SkillForm({
  open,
  onOpenChange,
  skill,
  defaultCategoryId,
}: SkillFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!skill;

  const { data: categories } = useQuery(
    orpc.skill.listCategories.queryOptions(),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(createSkillInput),
    defaultValues: {
      name: "",
      slug: "",
      icon: "",
      level: "INTERMEDIATE",
      yearsOfExperience: null,
      categoryId: defaultCategoryId ?? null,
      isVisible: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (skill) {
      form.reset({
        name: skill.name,
        slug: skill.slug,
        icon: skill.icon ?? "",
        level: skill.level,
        yearsOfExperience: skill.yearsOfExperience ?? null,
        categoryId: skill.categoryId ?? null,
        isVisible: skill.isVisible,
        sortOrder: skill.sortOrder,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        icon: "",
        level: "INTERMEDIATE",
        yearsOfExperience: null,
        categoryId: defaultCategoryId ?? null,
        isVisible: true,
        sortOrder: 0,
      });
    }
  }, [skill, defaultCategoryId, form]);

  // Auto-slug from name
  const nameValue = form.watch("name");
  useEffect(() => {
    if (!isEditing) form.setValue("slug", toSlug(nameValue ?? ""));
  }, [nameValue, isEditing, form]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.skill.grouped.key() });

  const createMutation = useMutation({
    mutationFn: (v: CreateSkillInput) => orpcClient.skill.create(v),
    onSuccess: () => {
      toast.success("Skill created");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create skill"),
  });

  const updateMutation = useMutation({
    mutationFn: (v: CreateSkillInput) =>
      orpcClient.skill.update({ id: skill!.id, ...v }),
    onSuccess: () => {
      toast.success("Skill updated");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update skill"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isPending) return;
    const parsed = values as unknown as CreateSkillInput;
    isEditing ? updateMutation.mutate(parsed) : createMutation.mutate(parsed);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background z-10">
          <SheetTitle>{isEditing ? "Edit Skill" : "New Skill"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update this skill."
              : "Add a new skill to your portfolio."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="React"
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
                      placeholder="react"
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="⚛️ or react"
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Emoji, icon name, or URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years Exp.</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">
                      Visible on portfolio
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Show this skill publicly
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2 pb-4">
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
                    : "Create Skill"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

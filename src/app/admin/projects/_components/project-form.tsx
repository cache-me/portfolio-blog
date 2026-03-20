"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { orpc, orpcClient } from "@/lib/client";
import {
  createProjectInput,
  type CreateProjectInput,
} from "@/server/router/project/project.input";

type ProjectFormValues = z.input<typeof createProjectInput>;

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string | null;
  coverImage?: string | null;
  images?: string[] | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  demoUrl?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: string | null;
};

type ProjectFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const { data: categories } = useQuery(orpc.category.list.queryOptions());
  const { data: tags } = useQuery(orpc.tag.list.queryOptions());
  const { data: skills } = useQuery(orpc.skill.list.queryOptions());

  const [imageUrlInput, setImageUrlInput] = useState("");

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(createProjectInput),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      description: "",
      coverImage: "",
      images: [],
      githubUrl: "",
      liveUrl: "",
      demoUrl: "",
      status: "DRAFT",
      isFeatured: false,
      sortOrder: 0,
      startDate: null,
      endDate: null,
      categoryId: null,
      tagIds: [],
      skillIds: [],
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        description: project.description ?? "",
        coverImage: project.coverImage ?? "",
        images: project.images ?? [],
        githubUrl: project.githubUrl ?? "",
        liveUrl: project.liveUrl ?? "",
        demoUrl: project.demoUrl ?? "",
        status: project.status,
        isFeatured: project.isFeatured,
        sortOrder: project.sortOrder,
        startDate: project.startDate ?? null,
        endDate: project.endDate ?? null,
        categoryId: project.categoryId ?? null,
        tagIds: [],
        skillIds: [],
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        summary: "",
        description: "",
        coverImage: "",
        images: [],
        githubUrl: "",
        liveUrl: "",
        demoUrl: "",
        status: "DRAFT",
        isFeatured: false,
        sortOrder: 0,
        startDate: null,
        endDate: null,
        categoryId: null,
        tagIds: [],
        skillIds: [],
      });
    }
    setImageUrlInput("");
  }, [project, form]);

  const titleValue = form.watch("title");
  useEffect(() => {
    if (!isEditing) form.setValue("slug", toSlug(titleValue ?? ""));
  }, [titleValue, isEditing, form]);

  const watchedTagIds = form.watch("tagIds") ?? [];
  const watchedSkillIds = form.watch("skillIds") ?? [];
  const watchedImages = form.watch("images") ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.project.list.key() });

  const createMutation = useMutation({
    mutationFn: (values: CreateProjectInput) =>
      orpcClient.project.create(values),
    onSuccess: () => {
      toast.success("Project created");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create project"),
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateProjectInput) =>
      orpcClient.project.update({ id: project!.id, ...values }),
    onSuccess: () => {
      toast.success("Project updated");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update project"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: ProjectFormValues) {
    if (isPending) return;
    const parsed = values as unknown as CreateProjectInput;
    isEditing ? updateMutation.mutate(parsed) : createMutation.mutate(parsed);
  }

  function addImage() {
    const url = imageUrlInput.trim();
    if (!url) return;
    const current = form.getValues("images") ?? [];
    form.setValue("images", [...current, url]);
    setImageUrlInput("");
  }

  function removeImage(index: number) {
    const current = form.getValues("images") ?? [];
    form.setValue(
      "images",
      current.filter((_, i) => i !== index),
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background z-10">
          <SheetTitle>{isEditing ? "Edit Project" : "New Project"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the project details below."
              : "Fill in the details to create a new project."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-6"
          >
            {/* ── Core ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Details
              </h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My awesome project"
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
                        placeholder="my-awesome-project"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Auto-generated from title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short description of this project…"
                        rows={2}
                        className="resize-none"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description in Markdown…"
                        rows={8}
                        className="resize-none font-mono text-xs"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Media
              </h3>

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/cover.jpg"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Additional Images</FormLabel>
                <div className="space-y-2">
                  {watchedImages.map((img, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={img}
                        readOnly
                        className="text-xs font-mono flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeImage(i)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/screenshot.jpg"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="text-xs flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      onClick={addImage}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              </FormItem>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Links
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/user/repo"
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
                  name="liveUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Live URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://myproject.com"
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
                  name="demoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://demo.myproject.com"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Higher = appears first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Leave empty if ongoing
                      </FormDescription>
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
                name="tagIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tags?.map((tag) => {
                        const checked = watchedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              const current = form.getValues("tagIds") ?? [];
                              form.setValue(
                                "tagIds",
                                checked
                                  ? current.filter((id) => id !== tag.id)
                                  : [...current, tag.id],
                              );
                            }}
                          >
                            <Badge
                              variant={checked ? "default" : "outline"}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {tag.name}
                            </Badge>
                          </button>
                        );
                      })}
                      {!tags?.length && (
                        <p className="text-xs text-muted-foreground">
                          No tags available.
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skillIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Skills / Technologies</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {skills?.map((skill) => {
                        const checked = watchedSkillIds.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => {
                              const current = form.getValues("skillIds") ?? [];
                              form.setValue(
                                "skillIds",
                                checked
                                  ? current.filter((id) => id !== skill.id)
                                  : [...current, skill.id],
                              );
                            }}
                          >
                            <Badge
                              variant={checked ? "secondary" : "outline"}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {skill.name}
                            </Badge>
                          </button>
                        );
                      })}
                      {!skills?.length && (
                        <p className="text-xs text-muted-foreground">
                          No skills available.
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
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
                        Featured project
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Show in the featured section on your portfolio
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

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
                    : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

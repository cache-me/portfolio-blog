"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, X } from "lucide-react";

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
  createExperienceInput,
  type CreateExperienceInput,
} from "@/server/router/experience/experience.input";

// ── Types ──────────────────────────────────────────────────────────────────────

type FormValues = z.input<typeof createExperienceInput>;

type Experience = {
  id: string;
  company: string;
  companyUrl?: string | null;
  companyLogo?: string | null;
  role: string;
  type: string;
  description?: string | null;
  location?: string | null;
  isRemote: boolean;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  technologies?: string[] | null;
  achievements?: string[] | null;
  sortOrder: number;
  isVisible: boolean;
};

type ExperienceFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: Experience | null;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function ExperienceForm({
  open,
  onOpenChange,
  experience,
}: ExperienceFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!experience;

  const [techInput, setTechInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(createExperienceInput),
    defaultValues: {
      company: "",
      companyUrl: "",
      companyLogo: "",
      role: "",
      type: "FULL_TIME",
      description: "",
      location: "",
      isRemote: false,
      startDate: "",
      endDate: "",
      isCurrent: false,
      technologies: [],
      achievements: [],
      sortOrder: 0,
      isVisible: true,
    },
  });

  useEffect(() => {
    if (experience) {
      form.reset({
        company: experience.company,
        companyUrl: experience.companyUrl ?? "",
        companyLogo: experience.companyLogo ?? "",
        role: experience.role,
        type: experience.type as FormValues["type"],
        description: experience.description ?? "",
        location: experience.location ?? "",
        isRemote: experience.isRemote,
        startDate: experience.startDate,
        endDate: experience.endDate ?? "",
        isCurrent: experience.isCurrent,
        technologies: experience.technologies ?? [],
        achievements: experience.achievements ?? [],
        sortOrder: experience.sortOrder,
        isVisible: experience.isVisible,
      });
    } else {
      form.reset({
        company: "",
        companyUrl: "",
        companyLogo: "",
        role: "",
        type: "FULL_TIME",
        description: "",
        location: "",
        isRemote: false,
        startDate: "",
        endDate: "",
        isCurrent: false,
        technologies: [],
        achievements: [],
        sortOrder: 0,
        isVisible: true,
      });
    }
    setTechInput("");
    setAchievementInput("");
  }, [experience, form]);

  // Clear endDate when isCurrent is checked
  const isCurrentValue = form.watch("isCurrent");
  useEffect(() => {
    if (isCurrentValue) form.setValue("endDate", "");
  }, [isCurrentValue, form]);

  const watchedTechs = form.watch("technologies") ?? [];
  const watchedAchievements = form.watch("achievements") ?? [];

  function addItem(
    key: "technologies" | "achievements",
    value: string,
    setter: (v: string) => void,
    current: string[],
  ) {
    const val = value.trim();
    if (!val) return;
    form.setValue(key, [...current, val]);
    setter("");
  }

  function removeItem(
    key: "technologies" | "achievements",
    index: number,
    current: string[],
  ) {
    form.setValue(
      key,
      current.filter((_, i) => i !== index),
    );
  }

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: orpc.experience.listAll.key(),
    });

  const createMutation = useMutation({
    mutationFn: (values: CreateExperienceInput) =>
      orpcClient.experience.create(values),
    onSuccess: () => {
      toast.success("Experience created");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create experience"),
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateExperienceInput) =>
      orpcClient.experience.update({ id: experience!.id, ...values }),
    onSuccess: () => {
      toast.success("Experience updated");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update experience"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isPending) return;
    const parsed = values as unknown as CreateExperienceInput;
    isEditing ? updateMutation.mutate(parsed) : createMutation.mutate(parsed);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background z-10">
          <SheetTitle>
            {isEditing ? "Edit Experience" : "Add Experience"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update work experience details."
              : "Add a new work experience entry to your portfolio."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-6"
          >
            {/* ── Company ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Company
              </h3>

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Google"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://google.com"
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
                  name="companyLogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://google.com/logo.png"
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

            {/* ── Role ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Role
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Senior Engineer"
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(TYPE_LABELS).map(([value, label]) => (
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="San Francisco, CA"
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
                  name="isRemote"
                  render={({ field }) => (
                    <FormItem className="flex items-end gap-3 space-y-0 pb-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Remote</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* ── Duration ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Duration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isPending} />
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
                          disabled={isPending || isCurrentValue}
                        />
                      </FormControl>
                      {isCurrentValue && (
                        <FormDescription className="text-xs">
                          Cleared while Currently working is checked
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isCurrent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Currently working here
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* ── Details ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Details
              </h3>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your responsibilities and impact…"
                        rows={4}
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

              {/* Technologies */}
              <FormItem>
                <FormLabel>Technologies</FormLabel>
                <div className="space-y-2">
                  {watchedTechs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {watchedTechs.map((tech, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() =>
                              removeItem("technologies", i, watchedTechs)
                            }
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="React, TypeScript, Node.js…"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      className="text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addItem(
                            "technologies",
                            techInput,
                            setTechInput,
                            watchedTechs,
                          );
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      onClick={() =>
                        addItem(
                          "technologies",
                          techInput,
                          setTechInput,
                          watchedTechs,
                        )
                      }
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter or click + to add
                  </p>
                </div>
              </FormItem>

              {/* Achievements */}
              <FormItem>
                <FormLabel>Key Achievements</FormLabel>
                <div className="space-y-2">
                  {watchedAchievements.length > 0 && (
                    <div className="space-y-1.5">
                      {watchedAchievements.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 rounded-md bg-muted/40 border text-sm"
                        >
                          <span className="flex-1 leading-snug">{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeItem("achievements", i, watchedAchievements)
                            }
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Reduced load time by 40%…"
                      value={achievementInput}
                      onChange={(e) => setAchievementInput(e.target.value)}
                      className="text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addItem(
                            "achievements",
                            achievementInput,
                            setAchievementInput,
                            watchedAchievements,
                          );
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      onClick={() =>
                        addItem(
                          "achievements",
                          achievementInput,
                          setAchievementInput,
                          watchedAchievements,
                        )
                      }
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter or click + to add
                  </p>
                </div>
              </FormItem>
            </div>

            <Separator />

            {/* ── Settings ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Settings
              </h3>

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
                        className="w-32"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Higher = appears first
                    </FormDescription>
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
                        Show this experience publicly
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* ── Actions ── */}
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
                    : "Adding…"
                  : isEditing
                    ? "Save Changes"
                    : "Add Experience"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

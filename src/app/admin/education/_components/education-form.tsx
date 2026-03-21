"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { orpc, orpcClient } from "@/lib/client";
import {
  createEducationInput,
  type CreateEducationInput,
} from "@/server/router/education/education.input";

type FormValues = z.input<typeof createEducationInput>;

type Education = {
  id: string;
  institution: string;
  institutionUrl?: string | null;
  institutionLogo?: string | null;
  degree: string;
  fieldOfStudy: string;
  description?: string | null;
  grade?: string | null;
  activities?: string[] | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  isVisible: boolean;
  sortOrder: number;
};

type EducationFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  education?: Education | null;
};

const DEGREE_LABELS: Record<string, string> = {
  HIGH_SCHOOL: "High School",
  ASSOCIATE: "Associate",
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  PHD: "PhD / Doctorate",
  DIPLOMA: "Diploma",
  CERTIFICATION: "Certification",
  BOOTCAMP: "Bootcamp",
  OTHER: "Other",
};

export function EducationForm({
  open,
  onOpenChange,
  education,
}: EducationFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!education;
  const [activityInput, setActivityInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(createEducationInput),
    defaultValues: {
      institution: "",
      institutionUrl: "",
      institutionLogo: "",
      degree: "BACHELOR",
      fieldOfStudy: "",
      description: "",
      grade: "",
      activities: [],
      startDate: "",
      endDate: "",
      isCurrent: false,
      isVisible: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (education) {
      form.reset({
        institution: education.institution,
        institutionUrl: education.institutionUrl ?? "",
        institutionLogo: education.institutionLogo ?? "",
        degree: education.degree as FormValues["degree"],
        fieldOfStudy: education.fieldOfStudy,
        description: education.description ?? "",
        grade: education.grade ?? "",
        activities: education.activities ?? [],
        startDate: education.startDate,
        endDate: education.endDate ?? "",
        isCurrent: education.isCurrent,
        isVisible: education.isVisible,
        sortOrder: education.sortOrder,
      });
    } else {
      form.reset({
        institution: "",
        institutionUrl: "",
        institutionLogo: "",
        degree: "BACHELOR",
        fieldOfStudy: "",
        description: "",
        grade: "",
        activities: [],
        startDate: "",
        endDate: "",
        isCurrent: false,
        isVisible: true,
        sortOrder: 0,
      });
    }
    setActivityInput("");
  }, [education, form]);

  // Clear endDate when isCurrent is checked
  const isCurrentValue = form.watch("isCurrent");
  useEffect(() => {
    if (isCurrentValue) form.setValue("endDate", "");
  }, [isCurrentValue, form]);

  const watchedActivities = form.watch("activities") ?? [];

  function addActivity() {
    const val = activityInput.trim();
    if (!val) return;
    form.setValue("activities", [...watchedActivities, val]);
    setActivityInput("");
  }

  function removeActivity(index: number) {
    form.setValue(
      "activities",
      watchedActivities.filter((_, i) => i !== index),
    );
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.education.listAll.key() });

  const createMutation = useMutation({
    mutationFn: (values: CreateEducationInput) =>
      orpcClient.education.create(values),
    onSuccess: () => {
      toast.success("Education created");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create education"),
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateEducationInput) =>
      orpcClient.education.update({ id: education!.id, ...values }),
    onSuccess: () => {
      toast.success("Education updated");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update education"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isPending) return;
    const parsed = values as unknown as CreateEducationInput;
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
            {isEditing ? "Edit Education" : "Add Education"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update education details."
              : "Add a new education entry to your portfolio."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Institution
              </h3>

              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MIT"
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
                name="institutionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://mit.edu"
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
                name="institutionLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://mit.edu/logo.png"
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
                Degree
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DEGREE_LABELS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fieldOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Computer Science"
                          {...field}
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
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade / GPA</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="3.9 / 4.0 or First Class"
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
                          Cleared while Currently studying is checked
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
                      Currently studying here
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
                        placeholder="Describe your studies, achievements, or key learnings…"
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

              {/* Activities */}
              <FormItem>
                <FormLabel>Activities & Societies</FormLabel>
                <div className="space-y-2">
                  {watchedActivities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {watchedActivities.map((activity, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {activity}
                          <button
                            type="button"
                            onClick={() => removeActivity(i)}
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
                      placeholder="Robotics Club, Student Council…"
                      value={activityInput}
                      onChange={(e) => setActivityInput(e.target.value)}
                      className="text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addActivity();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      onClick={addActivity}
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
                        Show this education entry publicly
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
                    : "Adding…"
                  : isEditing
                    ? "Save Changes"
                    : "Add Education"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

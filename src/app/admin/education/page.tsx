"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { match } from "ts-pattern";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Eye,
  EyeOff,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, orpcClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { EducationForm } from "./_components/education-form";

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
  createdAt: Date | string;
};

const DEGREE_LABELS: Record<string, string> = {
  HIGH_SCHOOL: "High School",
  ASSOCIATE: "Associate",
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  PHD: "PhD",
  DIPLOMA: "Diploma",
  CERTIFICATION: "Certification",
  BOOTCAMP: "Bootcamp",
  OTHER: "Other",
};

const DEGREE_COLORS: Record<string, string> = {
  PHD: "bg-violet-500/10 text-violet-700 border-violet-200 dark:text-violet-400",
  MASTER: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400",
  BACHELOR:
    "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  ASSOCIATE: "bg-teal-500/10 text-teal-700 border-teal-200 dark:text-teal-400",
  DIPLOMA:
    "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
  CERTIFICATION:
    "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400",
  BOOTCAMP: "bg-pink-500/10 text-pink-700 border-pink-200 dark:text-pink-400",
  HIGH_SCHOOL:
    "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400",
  OTHER: "bg-muted text-muted-foreground border-border",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function AdminEducationPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);

  const educationQuery = useQuery(orpc.education.listAll.queryOptions());

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.education.delete({ id }),
    onSuccess: () => {
      toast.success("Education deleted");
      queryClient.invalidateQueries({ queryKey: orpc.education.listAll.key() });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete education"),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (edu: Education) => {
    setEditing(edu);
    setFormOpen(true);
  };

  const total = educationQuery.data?.length ?? 0;
  const visible = educationQuery.data?.filter((e) => e.isVisible).length ?? 0;
  const current = educationQuery.data?.filter((e) => e.isCurrent).length ?? 0;

  const columns: ColumnDef<Education>[] = [
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
      id: "institution",
      header: "Institution",
      cell: ({ row }) => {
        const edu = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-md bg-muted border flex items-center justify-center shrink-0 overflow-hidden">
              {edu.institutionLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={edu.institutionLogo}
                  alt={edu.institution}
                  className="size-full object-contain p-1"
                />
              ) : (
                <GraduationCap className="size-4 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug truncate">
                {edu.institution}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {edu.fieldOfStudy}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "degree",
      header: "Degree",
      cell: ({ row }) => {
        const degree = row.original.degree;
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 px-2 whitespace-nowrap",
              DEGREE_COLORS[degree],
            )}
          >
            {DEGREE_LABELS[degree] ?? degree}
          </Badge>
        );
      },
    },
    {
      id: "duration",
      header: "Duration",
      enableSorting: false,
      cell: ({ row }) => {
        const edu = row.original;
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>{formatDate(edu.startDate)}</span>
            <span>—</span>
            {edu.isCurrent ? (
              <Badge
                variant="outline"
                className="text-[10px] h-4 px-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-200"
              >
                Present
              </Badge>
            ) : (
              <span>{edu.endDate ? formatDate(edu.endDate) : "—"}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.grade ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "isVisible",
      header: "Visible",
      cell: ({ row }) =>
        row.original.isVisible ? (
          <Eye className="size-4 text-emerald-500" />
        ) : (
          <EyeOff className="size-4 text-muted-foreground/40" />
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const edu = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => openEdit(edu)}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(edu)}
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
          <h1 className="text-2xl font-bold tracking-tight">Education</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your academic background and qualifications
          </p>
        </div>
        <Button
          size="sm"
          onClick={openCreate}
          icon={<Plus className="mr-1.5 size-4" />}
        >
          Add Education
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Entries",
            value: total,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Visible",
            value: visible,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Currently Studying",
            value: current,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
          },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("rounded-xl p-2.5 shrink-0", bg)}>
                <GraduationCap className={cn("size-5", color)} />
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
          <CardTitle className="text-base">All Education</CardTitle>
          <CardDescription className="text-xs">
            {total} entr{total !== 1 ? "ies" : "y"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pb-4 px-4">
          {match(educationQuery)
            .returnType<ReactNode>()
            .with({ status: "pending" }, () => (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ))
            .with({ status: "error" }, () => (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <GraduationCap className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Failed to load education
                </p>
              </div>
            ))
            .with({ status: "success" }, ({ data }) =>
              data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <GraduationCap className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No education entries yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs mt-1"
                    onClick={openCreate}
                    icon={<Plus className="mr-1.5 size-3" />}
                  >
                    Add your first education
                  </Button>
                </div>
              ) : (
                <DataTable
                  data={data as Education[]}
                  columns={columns}
                  hidePagination={false}
                />
              ),
            )
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <EducationForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        education={editing}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete education?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.degree
                  ? (DEGREE_LABELS[deleteTarget.degree] ?? deleteTarget.degree)
                  : "this entry"}{" "}
                at &quot;{deleteTarget?.institution}&quot;
              </span>
              . This action cannot be undone.
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

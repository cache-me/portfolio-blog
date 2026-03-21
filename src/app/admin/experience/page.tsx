"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { match } from "ts-pattern";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  Briefcase,
  CalendarDays,
  Eye,
  EyeOff,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Wifi,
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
import { ExperienceForm } from "./_components/experience-form";

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
  createdAt: Date | string;
};

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

const TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400",
  PART_TIME: "bg-teal-500/10 text-teal-700 border-teal-200 dark:text-teal-400",
  FREELANCE:
    "bg-violet-500/10 text-violet-700 border-violet-200 dark:text-violet-400",
  INTERNSHIP:
    "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
  CONTRACT:
    "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function AdminExperiencePage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);

  const experienceQuery = useQuery(orpc.experience.listAll.queryOptions());

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.experience.delete({ id }),
    onSuccess: () => {
      toast.success("Experience deleted");
      queryClient.invalidateQueries({
        queryKey: orpc.experience.listAll.key(),
      });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete experience"),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (exp: Experience) => {
    setEditing(exp);
    setFormOpen(true);
  };

  const total = experienceQuery.data?.length ?? 0;
  const current = experienceQuery.data?.filter((e) => e.isCurrent).length ?? 0;
  const remote = experienceQuery.data?.filter((e) => e.isRemote).length ?? 0;
  const visible = experienceQuery.data?.filter((e) => e.isVisible).length ?? 0;

  const columns: ColumnDef<Experience>[] = [
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
      id: "company",
      header: "Company",
      cell: ({ row }) => {
        const exp = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-md bg-muted border flex items-center justify-center shrink-0 overflow-hidden">
              {exp.companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exp.companyLogo}
                  alt={exp.company}
                  className="size-full object-contain p-1"
                />
              ) : (
                <Briefcase className="size-4 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug truncate">
                {exp.company}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {exp.role}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 px-2 whitespace-nowrap",
              TYPE_COLORS[type] ?? "bg-muted text-muted-foreground",
            )}
          >
            {TYPE_LABELS[type] ?? type}
          </Badge>
        );
      },
    },
    {
      id: "duration",
      header: "Duration",
      enableSorting: false,
      cell: ({ row }) => {
        const exp = row.original;
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>{formatDate(exp.startDate)}</span>
            <span>—</span>
            {exp.isCurrent ? (
              <Badge
                variant="outline"
                className="text-[10px] h-4 px-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-200"
              >
                Present
              </Badge>
            ) : (
              <span>{exp.endDate ? formatDate(exp.endDate) : "—"}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "location",
      header: "Location",
      enableSorting: false,
      cell: ({ row }) => {
        const exp = row.original;
        if (!exp.location && !exp.isRemote) {
          return <span className="text-muted-foreground/40 text-xs">—</span>;
        }
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {exp.isRemote ? (
              <>
                <Wifi className="size-3.5 shrink-0 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Remote
                </span>
              </>
            ) : (
              <>
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate max-w-[120px]">{exp.location}</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      id: "technologies",
      header: "Stack",
      enableSorting: false,
      cell: ({ row }) => {
        const techs = row.original.technologies ?? [];
        if (!techs.length)
          return <span className="text-muted-foreground/40 text-xs">—</span>;
        return (
          <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
            {techs.slice(0, 3).map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="text-[10px] h-4 px-1.5"
              >
                {t}
              </Badge>
            ))}
            {techs.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{techs.length - 3}
              </span>
            )}
          </div>
        );
      },
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
        const exp = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => openEdit(exp)}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(exp)}
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
          <h1 className="text-2xl font-bold tracking-tight">Experience</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your work history and professional experience
          </p>
        </div>
        <Button
          size="sm"
          onClick={openCreate}
          icon={<Plus className="mr-1.5 size-4" />}
        >
          Add Experience
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Entries",
            value: total,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            icon: Briefcase,
          },
          {
            label: "Current Roles",
            value: current,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            icon: Briefcase,
          },
          {
            label: "Remote",
            value: remote,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            icon: Wifi,
          },
          {
            label: "Visible",
            value: visible,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            icon: Eye,
          },
        ].map(({ label, value, color, bg, icon: Icon }) => (
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
          <CardTitle className="text-base">All Experience</CardTitle>
          <CardDescription className="text-xs">
            {total} entr{total !== 1 ? "ies" : "y"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pb-4 px-4">
          {match(experienceQuery)
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
                <Briefcase className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Failed to load experience
                </p>
              </div>
            ))
            .with({ status: "success" }, ({ data }) =>
              data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Briefcase className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No experience entries yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs mt-1"
                    onClick={openCreate}
                    icon={<Plus className="mr-1.5 size-3" />}
                  >
                    Add your first experience
                  </Button>
                </div>
              ) : (
                <DataTable
                  data={data as Experience[]}
                  columns={columns}
                  hidePagination={false}
                />
              ),
            )
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <ExperienceForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        experience={editing}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete experience?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &quot;{deleteTarget?.role}&quot; at &quot;
                {deleteTarget?.company}&quot;
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

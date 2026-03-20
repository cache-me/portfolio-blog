"use client";

import { useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  Eye,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  Github,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Image from "next/image";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/client";
import { cn } from "@/lib/utils";

import { ProjectForm } from "./_components/project-form";
import { ProjectDeleteDialog } from "./_components/project-delete-dialog";
import { ProjectPublishDialog } from "./_components/project-publish-dialog";

type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

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
  status: ProjectStatus;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  likeCount: number;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: string | null;
  createdAt: Date | string;
  publishedAt?: Date | string | null;
};

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  PUBLISHED: {
    label: "Published",
    className:
      "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  ARCHIVED: {
    label: "Archived",
    className:
      "bg-orange-500/10 text-orange-700 border-orange-200 dark:border-orange-800 dark:text-orange-400",
  },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <Card>
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
  );
}

export default function AdminProjectsPage() {
  const [tab, setTab] = useState<"ALL" | ProjectStatus>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<string>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [publishTarget, setPublishTarget] = useState<Project | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 400);
  }, []);

  const queryInput = {
    page: 1,
    limit: 50,
    status: tab === "ALL" ? undefined : tab,
    search: debouncedSearch || undefined,
    featured:
      featuredFilter === "ALL" ? undefined : featuredFilter === "FEATURED",
  };

  const projectsQuery = useQuery(
    orpc.project.list.queryOptions({ input: queryInput }),
  );

  const { data: allProjects } = useQuery(
    orpc.project.list.queryOptions({ input: { page: 1, limit: 1000 } }),
  );

  const total = allProjects?.length ?? 0;
  const published =
    allProjects?.filter((p) => p.status === "PUBLISHED").length ?? 0;
  const drafts = allProjects?.filter((p) => p.status === "DRAFT").length ?? 0;
  const totalViews =
    allProjects?.reduce((sum, p) => sum + (p.viewCount ?? 0), 0) ?? 0;

  const openCreate = () => {
    setEditingProject(null);
    setFormOpen(true);
  };
  const openEdit = (proj: Project) => {
    setEditingProject(proj);
    setFormOpen(true);
  };

  const columns: ColumnDef<Project>[] = [
    {
      id: "title",
      header: "Project",
      cell: ({ row }) => {
        const proj = row.original;
        return (
          <div className="flex items-start gap-3 min-w-0">
            {proj.coverImage ? (
              <Image
                src={proj.coverImage}
                alt=""
                className="size-9 rounded-md object-cover shrink-0 hidden sm:block"
                width={36}
                height={36}
              />
            ) : (
              <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0 hidden sm:block">
                <FolderOpen className="size-4 text-muted-foreground/40" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug line-clamp-1">
                {proj.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {proj.summary}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
                /{proj.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status];
        return (
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2", cfg.className)}
          >
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "viewCount",
      header: "Views",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="size-3.5" />
          {(row.original.viewCount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "links",
      header: "Links",
      enableSorting: false,
      cell: ({ row }) => {
        const proj = row.original;
        return (
          <div className="flex items-center gap-1.5">
            {proj.githubUrl && (
              <a
                href={proj.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="size-3.5" />
              </a>
            )}
            {proj.liveUrl && (
              <a
                href={proj.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
            {!proj.githubUrl && !proj.liveUrl && (
              <span className="text-muted-foreground/40 text-xs">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.isFeatured ? (
          <Star className="size-4 text-amber-500 fill-amber-500" />
        ) : (
          <Star className="size-4 text-muted-foreground/25" />
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const proj = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => openEdit(proj)}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </DropdownMenuItem>
              {proj.status !== "PUBLISHED" && (
                <DropdownMenuItem onClick={() => setPublishTarget(proj)}>
                  <Send className="mr-2 size-3.5" />
                  Publish
                </DropdownMenuItem>
              )}
              {proj.liveUrl && (
                <DropdownMenuItem asChild>
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 size-3.5" />
                    View Live
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(proj)}
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
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your portfolio projects
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 size-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={total}
          icon={FolderOpen}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard
          label="Published"
          value={published}
          icon={Send}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatCard
          label="Drafts"
          value={drafts}
          icon={FileText}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard
          label="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          color="text-violet-500"
          bg="bg-violet-500/10"
        />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base">All Projects</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {projectsQuery.data?.length ?? 0} project
                {projectsQuery.data?.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 h-8 w-44 text-xs"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setDebouncedSearch("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <X className="size-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger className="h-8 text-xs w-36">
                  <Filter className="size-3 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All projects</SelectItem>
                  <SelectItem value="FEATURED">Featured only</SelectItem>
                  <SelectItem value="NOT_FEATURED">Not featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as typeof tab)}
            className="mt-2"
          >
            <TabsList className="h-8">
              <TabsTrigger value="ALL" className="text-xs px-3">
                All
              </TabsTrigger>
              <TabsTrigger value="PUBLISHED" className="text-xs px-3">
                Published
              </TabsTrigger>
              <TabsTrigger value="DRAFT" className="text-xs px-3">
                Draft
              </TabsTrigger>
              <TabsTrigger value="ARCHIVED" className="text-xs px-3">
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0 pb-4 px-4">
          {match(projectsQuery)
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
                <FolderOpen className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Failed to load projects
                </p>
              </div>
            ))
            .with({ status: "success" }, ({ data }) =>
              data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <FolderOpen className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? "No projects match your search"
                      : "No projects yet"}
                  </p>
                  {!search && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs mt-1"
                      onClick={openCreate}
                    >
                      <Plus className="mr-1.5 size-3" />
                      Create your first project
                    </Button>
                  )}
                </div>
              ) : (
                <DataTable
                  data={data as Project[]}
                  columns={columns}
                  hidePagination={false}
                />
              ),
            )
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <ProjectForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingProject(null);
        }}
        project={editingProject}
      />
      <ProjectDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        project={deleteTarget}
      />
      <ProjectPublishDialog
        open={!!publishTarget}
        onOpenChange={(v) => !v && setPublishTarget(null)}
        project={publishTarget}
      />
    </div>
  );
}

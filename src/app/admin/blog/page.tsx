"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  FileText,
  Filter,
  MessageSquare,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BlogForm } from "./_components/blog-form";
import { BlogDeleteDialog } from "./_components/blog-delete-dialog";
import { BlogPublishDialog } from "./_components/blog-publish-dialog";
import { BlogCommentsSheet } from "./_components/blog-comments-sheet";

type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Blog = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string | null;
  coverImage?: string | null;
  status: BlogStatus;
  isFeatured: boolean;
  readTimeMinutes?: number | null;
  viewCount: number;
  likeCount: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryId?: string | null;
  authorId: string;
  createdAt: Date | string;
  publishedAt?: Date | string | null;
};

const STATUS_CONFIG: Record<BlogStatus, { label: string; className: string }> =
  {
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

function TableRowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function AdminBlogPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"ALL" | BlogStatus>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<string>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [publishTarget, setPublishTarget] = useState<Blog | null>(null);
  const [commentsTarget, setCommentsTarget] = useState<Blog | null>(null);

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

  const { data: posts, isLoading } = useQuery(
    orpc.blog.list.queryOptions({ input: queryInput }),
  );

  const { data: allPosts } = useQuery(
    orpc.blog.list.queryOptions({ input: { page: 1, limit: 1000 } }),
  );

  const total = allPosts?.length ?? 0;
  const published =
    allPosts?.filter((p) => p.status === "PUBLISHED").length ?? 0;
  const drafts = allPosts?.filter((p) => p.status === "DRAFT").length ?? 0;
  const totalViews =
    allPosts?.reduce((sum, p) => sum + (p.viewCount ?? 0), 0) ?? 0;

  const openCreate = () => {
    setEditingBlog(null);
    setFormOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and publish your blog content
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          icon={<Plus className="mr-1.5 size-4" />}
        >
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Posts"
          value={total}
          icon={FileText}
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
              <CardTitle className="text-base">All Posts</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {posts?.length ?? 0} post{posts?.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
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
                <SelectTrigger className="h-8 text-xs w-32">
                  <Filter className="size-3 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All posts</SelectItem>
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

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-[40%]">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Views</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Published
                </TableHead>
                <TableHead className="hidden sm:table-cell">Featured</TableHead>
                <TableHead className="pr-6 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : !posts?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="size-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        {search ? "No posts match your search" : "No posts yet"}
                      </p>
                      {!search && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs mt-1"
                          onClick={openCreate}
                          icon={<Plus className="mr-1.5 size-3" />}
                        >
                          Create your first post
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => {
                  const statusCfg = STATUS_CONFIG[post.status as BlogStatus];
                  const publishedDate = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <TableRow
                      key={post.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-start gap-3">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt=""
                              className="size-9 rounded-md object-cover shrink-0 hidden sm:block"
                              width={36}
                              height={36}
                            />
                          ) : (
                            <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0 hidden sm:block">
                              <FileText className="size-4 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug line-clamp-1">
                              {post.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {post.summary}
                            </p>
                            <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-5 px-2",
                            statusCfg.className,
                          )}
                        >
                          {statusCfg.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="size-3.5" />
                          {(post.viewCount ?? 0).toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {publishedDate}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        {post.isFeatured ? (
                          <Star className="size-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <Star className="size-4 text-muted-foreground/25" />
                        )}
                      </TableCell>

                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => openEdit(post as Blog)}
                            >
                              <Pencil className="mr-2 size-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCommentsTarget(post as Blog)}
                            >
                              <MessageSquare className="mr-2 size-3.5" />
                              Comments
                            </DropdownMenuItem>
                            {post.status !== "PUBLISHED" && (
                              <DropdownMenuItem
                                onClick={() => setPublishTarget(post as Blog)}
                              >
                                <Send className="mr-2 size-3.5" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(post as Blog)}
                            >
                              <Trash2 className="mr-2 size-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BlogForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingBlog(null);
        }}
        blog={editingBlog}
      />

      <BlogDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        blog={deleteTarget}
      />

      <BlogPublishDialog
        open={!!publishTarget}
        onOpenChange={(v) => !v && setPublishTarget(null)}
        blog={publishTarget}
      />

      <BlogCommentsSheet
        open={!!commentsTarget}
        onOpenChange={(v) => !v && setCommentsTarget(null)}
        blog={commentsTarget}
      />
    </div>
  );
}

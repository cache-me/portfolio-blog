"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, orpcClient } from "@/lib/client";
import { cn } from "@/lib/utils";

type BlogCommentsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: { id: string; title: string } | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BlogCommentsSheet({
  open,
  onOpenChange,
  blog,
}: BlogCommentsSheetProps) {
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    ...orpc.blog.getById.queryOptions({ input: { id: blog?.id ?? "" } }),
    enabled: open && !!blog?.id,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: orpc.blog.getById.key({ input: { id: blog?.id ?? "" } }),
    });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      orpcClient.blog.approveComment({ id, isApproved }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.isApproved ? "Comment approved" : "Comment unapproved",
      );
      invalidate();
    },
    onError: () => toast.error("Failed to update comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpcClient.blog.deleteComment({ id }),
    onSuccess: () => {
      toast.success("Comment deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  const comments = (post as any)?.comments ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background z-10">
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription className="line-clamp-1">
            {blog?.title}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-5 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4 border rounded-xl">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No comments yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Comments will appear here once readers start engaging.
              </p>
            </div>
          ) : (
            comments.map((comment: any) => (
              <div
                key={comment.id}
                className={cn(
                  "p-4 rounded-xl border space-y-3 transition-colors",
                  comment.isApproved
                    ? "border-border bg-card"
                    : "border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20",
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {comment.author?.name
                          ? getInitials(comment.author.name)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {comment.author?.name ?? "Unknown"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] h-5 px-2 shrink-0",
                      comment.isApproved
                        ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/30"
                        : "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/30",
                    )}
                  >
                    {comment.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {comment.content}
                </p>

                {/* Replies indicator */}
                {comment.replies?.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {comment.replies.length} repl
                    {comment.replies.length === 1 ? "y" : "ies"}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant={comment.isApproved ? "outline" : "default"}
                    className="h-7 text-xs gap-1.5"
                    disabled={
                      approveMutation.isPending || deleteMutation.isPending
                    }
                    onClick={() =>
                      approveMutation.mutate({
                        id: comment.id,
                        isApproved: !comment.isApproved,
                      })
                    }
                  >
                    {comment.isApproved ? (
                      <>
                        <XCircle className="size-3" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                    disabled={
                      deleteMutation.isPending || approveMutation.isPending
                    }
                    onClick={() => deleteMutation.mutate(comment.id)}
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

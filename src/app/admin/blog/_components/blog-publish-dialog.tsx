"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { orpc, orpcClient } from "@/lib/client";

type BlogPublishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: { id: string; title: string } | null;
};

export function BlogPublishDialog({
  open,
  onOpenChange,
  blog,
}: BlogPublishDialogProps) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: (id: string) => orpcClient.blog.publish({ id }),
    onSuccess: () => {
      toast.success("Post published successfully");
      queryClient.invalidateQueries({ queryKey: orpc.blog.list.key() });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to publish post"),
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish post?</AlertDialogTitle>
          <AlertDialogDescription>
            This will make{" "}
            <span className="font-medium text-foreground">
              &quot;{blog?.title}&quot;
            </span>{" "}
            publicly visible on your portfolio. You can always unpublish it
            later by changing its status to Draft or Archived.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={publishMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => blog && publishMutation.mutate(blog.id)}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? "Publishing…" : "Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

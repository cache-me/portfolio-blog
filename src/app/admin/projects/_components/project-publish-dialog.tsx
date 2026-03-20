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

type ProjectPublishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: { id: string; title: string } | null;
};

export function ProjectPublishDialog({
  open,
  onOpenChange,
  project,
}: ProjectPublishDialogProps) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: (id: string) => orpcClient.project.publish({ id }),
    onSuccess: () => {
      toast.success("Project published");
      queryClient.invalidateQueries({ queryKey: orpc.project.list.key() });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to publish project"),
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish project?</AlertDialogTitle>
          <AlertDialogDescription>
            This will make{" "}
            <span className="font-medium text-foreground">
              &quot;{project?.title}&quot;
            </span>{" "}
            publicly visible on your portfolio. You can change its status back
            to Draft or Archived at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={publishMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => project && publishMutation.mutate(project.id)}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? "Publishing…" : "Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

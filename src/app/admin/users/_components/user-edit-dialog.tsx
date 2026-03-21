"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { orpc, orpcClient } from "@/lib/client";
import { adminUpdateUserInput } from "@/server/router/auth/auth.input";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  banned?: boolean | null;
  createdAt: Date | string;
};

type FormValues = z.infer<typeof adminUpdateUserInput>;

type UserEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
}: UserEditDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(adminUpdateUserInput),
    defaultValues: {
      userId: "",
      role: "USER",
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        userId: user.id,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => orpcClient.auth.adminUpdateUser(values),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: orpc.auth.listUsers.key() });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update user"),
  });

  const isPending = updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isPending) return;
    updateMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update role and access settings for this user.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Admins have full access to the admin panel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
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
                      Active account
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Inactive users cannot sign in.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
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
                {isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

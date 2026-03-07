"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { orpc, orpcClient } from "@/lib/client";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactSchema = z.infer<typeof contactSchema>;

export function ContactSection() {
  const { data: profile } = useQuery(orpc.profile.get.queryOptions());

  const form = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const submitMutation = useMutation({
    mutationFn: (values: ContactSchema) => orpcClient.contact.submit(values),
    onSuccess: () => {
      toast.success("Message sent!", {
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      form.reset();
    },
    onError: () => {
      toast.error("Failed to send message", {
        description: "Please try again or email me directly.",
      });
    },
  });

  function onSubmit(values: ContactSchema) {
    if (submitMutation.isPending) return;
    submitMutation.mutate(values);
  }

  return (
    <section
      id="contact"
      className="py-24 md:py-32 border-t border-border relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute right-0 top-0 text-[18vw] font-black text-foreground/[0.03] select-none leading-none pointer-events-none hidden lg:block"
      >
        07
      </span>

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                Get in touch
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Let&apos;s work
                <br />
                <span className="text-primary">together</span>
              </h2>
            </div>

            {profile?.bio && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                {profile.bio}
              </p>
            )}

            <div className="space-y-4">
              {profile?.email && (
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 text-secondary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      Email
                    </p>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-foreground text-sm font-medium hover:text-primary transition-colors no-underline"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile?.location && (
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 text-secondary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {profile.location}
                    </p>
                  </div>
                </div>
              )}

              {profile?.isAvailableForWork && (
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <span className="size-2.5 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      Available for new projects
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Doe"
                            disabled={submitMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            disabled={submitMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Project inquiry, collaboration..."
                          disabled={submitMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell me about your project..."
                          rows={5}
                          disabled={submitMutation.isPending}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitMutation.isPending}
                  loading={submitMutation.isPending}
                >
                  Send message
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  FolderOpen,
  Mail,
  Bell,
  MessageSquareQuote,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Award,
  Briefcase,
  GraduationCap,
  Code2,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BaseButton, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Blog Posts",
    value: "24",
    sub: "6 drafts",
    trend: +12,
    icon: FileText,
    href: "/admin/blog",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Projects",
    value: "18",
    sub: "3 unpublished",
    trend: +5,
    icon: FolderOpen,
    href: "/admin/projects",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    label: "Contacts",
    value: "9",
    sub: "3 unread",
    trend: +3,
    icon: Mail,
    href: "/admin/contacts",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    alert: true,
  },
  {
    label: "Subscribers",
    value: "342",
    sub: "+18 this month",
    trend: +18,
    icon: Bell,
    href: "/admin/newsletter",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Testimonials",
    value: "15",
    sub: "2 pending",
    trend: +2,
    icon: MessageSquareQuote,
    href: "/admin/testimonials",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Total Views",
    value: "12.4k",
    sub: "all time",
    trend: +24,
    icon: Eye,
    href: "/admin/analytics",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

const RECENT_CONTACTS = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    subject: "Web development project inquiry",
    status: "UNREAD" as const,
    time: "5 min ago",
  },
  {
    id: "2",
    name: "Marcus Webb",
    email: "marcus@studio.io",
    subject: "Freelance collaboration opportunity",
    status: "UNREAD" as const,
    time: "1 hour ago",
  },
  {
    id: "3",
    name: "Priya Nair",
    email: "priya.nair@gmail.com",
    subject: "Speaking at our tech meetup",
    status: "READ" as const,
    time: "3 hours ago",
  },
  {
    id: "4",
    name: "James Okafor",
    email: "james@okafor.dev",
    subject: "Open source contribution",
    status: "REPLIED" as const,
    time: "Yesterday",
  },
];

const RECENT_POSTS = [
  {
    id: "1",
    title: "Building Scalable APIs with Next.js 15",
    status: "PUBLISHED" as const,
    views: 1240,
    comments: 8,
    date: "Dec 12",
  },
  {
    id: "2",
    title: "Understanding TypeScript Generics",
    status: "PUBLISHED" as const,
    views: 892,
    comments: 4,
    date: "Dec 8",
  },
  {
    id: "3",
    title: "My Thoughts on React Server Components",
    status: "DRAFT" as const,
    views: 0,
    comments: 0,
    date: "Dec 5",
  },
  {
    id: "4",
    title: "The Art of Clean Code Reviews",
    status: "DRAFT" as const,
    views: 0,
    comments: 0,
    date: "Dec 3",
  },
];

const QUICK_ACTIONS = [
  {
    label: "New Blog Post",
    href: "/admin/blog/new",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    label: "New Project",
    href: "/admin/projects/new",
    icon: FolderOpen,
    color: "text-violet-500",
    bg: "bg-violet-500/10 hover:bg-violet-500/20",
  },
  {
    label: "Add Experience",
    href: "/admin/experience",
    icon: Briefcase,
    color: "text-amber-500",
    bg: "bg-amber-500/10 hover:bg-amber-500/20",
  },
  {
    label: "Add Skill",
    href: "/admin/skills",
    icon: Code2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    label: "Add Certificate",
    href: "/admin/certificates",
    icon: Award,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
  },
  {
    label: "Add Education",
    href: "/admin/education",
    icon: GraduationCap,
    color: "text-rose-500",
    bg: "bg-rose-500/10 hover:bg-rose-500/20",
  },
];

const PROFILE_COMPLETION = [
  { label: "Basic Info", done: true },
  { label: "Social Links", done: true },
  { label: "Work Experience", done: true },
  { label: "Education", done: false },
  { label: "Skills", done: true },
  { label: "Certificates", done: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  UNREAD: { label: "Unread", icon: AlertCircle, class: "text-rose-500" },
  READ: { label: "Read", icon: Circle, class: "text-muted-foreground" },
  REPLIED: { label: "Replied", icon: CheckCircle2, class: "text-emerald-500" },
  ARCHIVED: { label: "Archived", icon: Circle, class: "text-muted-foreground" },
};

const POST_STATUS_CONFIG = {
  PUBLISHED: {
    label: "Published",
    class:
      "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  },
  DRAFT: { label: "Draft", class: "bg-muted text-muted-foreground" },
  ARCHIVED: { label: "Archived", class: "bg-muted text-muted-foreground" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: (typeof STATS)[number] }) {
  const Icon = stat.icon;
  const positive = stat.trend > 0;

  return (
    <Link href={stat.href}>
      <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
        {stat.alert && (
          <span className="absolute top-3 right-3 flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
          </span>
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
            <div className={cn("rounded-xl p-2.5 shrink-0", stat.bg)}>
              <Icon className={cn("size-5", stat.color)} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
            {positive ? (
              <TrendingUp className="size-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="size-3.5 text-rose-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600",
              )}
            >
              {positive ? "+" : ""}
              {stat.trend}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const profileDone = PROFILE_COMPLETION.filter((p) => p.done).length;
  const profilePct = Math.round(
    (profileDone / PROFILE_COMPLETION.length) * 100,
  );

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, Admin 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BaseButton variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              View Site
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </BaseButton>
          <BaseButton size="sm" asChild>
            <Link href="/admin/blog/new">
              <Plus className="mr-1.5 size-3.5" />
              New Post
            </Link>
          </BaseButton>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Contacts — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Contacts
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Messages from your portfolio contact form
              </CardDescription>
            </div>
            <BaseButton
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              asChild
            >
              <Link href="/admin/contacts">
                View all
                <ArrowRight className="size-3" />
              </Link>
            </BaseButton>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {RECENT_CONTACTS.map((contact) => {
                const cfg = STATUS_CONFIG[contact.status];
                const StatusIcon = cfg.icon;
                return (
                  <Link
                    key={contact.id}
                    href={`/admin/contacts`}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/40 transition-colors group"
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {contact.name}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                          {contact.email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {contact.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusIcon className={cn("size-3.5", cfg.class)} />
                      <span className="text-[11px] text-muted-foreground hidden sm:block">
                        {contact.time}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Profile Completion
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Keep your portfolio up to date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{profilePct}% complete</span>
                <span className="text-muted-foreground">
                  {profileDone}/{PROFILE_COMPLETION.length} sections
                </span>
              </div>
              <Progress value={profilePct} className="h-2" />
            </div>
            <div className="space-y-2">
              {PROFILE_COMPLETION.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs",
                        item.done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {!item.done && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 px-1.5 text-muted-foreground"
                    >
                      Missing
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <BaseButton
              size="sm"
              variant="outline"
              className="w-full text-xs"
              asChild
            >
              <Link href="/admin/profile">
                Edit Profile
                <ArrowRight className="ml-1.5 size-3" />
              </Link>
            </BaseButton>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Blog Posts — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Posts
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Latest blog content across all statuses
              </CardDescription>
            </div>
            <BaseButton
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              asChild
            >
              <Link href="/admin/blog">
                View all
                <ArrowRight className="size-3" />
              </Link>
            </BaseButton>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {RECENT_POSTS.map((post) => {
                const cfg = POST_STATUS_CONFIG[post.status];
                return (
                  <Link
                    key={post.id}
                    href={`/admin/blog`}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="size-3" />
                          {post.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquareQuote className="size-3" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {post.date}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] h-5 px-2 shrink-0", cfg.class)}
                    >
                      {cfg.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Jump straight into creating content
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-colors cursor-pointer",
                    action.bg,
                  )}
                >
                  <Icon className={cn("size-5", action.color)} />
                  <span className="text-[11px] font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

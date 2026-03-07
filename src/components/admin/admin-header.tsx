"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { BaseButton, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "contact" | "comment" | "newsletter" | "system";
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New contact message",
    description: "John Doe sent a message about a project collaboration.",
    time: "2 min ago",
    read: false,
    type: "contact",
  },
  {
    id: "2",
    title: "New blog comment",
    description: 'Someone commented on "Building with Next.js 15".',
    time: "14 min ago",
    read: false,
    type: "comment",
  },
  {
    id: "3",
    title: "New subscriber",
    description: "jane@example.com subscribed to your newsletter.",
    time: "1 hour ago",
    read: false,
    type: "newsletter",
  },
  {
    id: "4",
    title: "Testimonial pending review",
    description: "A new testimonial is awaiting your approval.",
    time: "3 hours ago",
    read: true,
    type: "system",
  },
];

const ROUTE_LABELS: Record<string, string> = {
  admin: "Admin",
  analytics: "Analytics",
  blog: "Blog",
  projects: "Projects",
  categories: "Categories",
  tags: "Tags",
  profile: "Profile",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certificates: "Certificates",
  "social-links": "Social Links",
  contacts: "Contacts",
  newsletter: "Newsletter",
  testimonials: "Testimonials",
  users: "Users",
  settings: "Settings",
  new: "New",
  comments: "Comments",
};

const TYPE_COLOR: Record<Notification["type"], string> = {
  contact: "bg-blue-500",
  comment: "bg-violet-500",
  newsletter: "bg-emerald-500",
  system: "bg-amber-500",
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm min-w-0">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = ROUTE_LABELS[segment] ?? segment;

        return (
          <React.Fragment key={`${segment}-${index}`}>
            {index > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground truncate">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function SearchCommand() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-8 w-8 md:w-52 justify-start text-muted-foreground gap-2 rounded-md border-dashed text-xs font-normal shadow-none"
        onClick={() => setOpen(true)}
        icon={<Search className="size-3.5 shrink-0" />}
      >
        <span className="hidden md:inline-flex">Search anything...</span>
        <kbd className="hidden md:inline-flex pointer-events-none ml-auto h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, posts, projects..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {[
              { label: "Dashboard", href: "/admin" },
              { label: "Blog Posts", href: "/admin/blog" },
              { label: "Projects", href: "/admin/projects" },
              { label: "Contacts", href: "/admin/contacts" },
              { label: "Newsletter", href: "/admin/newsletter" },
              { label: "Testimonials", href: "/admin/testimonials" },
              { label: "Users", href: "/admin/users" },
              { label: "Analytics", href: "/admin/analytics" },
            ].map(({ label, href }) => (
              <CommandItem key={href} onSelect={() => setOpen(false)} asChild>
                <Link href={href}>{label}</Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => setOpen(false)} asChild>
              <Link href="/admin/blog/new">✍️ New Blog Post</Link>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} asChild>
              <Link href="/admin/projects/new">🗂️ New Project</Link>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function NotificationBell() {
  const [notifications, setNotifications] =
    React.useState<Notification[]>(MOCK_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-destructive" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <Badge
                variant="secondary"
                className="h-5 rounded-full px-1.5 text-xs"
              >
                {unread}
              </Badge>
            )}
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                  !n.read && "bg-muted/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-2 rounded-full mt-2 shrink-0",
                    TYPE_COLOR[n.type],
                    n.read && "opacity-30",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      !n.read && "font-medium",
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {n.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {n.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-2">
          <BaseButton
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground"
            asChild
          >
            <Link href="/admin/contacts">View all</Link>
          </BaseButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 rounded-full p-0">
          <Avatar className="size-8 rounded-full ring-2 ring-border">
            <AvatarImage src="/avatar.png" alt="Admin" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-full">
              AD
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">Admin</p>
            <p className="text-xs text-muted-foreground">admin@portfolio.dev</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/admin/profile">
              <User className="mr-2 size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" target="_blank">
            <ExternalLink className="mr-2 size-4" />
            View Site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="h-5 shrink-0" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <SearchCommand />
        <ThemeToggle />
        <NotificationBell />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <UserMenu />
      </div>
    </header>
  );
}

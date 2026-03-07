"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  FolderOpen,
  Tag,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Link2,
  Mail,
  Bell,
  MessageSquareQuote,
  Users,
  ChevronDown,
  ChevronsLeft,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import NavLink from "./nav-link";

type AppShellItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  disabled?: boolean;
  subMenu?: AppShellItem[];
};

export const APP_SHELL_ITEMS: AppShellItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Blog",
    url: "#",
    icon: FileText,
    subMenu: [
      { title: "All Posts", url: "/admin/blog", icon: FileText },
      { title: "New Post", url: "/admin/blog/new", icon: FileText },
      {
        title: "Comments",
        url: "/admin/blog/comments",
        icon: MessageSquareQuote,
      },
    ],
  },
  {
    title: "Projects",
    url: "#",
    icon: FolderOpen,
    subMenu: [
      { title: "All Projects", url: "/admin/projects", icon: FolderOpen },
      { title: "New Project", url: "/admin/projects/new", icon: FolderOpen },
    ],
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Tags",
    url: "/admin/tags",
    icon: Tag,
  },
  {
    title: "Profile",
    url: "/admin/profile",
    icon: User,
  },
  {
    title: "Experience",
    url: "/admin/experience",
    icon: Briefcase,
  },
  {
    title: "Education",
    url: "/admin/education",
    icon: GraduationCap,
  },
  {
    title: "Skills",
    url: "#",
    icon: Code2,
    subMenu: [
      { title: "All Skills", url: "/admin/skills", icon: Code2 },
      { title: "Categories", url: "/admin/skills/categories", icon: Tag },
    ],
  },
  {
    title: "Certificates",
    url: "/admin/certificates",
    icon: Award,
  },
  {
    title: "Social Links",
    url: "/admin/social-links",
    icon: Link2,
  },
  {
    title: "Contacts",
    url: "/admin/contacts",
    icon: Mail,
  },
  {
    title: "Newsletter",
    url: "/admin/newsletter",
    icon: Bell,
  },
  {
    title: "Testimonials",
    url: "/admin/testimonials",
    icon: MessageSquareQuote,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
];

export default function AdminAppShell({
  children,
  defaultOpen,
}: {
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar
        collapsible="icon"
        className="p-4 group-data-[state=collapsed]:p-0"
      >
        <SidebarHeader className="p-2 pt-4 group-data-[state=collapsed]:p-2">
          <SidebarMenu className="mx-1.5 group-data-[state=collapsed]:mx-0">
            <Link href="/admin">
              <div className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
                <div className="flex items-center justify-center size-8 bg-primary rounded-lg shrink-0 shadow-sm">
                  <Sparkles className="size-4 text-primary-foreground" />
                </div>
                <div className="group-data-[state=collapsed]:hidden leading-tight">
                  <div className="font-semibold text-sm">Portfolio</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Admin Panel
                  </div>
                </div>
              </div>
            </Link>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {APP_SHELL_ITEMS.map((item) =>
                item.subMenu ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.subMenu.some((sub) =>
                      pathname.startsWith(sub.url),
                    )}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:items-center">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          disabled={item.disabled}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {item.icon && (
                              <item.icon className="flex-shrink-0 size-4" />
                            )}
                            <span className="whitespace-normal leading-tight text-left min-w-0 flex-1">
                              {item.title}
                            </span>
                            <ChevronDown
                              size={16}
                              className="ml-auto flex-shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                            />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="border-sidebar-border">
                          {item.subMenu.map((subItem, index) => {
                            const isActive = pathname === subItem.url;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive}
                                  className="pl-0"
                                >
                                  <NavLink
                                    href={subItem.url}
                                    icon={subItem.icon!}
                                    name={subItem.title}
                                    disabled={subItem.disabled || item.disabled}
                                  />
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem
                    key={item.title}
                    className="flex items-center justify-center"
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={
                        item.url === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.url)
                      }
                      className="pl-0"
                    >
                      <NavLink
                        href={item.url}
                        icon={item.icon!}
                        name={item.title}
                        disabled={item.disabled}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 flex flex-col min-h-svh">{children}</div>
    </SidebarProvider>
  );
}

"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type NavLinkProps = React.ComponentProps<typeof Link> & {
  icon: LucideIcon;
  name: string;
  disabled?: boolean;
};

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ icon: Icon, name, href, disabled, className, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        className={cn(
          "w-full",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        <div className="p-2 rounded-lg flex items-center gap-2 min-w-0 w-full">
          {Icon && <Icon className="size-4 flex-shrink-0" />}
          <span className="whitespace-normal leading-tight text-left min-w-0 flex-1">
            {name}
          </span>
        </div>
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";
export default NavLink;

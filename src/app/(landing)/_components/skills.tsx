"use client";

import { orpc } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

function SkillBadge({ name, level }: { name: string; level?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0 group">
      <span className="text-foreground text-sm font-medium group-hover:text-primary transition-colors">
        {name}
      </span>
      {level && (
        <span className="text-muted-foreground text-xs uppercase tracking-wider shrink-0">
          {level.toLowerCase()}
        </span>
      )}
    </div>
  );
}

export function SkillsSection() {
  const { data: grouped, isLoading } = useQuery(
    orpc.skill.grouped.queryOptions(),
  );

  if (isLoading)
    return (
      <section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="h-64 flex items-center justify-center">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );

  if (!grouped?.length) return null;

  return (
    <section
      id="skills"
      className="py-24 md:py-32 border-t border-border relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute right-0 top-0 text-[18vw] font-black text-foreground/[0.03] select-none leading-none pointer-events-none hidden lg:block"
      >
        02
      </span>

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <div className="flex items-end justify-between mb-16 gap-8">
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
              What I work with
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Skills &<br />
              <span className="text-primary">Expertise</span>
            </h2>
          </div>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {grouped.map((group) => (
            <div
              key={group.category.id}
              className="bg-card border border-border rounded-xl p-6 space-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                {group.category.icon && (
                  <span className="text-xl">{group.category.icon}</span>
                )}
                <h3 className="text-foreground font-semibold text-sm uppercase tracking-wider">
                  {group.category.name}
                </h3>
              </div>
              {group.skills.map((skill) => (
                <SkillBadge
                  key={skill.id}
                  name={skill.name}
                  level={skill.level}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

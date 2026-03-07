"use client";

import { orpc } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

function ExperienceCard({ exp, index }: { exp: any; index: number }) {
  const startDate = exp.startDate
    ? format(new Date(exp.startDate), "MMM yyyy")
    : null;
  const endDate = exp.isCurrent
    ? "Present"
    : exp.endDate
      ? format(new Date(exp.endDate), "MMM yyyy")
      : null;

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-12 pb-12 last:pb-0 group">
      <div className="hidden md:block absolute left-[calc(25%-1px)] top-0 bottom-0 w-px bg-border group-last:hidden" />

      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium">
          {startDate}
          {endDate ? ` — ${endDate}` : ""}
        </p>
        {exp.isCurrent && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            Current
          </span>
        )}
        {exp.location && (
          <p className="text-muted-foreground text-xs">{exp.location}</p>
        )}
      </div>

      <div className="relative">
        <div className="hidden md:block absolute -left-[calc(75%+24px+1px)] top-1.5 size-2.5 rounded-full border-2 border-primary bg-background" />

        <div className="bg-card border border-border rounded-xl p-6 space-y-4 hover:border-primary/30 transition-colors duration-300">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-foreground font-bold text-lg leading-tight">
                  {exp.title}
                </h3>
                <p className="text-primary text-sm font-medium mt-0.5">
                  {exp.company}
                </p>
              </div>
              {exp.employmentType && (
                <span className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md shrink-0 font-medium">
                  {exp.employmentType.replace("_", " ")}
                </span>
              )}
            </div>
          </div>

          {exp.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {exp.description}
            </p>
          )}

          {exp.skills && exp.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {exp.skills.map((skill: any) => (
                <span
                  key={skill.id}
                  className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-md"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExperienceSection() {
  const { data: experiences, isLoading } = useQuery(
    orpc.experience.list.queryOptions(),
  );

  if (isLoading)
    return (
      <section
        id="experience"
        className="py-24 md:py-32 border-t border-border"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-center h-64">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );

  if (!experiences?.length) return null;

  return (
    <section
      id="experience"
      className="py-24 md:py-32 border-t border-border relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute right-0 top-0 text-[18vw] font-black text-foreground/[0.03] select-none leading-none pointer-events-none hidden lg:block"
      >
        04
      </span>

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="mb-16 space-y-3">
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
            Where I&apos;ve worked
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Work
            <br />
            <span className="text-primary">Experience</span>
          </h2>
        </div>

        <div className="space-y-0">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.id} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

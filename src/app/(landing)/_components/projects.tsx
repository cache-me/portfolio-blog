"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/client";

function ProjectCard({ project, index }: { project: any; index: number }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 no-underline hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-accent">
            <span className="text-6xl font-black text-muted-foreground/20">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />

        {/* Status badge */}
        {project.status === "PUBLISHED" && (
          <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full border border-border">
            Live
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-foreground font-bold text-lg leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            {project.shortDescription && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {project.shortDescription}
              </p>
            )}
          </div>
          <svg
            viewBox="0 0 24 24"
            className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((tag: any) => (
              <span
                key={tag.id}
                className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Links row */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5 transition-colors no-underline"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                <path d="M2 12h20" />
              </svg>
              Live
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5 transition-colors no-underline"
            >
              <svg viewBox="0 0 24 24" className="size-3 fill-current">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Source
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProjectsSection() {
  const { data: projects, isLoading } = useQuery(
    orpc.project.getFeatured.queryOptions(),
  );

  if (isLoading)
    return (
      <section id="projects" className="py-24 md:py-32 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="h-64 flex items-center justify-center">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );

  if (!projects?.length) return null;

  return (
    <section
      id="projects"
      className="py-24 md:py-32 border-t border-border relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute right-0 top-0 text-[18vw] font-black text-foreground/[0.03] select-none leading-none pointer-events-none hidden lg:block"
      >
        03
      </span>

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-16 gap-8 flex-wrap">
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
              Selected work
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Featured
              <br />
              <span className="text-primary">Projects</span>
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 no-underline transition-colors group"
          >
            View all projects
            <svg
              viewBox="0 0 24 24"
              className="size-4 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

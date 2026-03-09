"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/client";
import { format } from "date-fns";

export function HeroSection() {
  const { data: profile } = useQuery(orpc.profile.get.queryOptions());
  const { data: socialLinks } = useQuery(orpc.socialLink.list.queryOptions());

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <span
        aria-hidden
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[22vw] font-black text-foreground/[0.03] select-none leading-none pointer-events-none hidden lg:block"
      >
        01
      </span>

      <div className="relative max-w-6xl mx-auto px-6 md:px-12 w-full py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {profile?.isAvailableForWork && (
              <div className="inline-flex items-center gap-2.5 border border-border bg-card text-card-foreground rounded-full px-4 py-2 text-xs font-medium">
                <span className="size-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                Available for new projects
              </div>
            )}

            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
                {profile?.headline ?? "Full Stack Developer"}
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
                {profile?.fullName ? (
                  profile.fullName.split(" ").map((word, i) => (
                    <span
                      key={i}
                      className={i === 0 ? "block" : "block text-primary"}
                    >
                      {word}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="block">Rakesh Kumar </span>
                    <span className="block text-primary">Swain</span>
                  </>
                )}
              </h1>
            </div>

            {profile?.bio && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="bg-primary text-primary-foreground font-semibold px-7 py-3 rounded-md hover:opacity-90 transition-opacity no-underline text-sm"
              >
                View my work
              </a>
              <a
                href="#contact"
                className="border border-border text-foreground font-semibold px-7 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors no-underline text-sm"
              >
                Get in touch
              </a>
            </div>

            {/* Social links row */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-muted-foreground text-xs uppercase tracking-widest">
                  Find me
                </span>
                <div className="h-px flex-1 max-w-[40px] bg-border" />
                <div className="flex gap-3">
                  {socialLinks.slice(0, 5).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label ?? link.platform}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm no-underline font-medium"
                    >
                      {link.label ?? link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2 border-primary/30" />

              <div className="relative size-72 md:size-80 lg:size-96 rounded-2xl overflow-hidden bg-muted border border-border">
                {profile?.coverImage ? (
                  <Image
                    src={profile.coverImage}
                    alt={profile.fullName ?? "Profile photo"}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <span className="text-8xl font-black text-muted-foreground/20">
                      {profile?.fullName?.[0] ?? "?"}
                    </span>
                  </div>
                )}
              </div>

              {profile?.yearsOfExperience && (
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-2xl font-black text-foreground leading-none">
                    {profile.yearsOfExperience}+
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Years exp.
                  </p>
                </div>
              )}
              {profile?.updatedAt && (
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-2xl font-black text-foreground leading-none">
                    {format(new Date(profile.updatedAt), "MMM yyyy")}+
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">Projects</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

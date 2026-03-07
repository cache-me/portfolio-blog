"use client";

import { orpc } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export function EducationSection() {
  const { data: education } = useQuery(orpc.education.list.queryOptions());
  const { data: certificates } = useQuery(orpc.certificate.list.queryOptions());

  if (!education?.length && !certificates?.length) return null;

  return (
    <section
      id="education"
      className="py-24 md:py-32 border-t border-border bg-card relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {education && education.length > 0 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Academic background
                </p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                  Education
                </h2>
              </div>

              <div className="space-y-4">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="bg-background border border-border rounded-xl p-5 space-y-2 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-foreground font-bold">
                          {edu.degree}
                        </h3>
                        <p className="text-primary text-sm font-medium">
                          {edu.institution}
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {edu.startYear}
                        {edu.endYear
                          ? ` – ${edu.endYear}`
                          : edu.isCurrent
                            ? " – Present"
                            : ""}
                      </span>
                    </div>
                    {edu.fieldOfStudy && (
                      <p className="text-muted-foreground text-sm">
                        {edu.fieldOfStudy}
                      </p>
                    )}
                    {edu.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Professional credentials
                </p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                  Certifications
                </h2>
              </div>

              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-background border border-border rounded-xl p-5 space-y-2 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-foreground font-bold">
                          {cert.name}
                        </h3>
                        <p className="text-primary text-sm font-medium">
                          {cert.issuer}
                        </p>
                      </div>
                      {cert.issueDate && (
                        <span className="text-muted-foreground text-xs shrink-0">
                          {format(new Date(cert.issueDate), "MMM yyyy")}
                        </span>
                      )}
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs font-medium hover:underline no-underline inline-flex items-center gap-1"
                      >
                        View credential
                        <svg
                          viewBox="0 0 24 24"
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

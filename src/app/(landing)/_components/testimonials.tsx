"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/client";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`size-3.5 ${i < rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery(
    orpc.testimonial.featured.queryOptions(),
  );

  if (isLoading || !testimonials?.length) return null;

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 border-t border-border bg-card relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute right-0 top-0 text-[18vw] font-black text-foreground/[0.03] select-none leading-none pointer-events-none hidden lg:block"
      >
        06
      </span>

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="mb-16 space-y-3">
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
            What people say
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Client
            <br />
            <span className="text-primary">Testimonials</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-background border border-border rounded-xl p-6 space-y-4 flex flex-col hover:border-primary/30 transition-colors duration-300"
            >
              {/* Quote icon */}
              <svg
                viewBox="0 0 32 32"
                className="size-7 text-primary/40 fill-current shrink-0"
              >
                <path d="M10 8C5.6 8 2 11.6 2 16v8h8v-8H6c0-2.2 1.8-4 4-4V8zm14 0c-4.4 0-8 3.6-8 8v8h8v-8h-4c0-2.2 1.8-4 4-4V8z" />
              </svg>

              {t.rating && <StarRating rating={t.rating} />}

              <p className="text-muted-foreground text-sm leading-relaxed flex-1 italic">
                &quot;{t.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                {t.avatar ? (
                  <div className="size-9 rounded-full overflow-hidden bg-muted shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name || "Client Avatar"}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <span className="text-accent-foreground text-sm font-bold">
                      {t.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-foreground text-sm font-semibold leading-tight">
                    {t.name}
                  </p>
                  {t.company && (
                    <p className="text-muted-foreground text-xs">
                      {[t.company].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

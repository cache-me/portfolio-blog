"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { orpc } from "@/lib/client";

function PostCard({ post }: { post: any }) {
  const date = post.publishedAt
    ? format(new Date(post.publishedAt), "MMM d, yyyy")
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 no-underline hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5"
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-6 space-y-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {post.category && (
            <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md font-medium">
              {post.category.name}
            </span>
          )}
          {date && <span>{date}</span>}
          {post.readingTime && <span>{post.readingTime} min read</span>}
        </div>

        <h3 className="text-foreground font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-primary text-sm font-medium pt-2 group-hover:gap-2.5 transition-all">
          Read article
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export function BlogSection() {
  const { data: posts, isLoading } = useQuery(
    orpc.blog.getFeatured.queryOptions(),
  );

  if (isLoading)
    return (
      <section id="blog" className="py-24 md:py-32 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-center h-64">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );

  if (!posts?.length) return null;

  return (
    <section
      id="blog"
      className="py-24 md:py-32 border-t border-border relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute right-0 top-0 text-[18vw] font-black text-foreground/[0.03] select-none leading-none pointer-events-none hidden lg:block"
      >
        05
      </span>

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-16 gap-8 flex-wrap">
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
              Thoughts & ideas
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Latest
              <br />
              <span className="text-primary">Writing</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 no-underline transition-colors group"
          >
            All articles
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
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

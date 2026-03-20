// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { z } from "zod";
// import { orpc, orpcClient } from "@/lib/client";
// import {
//   createBlogInput,
//   type CreateBlogInput,
// } from "@/server/router/blog/blog.input";

// // z.input gives the "before parsing" type where .default() fields are optional —
// // this is what useForm needs. z.infer / CreateBlogInput gives the "after parsing"
// // output type where .default() fields are required — that's what the API needs.
// type BlogFormValues = z.input<typeof createBlogInput>;

// // ─── Types ─────────────────────────────────────────────────────────────────────

// type Blog = {
//   id: string;
//   title: string;
//   slug: string;
//   summary: string;
//   content?: string | null;
//   coverImage?: string | null;
//   status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
//   isFeatured: boolean;
//   readTimeMinutes?: number | null;
//   seoTitle?: string | null;
//   seoDescription?: string | null;
//   categoryId?: string | null;
// };

// type BlogFormProps = {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   blog?: Blog | null;
// };

// // ─── Auto-slug helper ──────────────────────────────────────────────────────────

// function toSlug(value: string) {
//   return value
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-")
//     .trim();
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export function BlogForm({ open, onOpenChange, blog }: BlogFormProps) {
//   const queryClient = useQueryClient();
//   const isEditing = !!blog;

//   const { data: categories } = useQuery(orpc.category.list.queryOptions());
//   const { data: tags } = useQuery(orpc.tag.list.queryOptions());

//   const form = useForm<BlogFormValues>({
//     resolver: zodResolver(createBlogInput),
//     defaultValues: {
//       title: "",
//       slug: "",
//       summary: "",
//       content: "",
//       coverImage: "",
//       status: "DRAFT",
//       isFeatured: false,
//       readTimeMinutes: null,
//       seoTitle: "",
//       seoDescription: "",
//       categoryId: null,
//       tagIds: [],
//     },
//   });

//   // Populate form when editing
//   useEffect(() => {
//     if (blog) {
//       form.reset({
//         title: blog.title,
//         slug: blog.slug,
//         summary: blog.summary,
//         content: blog.content ?? "",
//         coverImage: blog.coverImage ?? "",
//         status: blog.status,
//         isFeatured: blog.isFeatured,
//         readTimeMinutes: blog.readTimeMinutes ?? null,
//         seoTitle: blog.seoTitle ?? "",
//         seoDescription: blog.seoDescription ?? "",
//         categoryId: blog.categoryId ?? null,
//         tagIds: [],
//       });
//     } else {
//       form.reset({
//         title: "",
//         slug: "",
//         summary: "",
//         content: "",
//         coverImage: "",
//         status: "DRAFT",
//         isFeatured: false,
//         readTimeMinutes: null,
//         seoTitle: "",
//         seoDescription: "",
//         categoryId: null,
//         tagIds: [],
//       });
//     }
//   }, [blog, form]);

//   // Auto-generate slug from title when creating
//   const titleValue = form.watch("title");
//   useEffect(() => {
//     if (!isEditing) {
//       form.setValue("slug", toSlug(titleValue));
//     }
//   }, [titleValue, isEditing, form]);

//   const invalidate = () =>
//     queryClient.invalidateQueries({ queryKey: orpc.blog.list.key() });

//   const createMutation = useMutation({
//     mutationFn: (values: CreateBlogInput) =>
//       orpcClient.blog.create({
//         ...values,
//         coverImage: values.coverImage || null,
//         content: values.content || null,
//         seoTitle: values.seoTitle || null,
//         seoDescription: values.seoDescription || null,
//         categoryId: values.categoryId || null,
//         tagIds: values.tagIds,
//       }),
//     onSuccess: () => {
//       toast.success("Post created successfully");
//       invalidate();
//       onOpenChange(false);
//     },
//     onError: () => toast.error("Failed to create post"),
//   });

//   const updateMutation = useMutation({
//     mutationFn: (values: CreateBlogInput) =>
//       orpcClient.blog.update({
//         id: blog!.id,
//         ...values,
//         coverImage: values.coverImage || null,
//         content: values.content || null,
//         seoTitle: values.seoTitle || null,
//         seoDescription: values.seoDescription || null,
//         categoryId: values.categoryId || null,
//         tagIds: values.tagIds,
//       }),
//     onSuccess: () => {
//       toast.success("Post updated successfully");
//       invalidate();
//       onOpenChange(false);
//     },
//     onError: () => toast.error("Failed to update post"),
//   });

//   const isPending = createMutation.isPending || updateMutation.isPending;

//   function onSubmit(values: BlogFormValues) {
//     if (isPending) return;
//     const parsed = values as unknown as CreateBlogInput;
//     isEditing ? updateMutation.mutate(parsed) : createMutation.mutate(parsed);
//   }

//   const watchedTagIds = form.watch("tagIds");

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent
//         side="right"
//         className="w-full sm:max-w-2xl overflow-y-auto p-0"
//       >
//         <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background z-10">
//           <SheetTitle>{isEditing ? "Edit Post" : "New Post"}</SheetTitle>
//           <SheetDescription>
//             {isEditing
//               ? "Update the blog post details below."
//               : "Fill in the details to create a new blog post."}
//           </SheetDescription>
//         </SheetHeader>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="px-6 py-5 space-y-6"
//           >
//             {/* ── Core ── */}
//             <div className="space-y-4">
//               <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
//                 Content
//               </h3>

//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Title</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="My awesome post"
//                         {...field}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="slug"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Slug</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="my-awesome-post"
//                         {...field}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <FormDescription className="text-xs">
//                       URL-friendly identifier. Auto-generated from title.
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="summary"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Summary</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="A brief description of this post..."
//                         rows={3}
//                         className="resize-none"
//                         {...field}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="content"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Content (Markdown)</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Write your post content in Markdown..."
//                         rows={10}
//                         className="resize-none font-mono text-xs"
//                         {...field}
//                         value={field.value ?? ""}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <Separator />

//             {/* ── Meta ── */}
//             <div className="space-y-4">
//               <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
//                 Settings
//               </h3>

//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="status"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Status</FormLabel>
//                       <Select
//                         value={field.value}
//                         onValueChange={field.onChange}
//                         disabled={isPending}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select status" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="DRAFT">Draft</SelectItem>
//                           <SelectItem value="PUBLISHED">Published</SelectItem>
//                           <SelectItem value="ARCHIVED">Archived</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="readTimeMinutes"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Read Time (min)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder="5"
//                           {...field}
//                           value={field.value ?? ""}
//                           onChange={(e) =>
//                             field.onChange(
//                               e.target.value ? Number(e.target.value) : null,
//                             )
//                           }
//                           disabled={isPending}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="categoryId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Category</FormLabel>
//                     <Select
//                       value={field.value ?? "none"}
//                       onValueChange={(v) =>
//                         field.onChange(v === "none" ? null : v)
//                       }
//                       disabled={isPending}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="No category" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="none">No category</SelectItem>
//                         {categories?.map((cat) => (
//                           <SelectItem key={cat.id} value={cat.id}>
//                             {cat.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Tags multi-select */}
//               <FormField
//                 control={form.control}
//                 name="tagIds"
//                 render={() => (
//                   <FormItem>
//                     <FormLabel>Tags</FormLabel>
//                     <div className="flex flex-wrap gap-2 mt-1">
//                       {tags?.map((tag) => {
//                         const checked = watchedTagIds?.includes(tag.id);
//                         return (
//                           <button
//                             key={tag.id}
//                             type="button"
//                             onClick={() => {
//                               const current = form.getValues("tagIds") ?? [];
//                               form.setValue(
//                                 "tagIds",
//                                 checked
//                                   ? current.filter((id) => id !== tag.id)
//                                   : [...current, tag.id],
//                               );
//                             }}
//                             className="transition-all"
//                           >
//                             <Badge
//                               variant={checked ? "default" : "outline"}
//                               className="cursor-pointer hover:opacity-80 transition-opacity"
//                             >
//                               {tag.name}
//                             </Badge>
//                           </button>
//                         );
//                       })}
//                       {!tags?.length && (
//                         <p className="text-xs text-muted-foreground">
//                           No tags available. Create some first.
//                         </p>
//                       )}
//                     </div>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="coverImage"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Cover Image URL</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="https://example.com/image.jpg"
//                         {...field}
//                         value={field.value ?? ""}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="isFeatured"
//                 render={({ field }) => (
//                   <FormItem className="flex items-center gap-3 space-y-0">
//                     <FormControl>
//                       <Checkbox
//                         checked={field.value}
//                         onCheckedChange={field.onChange}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <div>
//                       <FormLabel className="cursor-pointer">
//                         Featured post
//                       </FormLabel>
//                       <FormDescription className="text-xs">
//                         Show this post in the featured section
//                       </FormDescription>
//                     </div>
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <Separator />

//             {/* ── SEO ── */}
//             <div className="space-y-4">
//               <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
//                 SEO
//               </h3>

//               <FormField
//                 control={form.control}
//                 name="seoTitle"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>SEO Title</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Overrides post title for search engines"
//                         {...field}
//                         value={field.value ?? ""}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="seoDescription"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>SEO Description</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Short description for search engines (max 160 chars)"
//                         rows={2}
//                         className="resize-none"
//                         {...field}
//                         value={field.value ?? ""}
//                         disabled={isPending}
//                       />
//                     </FormControl>
//                     <FormDescription className="text-xs">
//                       {(form.watch("seoDescription") ?? "").length}/160
//                       characters
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* ── Actions ── */}
//             <div className="flex gap-3 pt-2 pb-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="flex-1"
//                 onClick={() => onOpenChange(false)}
//                 disabled={isPending}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" className="flex-1" disabled={isPending}>
//                 {isPending
//                   ? isEditing
//                     ? "Saving…"
//                     : "Creating…"
//                   : isEditing
//                     ? "Save Changes"
//                     : "Create Post"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </SheetContent>
//     </Sheet>
//   );
// }
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  ExternalLink,
  GripVertical,
  Instagram,
  Music2,
  Plus,
  Trash2,
  Twitter,
  Youtube,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { orpc, orpcClient } from "@/lib/client";
import {
  createBlogInput,
  type CreateBlogInput,
  type BlogMediaItemInput,
} from "@/server/router/blog/blog.input";
import Image from "next/image";
import { FileUpload } from "@/components/file-uploader/file-upload";

type BlogFormValues = z.input<typeof createBlogInput>;

type Blog = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string | null;
  coverImageId?: string | null;
  coverImageUrl?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  readTimeMinutes?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryId?: string | null;
};

type BlogFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: Blog | null;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

type MediaType = BlogMediaItemInput["type"];

function detectMediaType(url: string): MediaType {
  try {
    const u = new URL(url);
    const h = u.hostname;
    if (h.includes("youtube.com") || h === "youtu.be") return "YOUTUBE";
    if (h.includes("vimeo.com")) return "VIMEO";
    if (h.includes("twitter.com") || h.includes("x.com")) return "TWITTER";
    if (h.includes("instagram.com")) return "INSTAGRAM";
    if (h.includes("tiktok.com")) return "TIKTOK";
  } catch {}
  return "EXTERNAL";
}

const MEDIA_TYPE_ICONS: Record<MediaType, React.ElementType> = {
  UPLOAD: ExternalLink,
  YOUTUBE: Youtube,
  VIMEO: ExternalLink,
  TWITTER: Twitter,
  INSTAGRAM: Instagram,
  TIKTOK: Music2,
  EXTERNAL: ExternalLink,
};

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  UPLOAD: "File Upload",
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  TWITTER: "Twitter / X",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  EXTERNAL: "External Link",
};

export function BlogForm({ open, onOpenChange, blog }: BlogFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!blog;

  const { data: categories } = useQuery(orpc.category.list.queryOptions());
  const { data: tags } = useQuery(orpc.tag.list.queryOptions());

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(createBlogInput),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImageId: null,
      coverImageUrl: "",
      status: "DRAFT",
      isFeatured: false,
      readTimeMinutes: null,
      seoTitle: "",
      seoDescription: "",
      categoryId: null,
      tagIds: [],
      media: [],
    },
  });

  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title,
        slug: blog.slug,
        summary: blog.summary,
        content: "",
        coverImageId: blog.coverImageId ?? null,
        coverImageUrl: blog.coverImageUrl ?? "",
        status: blog.status,
        isFeatured: blog.isFeatured,
        readTimeMinutes: blog.readTimeMinutes ?? null,
        seoTitle: blog.seoTitle ?? "",
        seoDescription: blog.seoDescription ?? "",
        categoryId: blog.categoryId ?? null,
        tagIds: [],
        media: [],
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        summary: "",
        content: "",
        coverImageId: null,
        coverImageUrl: "",
        status: "DRAFT",
        isFeatured: false,
        readTimeMinutes: null,
        seoTitle: "",
        seoDescription: "",
        categoryId: null,
        tagIds: [],
        media: [],
      });
    }
  }, [blog, form]);

  // Auto-slug
  const titleValue = form.watch("title");
  useEffect(() => {
    if (!isEditing) form.setValue("slug", toSlug(titleValue ?? ""));
  }, [titleValue, isEditing, form]);

  const watchedTagIds = form.watch("tagIds") ?? [];
  const watchedMedia = form.watch("media") ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.blog.list.key() });

  const createMutation = useMutation({
    mutationFn: (values: CreateBlogInput) => orpcClient.blog.create(values),
    onSuccess: () => {
      toast.success("Post created");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create post"),
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateBlogInput) =>
      orpcClient.blog.update({ id: blog!.id, ...values }),
    onSuccess: () => {
      toast.success("Post updated");
      invalidate();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update post"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: BlogFormValues) {
    if (isPending) return;
    const parsed = values as unknown as CreateBlogInput;
    isEditing ? updateMutation.mutate(parsed) : createMutation.mutate(parsed);
  }

  function addEmbedUrl(url: string) {
    if (!url) return;
    const type = detectMediaType(url);
    const current = form.getValues("media") ?? [];
    form.setValue("media", [
      ...current,
      { type, url, position: current.length },
    ]);
  }

  function removeMedia(index: number) {
    const current = form.getValues("media") ?? [];
    form.setValue(
      "media",
      current
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, position: i })),
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background z-10">
          <SheetTitle>{isEditing ? "Edit Post" : "New Post"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the blog post details below."
              : "Fill in the details to create a new blog post."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Content
              </h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My awesome post"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="my-awesome-post"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Auto-generated from title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description…"
                        rows={3}
                        className="resize-none"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post in Markdown…"
                        rows={10}
                        className="resize-none font-mono text-xs"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Cover Image
              </h3>

              <FormItem>
                <FormLabel>Upload cover image</FormLabel>
                <FileUpload
                  accept="image/*"
                  maxSizeMB={10}
                  hint="JPG, PNG, WebP — max 10 MB"
                  resourceType="blog"
                  onUploadComplete={({ id, url }: any) => {
                    form.setValue("coverImageId", id);
                    form.setValue("coverImageUrl", url);
                  }}
                />
                {form.watch("coverImageUrl") && (
                  <div className="mt-2 flex items-center gap-2">
                    <Image
                      src={form.watch("coverImageUrl")!}
                      alt="Cover preview"
                      className="h-14 w-24 rounded-md object-cover border"
                      width={96}
                      height={56}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={() => {
                        form.setValue("coverImageId", null);
                        form.setValue("coverImageUrl", "");
                      }}
                    >
                      <Trash2 className="size-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
              </FormItem>

              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Or use an external URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/cover.jpg"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value)
                            form.setValue("coverImageId", null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Media &amp; Embeds
              </h3>
              <p className="text-xs text-muted-foreground -mt-2">
                Attach images, videos (up to 5 min via upload), or embed
                YouTube, Vimeo, Twitter, Instagram, TikTok links.
              </p>

              {watchedMedia.length > 0 && (
                <div className="space-y-2">
                  {watchedMedia.map((item, index) => {
                    const Icon = MEDIA_TYPE_ICONS[item.type as MediaType];
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20"
                      >
                        <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
                        <Icon className="size-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">
                            {MEDIA_TYPE_LABELS[item.type as MediaType]}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {item.url}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeMedia(index)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <FormItem>
                <FormLabel>Upload video / image</FormLabel>
                <FileUpload
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  maxSizeMB={100}
                  hint="Images or videos up to 100 MB"
                  resourceType="blog"
                  onUploadComplete={({ url }: any) => {
                    const current = form.getValues("media") ?? [];
                    form.setValue("media", [
                      ...current,
                      { type: "UPLOAD", url, position: current.length },
                    ]);
                  }}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Embed a link</FormLabel>
                <div className="flex gap-2">
                  <Input
                    id="embed-url-input"
                    placeholder="Paste YouTube, Vimeo, Twitter, Instagram, TikTok URL…"
                    className="text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        addEmbedUrl(input.value.trim());
                        input.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      const input = document.getElementById(
                        "embed-url-input",
                      ) as HTMLInputElement;
                      addEmbedUrl(input.value.trim());
                      input.value = "";
                    }}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <FormDescription className="text-xs">
                  Press Enter or click + to add. Auto-detects YouTube, Vimeo,
                  Twitter, Instagram, TikTok.
                </FormDescription>
              </FormItem>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="readTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Read Time (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) =>
                        field.onChange(v === "none" ? null : v)
                      }
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tags?.map((tag) => {
                        const checked = watchedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              const current = form.getValues("tagIds") ?? [];
                              form.setValue(
                                "tagIds",
                                checked
                                  ? current.filter((id) => id !== tag.id)
                                  : [...current, tag.id],
                              );
                            }}
                          >
                            <Badge
                              variant={checked ? "default" : "outline"}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {tag.name}
                            </Badge>
                          </button>
                        );
                      })}
                      {!tags?.length && (
                        <p className="text-xs text-muted-foreground">
                          No tags available.
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="cursor-pointer">
                        Featured post
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Show in the featured section
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                SEO
              </h3>

              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Overrides post title for search engines"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Max 160 characters"
                        rows={2}
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {(form.watch("seoDescription") ?? "").length}/160
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-2 pb-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? "Saving…"
                    : "Creating…"
                  : isEditing
                    ? "Save Changes"
                    : "Create Post"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

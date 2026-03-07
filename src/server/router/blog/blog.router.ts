import { z } from "zod";
import {
  listBlogsInput,
  getBlogBySlugInput,
  getBlogByIdInput,
  createBlogInput,
  updateBlogInput,
  addCommentInput,
  updateCommentStatusInput,
} from "./blog.input";
import { BlogService } from "./blog.service";
import { adminOnly, authed, o } from "@/server/orpc";

export const blogRouter = {
  list: o.input(listBlogsInput).handler(async ({ input, context }) => {
    const service = new BlogService(context.db);
    return service.list(input);
  }),

  getBySlug: o.input(getBlogBySlugInput).handler(async ({ input, context }) => {
    const service = new BlogService(context.db);
    return service.getBySlug(input);
  }),

  getById: o.input(getBlogByIdInput).handler(async ({ input, context }) => {
    const service = new BlogService(context.db);
    return service.getById(input);
  }),

  getFeatured: o.handler(async ({ context }) => {
    const service = new BlogService(context.db);
    return service.getFeatured();
  }),

  incrementView: o
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.incrementView(input.id);
    }),

  addComment: authed
    .input(addCommentInput)
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.addComment(input, context.user!.id);
    }),

  create: adminOnly
    .input(createBlogInput)
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.create(input, context.user!.id);
    }),

  update: adminOnly
    .input(updateBlogInput)
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.update(input);
    }),

  delete: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.delete(input.id);
    }),

  publish: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.publish(input.id);
    }),

  approveComment: adminOnly
    .input(updateCommentStatusInput)
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.updateCommentStatus(input);
    }),

  deleteComment: adminOnly
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const service = new BlogService(context.db);
      return service.deleteComment(input.id);
    }),
};

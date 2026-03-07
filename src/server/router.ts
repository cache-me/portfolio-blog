import { o } from "./orpc";
import { analyticsRouter } from "./router/analytics/analytics.router";
import { authRouter } from "./router/auth/auth.router";
import { blogRouter } from "./router/blog/blog.router";
import { categoryRouter } from "./router/category/category.router";
import { certificateRouter } from "./router/certificate/certificate.router";
import { contactRouter } from "./router/contact/contact.router";
import { educationRouter } from "./router/education/education.router";
import { experienceRouter } from "./router/experience/experience.router";
import { newsletterRouter } from "./router/newsletter/newsletter.router";
import { profileRouter } from "./router/profile/profile.router";
import { projectRouter } from "./router/project/project.router";
import { skillRouter } from "./router/skill/skill.router";
import { socialLinkRouter } from "./router/socialLink/socialLink.router";
import { tagRouter } from "./router/tag/tag.router";
import { testimonialRouter } from "./router/testimonial/testimonial.router";

export const appRouter = o.router({
  auth: authRouter,
  analytics: analyticsRouter,
  blog: blogRouter,
  category: categoryRouter,
  certificate: certificateRouter,
  contact: contactRouter,
  education: educationRouter,
  experience: experienceRouter,
  newsletter: newsletterRouter,
  profile: profileRouter,
  project: projectRouter,
  skill: skillRouter,
  socialLink: socialLinkRouter,
  tag: tagRouter,
  testimonial: testimonialRouter,
});

export type AppRouter = typeof appRouter;

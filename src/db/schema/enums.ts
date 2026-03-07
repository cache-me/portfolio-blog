import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const blogStatus = pgEnum("blog_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const skillLevel = pgEnum("skill_level", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

export const contactStatus = pgEnum("contact_status", [
  "UNREAD",
  "READ",
  "REPLIED",
  "ARCHIVED",
]);

export const experienceType = pgEnum("experience_type", [
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "INTERNSHIP",
  "CONTRACT",
]);

export const socialPlatform = pgEnum("social_platform", [
  "GITHUB",
  "LINKEDIN",
  "TWITTER",
  "INSTAGRAM",
  "YOUTUBE",
  "FACEBOOK",
  "DRIBBBLE",
  "BEHANCE",
  "MEDIUM",
  "DEV_TO",
  "HASHNODE",
  "OTHER",
]);

export const educationDegree = pgEnum("education_degree", [
  "HIGH_SCHOOL",
  "ASSOCIATE",
  "BACHELOR",
  "MASTER",
  "PHD",
  "DIPLOMA",
  "CERTIFICATION",
  "BOOTCAMP",
  "OTHER",
]);

export const testimonialStatus = pgEnum("testimonial_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

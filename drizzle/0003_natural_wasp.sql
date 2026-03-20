CREATE TYPE "public"."blog_media_type" AS ENUM('UPLOAD', 'YOUTUBE', 'VIMEO', 'TWITTER', 'INSTAGRAM', 'TIKTOK', 'EXTERNAL');--> statement-breakpoint
CREATE TABLE "blog_media" (
	"id" text PRIMARY KEY NOT NULL,
	"blog_id" text NOT NULL,
	"type" "blog_media_type" NOT NULL,
	"upload_id" text,
	"url" text NOT NULL,
	"embed_id" text,
	"title" text,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"thumbnail_url" text,
	"duration_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog" RENAME COLUMN "cover_image" TO "cover_image_id";--> statement-breakpoint
ALTER TABLE "blog" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "blog_media" ADD CONSTRAINT "blog_media_blog_id_blog_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_media" ADD CONSTRAINT "blog_media_upload_id_upload_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."upload"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blogMedia_blogId_idx" ON "blog_media" USING btree ("blog_id");--> statement-breakpoint
CREATE INDEX "blogMedia_uploadId_idx" ON "blog_media" USING btree ("upload_id");--> statement-breakpoint
CREATE INDEX "blogMedia_position_idx" ON "blog_media" USING btree ("blog_id","position");--> statement-breakpoint
ALTER TABLE "blog" ADD CONSTRAINT "blog_cover_image_id_upload_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."upload"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_coverImageId_idx" ON "blog" USING btree ("cover_image_id");
CREATE TYPE "public"."upload_status" AS ENUM('PENDING', 'UPLOADED', 'FAILED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."upload_type" AS ENUM('IMAGE', 'PDF', 'EXCEL', 'WORD', 'VIDEO', 'AUDIO', 'OTHER');--> statement-breakpoint
CREATE TABLE "upload" (
	"id" text PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"type" "upload_type" NOT NULL,
	"status" "upload_status" DEFAULT 'PENDING' NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"bucket" text DEFAULT 'uploads' NOT NULL,
	"uploaded_by_id" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "upload_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
ALTER TABLE "upload" ADD CONSTRAINT "upload_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "upload_uploadedById_idx" ON "upload" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "upload_status_idx" ON "upload" USING btree ("status");--> statement-breakpoint
CREATE INDEX "upload_type_idx" ON "upload" USING btree ("type");--> statement-breakpoint
CREATE INDEX "upload_resourceType_resourceId_idx" ON "upload" USING btree ("resource_type","resource_id");
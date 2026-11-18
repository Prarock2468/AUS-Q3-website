import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_client_logos_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"logo_id" integer
  );
  
  CREATE TABLE "pages_blocks_client_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Trusted By Global Brands',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonial_slider_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"company" varchar,
  	"photo_id" integer,
  	"company_logo_id" integer
  );
  
  CREATE TABLE "pages_blocks_testimonial_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Testimonials',
  	"autoplay" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_case_studies_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Case Studies',
  	"limit" numeric DEFAULT 6,
  	"view_all_label" varchar DEFAULT 'View All',
  	"view_all_link" varchar DEFAULT '/case-studies',
  	"autoplay" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_common_component_ref" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"component_id" integer,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_client_logos_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_client_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Trusted By Global Brands',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_slider_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"company" varchar,
  	"photo_id" integer,
  	"company_logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Testimonials',
  	"autoplay" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_case_studies_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Case Studies',
  	"limit" numeric DEFAULT 6,
  	"view_all_label" varchar DEFAULT 'View All',
  	"view_all_link" varchar DEFAULT '/case-studies',
  	"autoplay" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_common_component_ref" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"component_id" integer,
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "pages_blocks_client_logos_logos" ADD CONSTRAINT "pages_blocks_client_logos_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_client_logos_logos" ADD CONSTRAINT "pages_blocks_client_logos_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_client_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_client_logos" ADD CONSTRAINT "pages_blocks_client_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider" ADD CONSTRAINT "pages_blocks_testimonial_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_case_studies_slider" ADD CONSTRAINT "pages_blocks_case_studies_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_common_component_ref" ADD CONSTRAINT "pages_blocks_common_component_ref_component_id_common_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."common_component"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_common_component_ref" ADD CONSTRAINT "pages_blocks_common_component_ref_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_client_logos_logos" ADD CONSTRAINT "_pages_v_blocks_client_logos_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_client_logos_logos" ADD CONSTRAINT "_pages_v_blocks_client_logos_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_client_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_client_logos" ADD CONSTRAINT "_pages_v_blocks_client_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_case_studies_slider" ADD CONSTRAINT "_pages_v_blocks_case_studies_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_common_component_ref" ADD CONSTRAINT "_pages_v_blocks_common_component_ref_component_id_common_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."common_component"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_common_component_ref" ADD CONSTRAINT "_pages_v_blocks_common_component_ref_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_client_logos_logos_order_idx" ON "pages_blocks_client_logos_logos" USING btree ("_order");
  CREATE INDEX "pages_blocks_client_logos_logos_parent_id_idx" ON "pages_blocks_client_logos_logos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_client_logos_logos_logo_idx" ON "pages_blocks_client_logos_logos" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_client_logos_order_idx" ON "pages_blocks_client_logos" USING btree ("_order");
  CREATE INDEX "pages_blocks_client_logos_parent_id_idx" ON "pages_blocks_client_logos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_client_logos_path_idx" ON "pages_blocks_client_logos" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_order_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_parent_id_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_photo_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_company_log_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  CREATE INDEX "pages_blocks_testimonial_slider_order_idx" ON "pages_blocks_testimonial_slider" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_slider_parent_id_idx" ON "pages_blocks_testimonial_slider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_slider_path_idx" ON "pages_blocks_testimonial_slider" USING btree ("_path");
  CREATE INDEX "pages_blocks_case_studies_slider_order_idx" ON "pages_blocks_case_studies_slider" USING btree ("_order");
  CREATE INDEX "pages_blocks_case_studies_slider_parent_id_idx" ON "pages_blocks_case_studies_slider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_case_studies_slider_path_idx" ON "pages_blocks_case_studies_slider" USING btree ("_path");
  CREATE INDEX "pages_blocks_common_component_ref_order_idx" ON "pages_blocks_common_component_ref" USING btree ("_order");
  CREATE INDEX "pages_blocks_common_component_ref_parent_id_idx" ON "pages_blocks_common_component_ref" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_common_component_ref_path_idx" ON "pages_blocks_common_component_ref" USING btree ("_path");
  CREATE INDEX "pages_blocks_common_component_ref_component_idx" ON "pages_blocks_common_component_ref" USING btree ("component_id");
  CREATE INDEX "_pages_v_blocks_client_logos_logos_order_idx" ON "_pages_v_blocks_client_logos_logos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_client_logos_logos_parent_id_idx" ON "_pages_v_blocks_client_logos_logos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_client_logos_logos_logo_idx" ON "_pages_v_blocks_client_logos_logos" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_client_logos_order_idx" ON "_pages_v_blocks_client_logos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_client_logos_parent_id_idx" ON "_pages_v_blocks_client_logos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_client_logos_path_idx" ON "_pages_v_blocks_client_logos" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_order_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_photo_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_company__idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_order_idx" ON "_pages_v_blocks_testimonial_slider" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_parent_id_idx" ON "_pages_v_blocks_testimonial_slider" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_path_idx" ON "_pages_v_blocks_testimonial_slider" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_case_studies_slider_order_idx" ON "_pages_v_blocks_case_studies_slider" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_case_studies_slider_parent_id_idx" ON "_pages_v_blocks_case_studies_slider" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_case_studies_slider_path_idx" ON "_pages_v_blocks_case_studies_slider" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_common_component_ref_order_idx" ON "_pages_v_blocks_common_component_ref" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_common_component_ref_parent_id_idx" ON "_pages_v_blocks_common_component_ref" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_common_component_ref_path_idx" ON "_pages_v_blocks_common_component_ref" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_common_component_ref_component_idx" ON "_pages_v_blocks_common_component_ref" USING btree ("component_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_case_studies_id_idx" ON "pages_rels" USING btree ("case_studies_id");
  CREATE INDEX "_pages_v_rels_case_studies_id_idx" ON "_pages_v_rels" USING btree ("case_studies_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_client_logos_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_client_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonial_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_case_studies_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_common_component_ref" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_client_logos_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_client_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonial_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_case_studies_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_common_component_ref" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_client_logos_logos" CASCADE;
  DROP TABLE "pages_blocks_client_logos" CASCADE;
  DROP TABLE "pages_blocks_testimonial_slider_testimonials" CASCADE;
  DROP TABLE "pages_blocks_testimonial_slider" CASCADE;
  DROP TABLE "pages_blocks_case_studies_slider" CASCADE;
  DROP TABLE "pages_blocks_common_component_ref" CASCADE;
  DROP TABLE "_pages_v_blocks_client_logos_logos" CASCADE;
  DROP TABLE "_pages_v_blocks_client_logos" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_slider_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_slider" CASCADE;
  DROP TABLE "_pages_v_blocks_case_studies_slider" CASCADE;
  DROP TABLE "_pages_v_blocks_common_component_ref" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_case_studies_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_case_studies_fk";
  
  DROP INDEX "pages_rels_case_studies_id_idx";
  DROP INDEX "_pages_v_rels_case_studies_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "case_studies_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "case_studies_id";`)
}

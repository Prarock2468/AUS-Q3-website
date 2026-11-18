import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "common_component_blocks_client_logos_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar,
  	"logo_id" integer NOT NULL
  );
  
  CREATE TABLE "common_component_blocks_client_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Trusted By Global Brands',
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_testimonial_slider_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"photo_id" integer,
  	"company_logo_id" integer
  );
  
  CREATE TABLE "common_component_blocks_testimonial_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Testimonials',
  	"autoplay" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_case_studies_slider" (
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
  
  ALTER TABLE "common_component_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "common_component_blocks_client_logos_logos" ADD CONSTRAINT "common_component_blocks_client_logos_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "common_component_blocks_client_logos_logos" ADD CONSTRAINT "common_component_blocks_client_logos_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_client_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_client_logos" ADD CONSTRAINT "common_component_blocks_client_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "common_component_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "common_component_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "common_component_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_testimonial_slider" ADD CONSTRAINT "common_component_blocks_testimonial_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_case_studies_slider" ADD CONSTRAINT "common_component_blocks_case_studies_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "common_component_blocks_client_logos_logos_order_idx" ON "common_component_blocks_client_logos_logos" USING btree ("_order");
  CREATE INDEX "common_component_blocks_client_logos_logos_parent_id_idx" ON "common_component_blocks_client_logos_logos" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_client_logos_logos_logo_idx" ON "common_component_blocks_client_logos_logos" USING btree ("logo_id");
  CREATE INDEX "common_component_blocks_client_logos_order_idx" ON "common_component_blocks_client_logos" USING btree ("_order");
  CREATE INDEX "common_component_blocks_client_logos_parent_id_idx" ON "common_component_blocks_client_logos" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_client_logos_path_idx" ON "common_component_blocks_client_logos" USING btree ("_path");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonials_order_idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonials_parent_id_idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonials__idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonial_1_idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  CREATE INDEX "common_component_blocks_testimonial_slider_order_idx" ON "common_component_blocks_testimonial_slider" USING btree ("_order");
  CREATE INDEX "common_component_blocks_testimonial_slider_parent_id_idx" ON "common_component_blocks_testimonial_slider" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_testimonial_slider_path_idx" ON "common_component_blocks_testimonial_slider" USING btree ("_path");
  CREATE INDEX "common_component_blocks_case_studies_slider_order_idx" ON "common_component_blocks_case_studies_slider" USING btree ("_order");
  CREATE INDEX "common_component_blocks_case_studies_slider_parent_id_idx" ON "common_component_blocks_case_studies_slider" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_case_studies_slider_path_idx" ON "common_component_blocks_case_studies_slider" USING btree ("_path");
  ALTER TABLE "common_component_rels" ADD CONSTRAINT "common_component_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "common_component_rels_case_studies_id_idx" ON "common_component_rels" USING btree ("case_studies_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "common_component_blocks_client_logos_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_client_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_testimonial_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_case_studies_slider" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "common_component_blocks_client_logos_logos" CASCADE;
  DROP TABLE "common_component_blocks_client_logos" CASCADE;
  DROP TABLE "common_component_blocks_testimonial_slider_testimonials" CASCADE;
  DROP TABLE "common_component_blocks_testimonial_slider" CASCADE;
  DROP TABLE "common_component_blocks_case_studies_slider" CASCADE;
  ALTER TABLE "common_component_rels" DROP CONSTRAINT "common_component_rels_case_studies_fk";
  
  DROP INDEX "common_component_rels_case_studies_id_idx";
  ALTER TABLE "common_component_rels" DROP COLUMN "case_studies_id";`)
}

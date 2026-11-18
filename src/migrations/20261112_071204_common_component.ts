import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_common_component_blocks_faq_style" AS ENUM('home-faq', 'section', 'home');
  CREATE TYPE "public"."enum_common_component_blocks_shared_section_section" AS ENUM('brands', 'testimonials', 'caseStudyStories', 'otherIndustries');
  CREATE TABLE "common_component_blocks_html_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"html" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL
  );
  
  CREATE TABLE "common_component_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Frequently asked questions',
  	"style" "enum_common_component_blocks_faq_style" DEFAULT 'home-faq',
  	"intro" varchar DEFAULT 'Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.',
  	"show_sales_contact" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_contact_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"text" varchar,
  	"thanks_text" varchar DEFAULT 'Our Australian team will reply within 4 business hours (AEST).',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_shared_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_common_component_blocks_shared_section_section" NOT NULL,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_case_study_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'All case studies',
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_size" numeric DEFAULT 12,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_latest_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Insights',
  	"limit" numeric DEFAULT 5,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "common_component_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"insights_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "common_component_id" integer;
  ALTER TABLE "common_component_blocks_html_section" ADD CONSTRAINT "common_component_blocks_html_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_faq_items" ADD CONSTRAINT "common_component_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_faq" ADD CONSTRAINT "common_component_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_contact_band" ADD CONSTRAINT "common_component_blocks_contact_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_shared_section" ADD CONSTRAINT "common_component_blocks_shared_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_case_study_list" ADD CONSTRAINT "common_component_blocks_case_study_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_insight_list" ADD CONSTRAINT "common_component_blocks_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_latest_insights" ADD CONSTRAINT "common_component_blocks_latest_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_rels" ADD CONSTRAINT "common_component_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_rels" ADD CONSTRAINT "common_component_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "common_component_blocks_html_section_order_idx" ON "common_component_blocks_html_section" USING btree ("_order");
  CREATE INDEX "common_component_blocks_html_section_parent_id_idx" ON "common_component_blocks_html_section" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_html_section_path_idx" ON "common_component_blocks_html_section" USING btree ("_path");
  CREATE INDEX "common_component_blocks_faq_items_order_idx" ON "common_component_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "common_component_blocks_faq_items_parent_id_idx" ON "common_component_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_faq_order_idx" ON "common_component_blocks_faq" USING btree ("_order");
  CREATE INDEX "common_component_blocks_faq_parent_id_idx" ON "common_component_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_faq_path_idx" ON "common_component_blocks_faq" USING btree ("_path");
  CREATE INDEX "common_component_blocks_contact_band_order_idx" ON "common_component_blocks_contact_band" USING btree ("_order");
  CREATE INDEX "common_component_blocks_contact_band_parent_id_idx" ON "common_component_blocks_contact_band" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_contact_band_path_idx" ON "common_component_blocks_contact_band" USING btree ("_path");
  CREATE INDEX "common_component_blocks_shared_section_order_idx" ON "common_component_blocks_shared_section" USING btree ("_order");
  CREATE INDEX "common_component_blocks_shared_section_parent_id_idx" ON "common_component_blocks_shared_section" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_shared_section_path_idx" ON "common_component_blocks_shared_section" USING btree ("_path");
  CREATE INDEX "common_component_blocks_case_study_list_order_idx" ON "common_component_blocks_case_study_list" USING btree ("_order");
  CREATE INDEX "common_component_blocks_case_study_list_parent_id_idx" ON "common_component_blocks_case_study_list" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_case_study_list_path_idx" ON "common_component_blocks_case_study_list" USING btree ("_path");
  CREATE INDEX "common_component_blocks_insight_list_order_idx" ON "common_component_blocks_insight_list" USING btree ("_order");
  CREATE INDEX "common_component_blocks_insight_list_parent_id_idx" ON "common_component_blocks_insight_list" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_insight_list_path_idx" ON "common_component_blocks_insight_list" USING btree ("_path");
  CREATE INDEX "common_component_blocks_latest_insights_order_idx" ON "common_component_blocks_latest_insights" USING btree ("_order");
  CREATE INDEX "common_component_blocks_latest_insights_parent_id_idx" ON "common_component_blocks_latest_insights" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_latest_insights_path_idx" ON "common_component_blocks_latest_insights" USING btree ("_path");
  CREATE UNIQUE INDEX "common_component_key_idx" ON "common_component" USING btree ("key");
  CREATE INDEX "common_component_updated_at_idx" ON "common_component" USING btree ("updated_at");
  CREATE INDEX "common_component_created_at_idx" ON "common_component" USING btree ("created_at");
  CREATE INDEX "common_component_rels_order_idx" ON "common_component_rels" USING btree ("order");
  CREATE INDEX "common_component_rels_parent_idx" ON "common_component_rels" USING btree ("parent_id");
  CREATE INDEX "common_component_rels_path_idx" ON "common_component_rels" USING btree ("path");
  CREATE INDEX "common_component_rels_insights_id_idx" ON "common_component_rels" USING btree ("insights_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_common_component_fk" FOREIGN KEY ("common_component_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_common_component_id_idx" ON "payload_locked_documents_rels" USING btree ("common_component_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "common_component_blocks_html_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_contact_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_shared_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_case_study_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_insight_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_latest_insights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "common_component_blocks_html_section" CASCADE;
  DROP TABLE "common_component_blocks_faq_items" CASCADE;
  DROP TABLE "common_component_blocks_faq" CASCADE;
  DROP TABLE "common_component_blocks_contact_band" CASCADE;
  DROP TABLE "common_component_blocks_shared_section" CASCADE;
  DROP TABLE "common_component_blocks_case_study_list" CASCADE;
  DROP TABLE "common_component_blocks_insight_list" CASCADE;
  DROP TABLE "common_component_blocks_latest_insights" CASCADE;
  DROP TABLE "common_component" CASCADE;
  DROP TABLE "common_component_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_common_component_fk";
  
  DROP INDEX "payload_locked_documents_rels_common_component_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "common_component_id";
  DROP TYPE "public"."enum_common_component_blocks_faq_style";
  DROP TYPE "public"."enum_common_component_blocks_shared_section_section";`)
}

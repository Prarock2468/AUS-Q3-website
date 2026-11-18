import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Testimonials move from their own collection into the Testimonial slider (Common Component), and pages now pick
  // from the slider's list. The collection's testimonials are re-created from Site settings by
  // `npm run seed:testimonials`; per-page picks of collection testimonials can't be carried over, so stop if any exist.
  const { rows } = await db.execute(sql`
    SELECT (SELECT count(*) FROM "pages_rels" WHERE "testimonials_id" IS NOT NULL)
         + (SELECT count(*) FROM "_pages_v_rels" WHERE "testimonials_id" IS NOT NULL) AS n`)
  if (Number((rows[0] as { n?: number | string } | undefined)?.n) > 0) {
    throw new Error(
      'Some pages pick testimonials under "Testimonials for this page". Note those picks and clear them, then migrate, ' +
        'run `npm run seed:testimonials` and pick them again.',
    )
  }
  await db.execute(sql`
   CREATE TABLE "pages_blocks_testimonial_slider_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"company" varchar,
  	"quote" varchar,
  	"photo_id" integer,
  	"company_logo_id" integer,
  	"photo_html" varchar
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial_slider_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"company" varchar,
  	"quote" varchar,
  	"photo_id" integer,
  	"company_logo_id" integer,
  	"photo_html" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "common_component_blocks_testimonial_slider_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"quote" varchar NOT NULL,
  	"photo_id" integer,
  	"company_logo_id" integer,
  	"photo_html" varchar
  );
  
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "testimonials" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_testimonials_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_testimonials_fk";
  
  ALTER TABLE "common_component_rels" DROP CONSTRAINT IF EXISTS "common_component_rels_testimonials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_testimonials_fk";
  
  DROP INDEX IF EXISTS "pages_rels_testimonials_id_idx";
  DROP INDEX IF EXISTS "_pages_v_rels_testimonials_id_idx";
  DROP INDEX IF EXISTS "common_component_rels_testimonials_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_testimonials_id_idx";
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "common_component_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "common_component_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "common_component_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_order_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_parent_id_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_photo_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_company_log_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_order_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_photo_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_company__idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonials_order_idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonials_parent_id_idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonials__idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "common_component_blocks_testimonial_slider_testimonial_1_idx" ON "common_component_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  ALTER TABLE "pages_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "common_component_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"quote" varchar NOT NULL,
  	"photo_id" integer,
  	"company_logo_id" integer,
  	"photo_html" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_testimonial_slider_testimonials" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_testimonial_slider_testimonials" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_slider_testimonials" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TABLE "common_component_blocks_testimonial_slider_testimonials" CASCADE;
  ALTER TABLE "pages_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "common_component_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "testimonials__order_idx" ON "testimonials" USING btree ("_order");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_company_logo_idx" ON "testimonials" USING btree ("company_logo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_rels" ADD CONSTRAINT "common_component_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "common_component_rels_testimonials_id_idx" ON "common_component_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");`)
}

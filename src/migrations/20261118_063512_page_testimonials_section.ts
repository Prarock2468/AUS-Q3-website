import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Pages now add a "Testimonials" section (picking from Common Component → Testimonial Slider) instead of a
  // page-level "Testimonial slider" with typed-in testimonials, whose tables are dropped. Stop if any page used one.
  const { rows } = await db.execute(sql`
    SELECT (SELECT count(*) FROM "pages_blocks_testimonial_slider")
         + (SELECT count(*) FROM "_pages_v_blocks_testimonial_slider") AS n`)
  if (Number((rows[0] as { n?: number | string } | undefined)?.n) > 0) {
    throw new Error(
      'Some pages still have a "Testimonial slider" section. Move its testimonials into Common Component → ' +
        'Testimonial Slider, replace the section with a "Testimonials" section, publish, then migrate.',
    )
  }
  await db.execute(sql`
   CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP TABLE "pages_blocks_testimonial_slider_testimonials" CASCADE;
  DROP TABLE "pages_blocks_testimonial_slider" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_slider_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial_slider" CASCADE;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  
  CREATE TABLE "pages_blocks_testimonial_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Testimonials',
  	"autoplay" boolean DEFAULT true,
  	"block_name" varchar
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
  
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "pages_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial_slider" ADD CONSTRAINT "pages_blocks_testimonial_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonial_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial_slider" ADD CONSTRAINT "_pages_v_blocks_testimonial_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_order_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_parent_id_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_photo_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_testimonial_slider_testimonials_company_log_idx" ON "pages_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  CREATE INDEX "pages_blocks_testimonial_slider_order_idx" ON "pages_blocks_testimonial_slider" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_slider_parent_id_idx" ON "pages_blocks_testimonial_slider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_slider_path_idx" ON "pages_blocks_testimonial_slider" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_order_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_photo_idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_testimonials_company__idx" ON "_pages_v_blocks_testimonial_slider_testimonials" USING btree ("company_logo_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_order_idx" ON "_pages_v_blocks_testimonial_slider" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_parent_id_idx" ON "_pages_v_blocks_testimonial_slider" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_slider_path_idx" ON "_pages_v_blocks_testimonial_slider" USING btree ("_path");`)
}

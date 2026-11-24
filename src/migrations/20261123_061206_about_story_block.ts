import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_about_story_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_about_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Our Story',
  	"heading" varchar DEFAULT 'Championing Quality, Shaping Tomorrow',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_story_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Our Story',
  	"heading" varchar DEFAULT 'Championing Quality, Shaping Tomorrow',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_about_story_milestones" ADD CONSTRAINT "pages_blocks_about_story_milestones_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_story_milestones" ADD CONSTRAINT "pages_blocks_about_story_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_story" ADD CONSTRAINT "pages_blocks_about_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_story_milestones" ADD CONSTRAINT "_pages_v_blocks_about_story_milestones_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_story_milestones" ADD CONSTRAINT "_pages_v_blocks_about_story_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_story" ADD CONSTRAINT "_pages_v_blocks_about_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_about_story_milestones_order_idx" ON "pages_blocks_about_story_milestones" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_story_milestones_parent_id_idx" ON "pages_blocks_about_story_milestones" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_story_milestones_image_idx" ON "pages_blocks_about_story_milestones" USING btree ("image_id");
  CREATE INDEX "pages_blocks_about_story_order_idx" ON "pages_blocks_about_story" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_story_parent_id_idx" ON "pages_blocks_about_story" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_story_path_idx" ON "pages_blocks_about_story" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_about_story_milestones_order_idx" ON "_pages_v_blocks_about_story_milestones" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_story_milestones_parent_id_idx" ON "_pages_v_blocks_about_story_milestones" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_story_milestones_image_idx" ON "_pages_v_blocks_about_story_milestones" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_about_story_order_idx" ON "_pages_v_blocks_about_story" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_story_parent_id_idx" ON "_pages_v_blocks_about_story" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_story_path_idx" ON "_pages_v_blocks_about_story" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_about_story_milestones" CASCADE;
  DROP TABLE "pages_blocks_about_story" CASCADE;
  DROP TABLE "_pages_v_blocks_about_story_milestones" CASCADE;
  DROP TABLE "_pages_v_blocks_about_story" CASCADE;`)
}

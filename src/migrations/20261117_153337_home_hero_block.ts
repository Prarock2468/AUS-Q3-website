import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_home_hero_buttons_style" AS ENUM('primary', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_home_hero_buttons_style" AS ENUM('primary', 'outline');
  CREATE TABLE "pages_blocks_home_hero_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"highlight" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_home_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"link" varchar,
  	"style" "enum_pages_blocks_home_hero_buttons_style" DEFAULT 'primary',
  	"tracking_id" varchar
  );
  
  CREATE TABLE "pages_blocks_home_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"poster_id" integer,
  	"video_webm_id" integer,
  	"video_mp4_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_hero_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"highlight" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"link" varchar,
  	"style" "enum__pages_v_blocks_home_hero_buttons_style" DEFAULT 'primary',
  	"tracking_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"poster_id" integer,
  	"video_webm_id" integer,
  	"video_mp4_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_home_hero_badges" ADD CONSTRAINT "pages_blocks_home_hero_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero_buttons" ADD CONSTRAINT "pages_blocks_home_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero" ADD CONSTRAINT "pages_blocks_home_hero_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero" ADD CONSTRAINT "pages_blocks_home_hero_video_webm_id_media_id_fk" FOREIGN KEY ("video_webm_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero" ADD CONSTRAINT "pages_blocks_home_hero_video_mp4_id_media_id_fk" FOREIGN KEY ("video_mp4_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero" ADD CONSTRAINT "pages_blocks_home_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_hero_badges" ADD CONSTRAINT "_pages_v_blocks_home_hero_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_home_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_hero_buttons" ADD CONSTRAINT "_pages_v_blocks_home_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_home_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_hero" ADD CONSTRAINT "_pages_v_blocks_home_hero_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_hero" ADD CONSTRAINT "_pages_v_blocks_home_hero_video_webm_id_media_id_fk" FOREIGN KEY ("video_webm_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_hero" ADD CONSTRAINT "_pages_v_blocks_home_hero_video_mp4_id_media_id_fk" FOREIGN KEY ("video_mp4_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_hero" ADD CONSTRAINT "_pages_v_blocks_home_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_home_hero_badges_order_idx" ON "pages_blocks_home_hero_badges" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_hero_badges_parent_id_idx" ON "pages_blocks_home_hero_badges" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_hero_buttons_order_idx" ON "pages_blocks_home_hero_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_hero_buttons_parent_id_idx" ON "pages_blocks_home_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_hero_order_idx" ON "pages_blocks_home_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_hero_parent_id_idx" ON "pages_blocks_home_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_hero_path_idx" ON "pages_blocks_home_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_home_hero_poster_idx" ON "pages_blocks_home_hero" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_home_hero_video_webm_idx" ON "pages_blocks_home_hero" USING btree ("video_webm_id");
  CREATE INDEX "pages_blocks_home_hero_video_mp4_idx" ON "pages_blocks_home_hero" USING btree ("video_mp4_id");
  CREATE INDEX "_pages_v_blocks_home_hero_badges_order_idx" ON "_pages_v_blocks_home_hero_badges" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_hero_badges_parent_id_idx" ON "_pages_v_blocks_home_hero_badges" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_hero_buttons_order_idx" ON "_pages_v_blocks_home_hero_buttons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_hero_buttons_parent_id_idx" ON "_pages_v_blocks_home_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_hero_order_idx" ON "_pages_v_blocks_home_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_hero_parent_id_idx" ON "_pages_v_blocks_home_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_hero_path_idx" ON "_pages_v_blocks_home_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_home_hero_poster_idx" ON "_pages_v_blocks_home_hero" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_home_hero_video_webm_idx" ON "_pages_v_blocks_home_hero" USING btree ("video_webm_id");
  CREATE INDEX "_pages_v_blocks_home_hero_video_mp4_idx" ON "_pages_v_blocks_home_hero" USING btree ("video_mp4_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_home_hero_badges" CASCADE;
  DROP TABLE "pages_blocks_home_hero_buttons" CASCADE;
  DROP TABLE "pages_blocks_home_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_home_hero_badges" CASCADE;
  DROP TABLE "_pages_v_blocks_home_hero_buttons" CASCADE;
  DROP TABLE "_pages_v_blocks_home_hero" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_home_hero_buttons_style";
  DROP TYPE "public"."enum__pages_v_blocks_home_hero_buttons_style";`)
}

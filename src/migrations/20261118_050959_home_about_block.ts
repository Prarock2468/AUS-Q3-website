import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_home_about_buttons_style" AS ENUM('primary', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_home_about_buttons_style" AS ENUM('primary', 'outline');
  CREATE TABLE "pages_blocks_home_about_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"link" varchar,
  	"style" "enum_pages_blocks_home_about_buttons_style" DEFAULT 'primary',
  	"tracking_id" varchar
  );
  
  CREATE TABLE "pages_blocks_home_about_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"icon_id" integer
  );
  
  CREATE TABLE "pages_blocks_home_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_about_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"link" varchar,
  	"style" "enum__pages_v_blocks_home_about_buttons_style" DEFAULT 'primary',
  	"tracking_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_about_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"icon_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_home_about_buttons" ADD CONSTRAINT "pages_blocks_home_about_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_about_stats" ADD CONSTRAINT "pages_blocks_home_about_stats_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_about_stats" ADD CONSTRAINT "pages_blocks_home_about_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_about" ADD CONSTRAINT "pages_blocks_home_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_about_buttons" ADD CONSTRAINT "_pages_v_blocks_home_about_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_home_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_about_stats" ADD CONSTRAINT "_pages_v_blocks_home_about_stats_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_about_stats" ADD CONSTRAINT "_pages_v_blocks_home_about_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_home_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_about" ADD CONSTRAINT "_pages_v_blocks_home_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_home_about_buttons_order_idx" ON "pages_blocks_home_about_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_about_buttons_parent_id_idx" ON "pages_blocks_home_about_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_about_stats_order_idx" ON "pages_blocks_home_about_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_about_stats_parent_id_idx" ON "pages_blocks_home_about_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_about_stats_icon_idx" ON "pages_blocks_home_about_stats" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_home_about_order_idx" ON "pages_blocks_home_about" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_about_parent_id_idx" ON "pages_blocks_home_about" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_about_path_idx" ON "pages_blocks_home_about" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_home_about_buttons_order_idx" ON "_pages_v_blocks_home_about_buttons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_about_buttons_parent_id_idx" ON "_pages_v_blocks_home_about_buttons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_about_stats_order_idx" ON "_pages_v_blocks_home_about_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_about_stats_parent_id_idx" ON "_pages_v_blocks_home_about_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_about_stats_icon_idx" ON "_pages_v_blocks_home_about_stats" USING btree ("icon_id");
  CREATE INDEX "_pages_v_blocks_home_about_order_idx" ON "_pages_v_blocks_home_about" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_about_parent_id_idx" ON "_pages_v_blocks_home_about" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_about_path_idx" ON "_pages_v_blocks_home_about" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_home_about_buttons" CASCADE;
  DROP TABLE "pages_blocks_home_about_stats" CASCADE;
  DROP TABLE "pages_blocks_home_about" CASCADE;
  DROP TABLE "_pages_v_blocks_home_about_buttons" CASCADE;
  DROP TABLE "_pages_v_blocks_home_about_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_home_about" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_home_about_buttons_style";
  DROP TYPE "public"."enum__pages_v_blocks_home_about_buttons_style";`)
}

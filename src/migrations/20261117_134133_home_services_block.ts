import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_home_services_services_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_home_services_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"link" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_home_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our Services',
  	"view_all_label" varchar DEFAULT 'View All',
  	"view_all_link" varchar DEFAULT '/services',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_services_services_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_services_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"link_label" varchar,
  	"link" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our Services',
  	"view_all_label" varchar DEFAULT 'View All',
  	"view_all_link" varchar DEFAULT '/services',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_home_services_services_sub_services" ADD CONSTRAINT "pages_blocks_home_services_services_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_services_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_services_services" ADD CONSTRAINT "pages_blocks_home_services_services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_services_services" ADD CONSTRAINT "pages_blocks_home_services_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_home_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_services" ADD CONSTRAINT "pages_blocks_home_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_services_services_sub_services" ADD CONSTRAINT "_pages_v_blocks_home_services_services_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_home_services_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_services_services" ADD CONSTRAINT "_pages_v_blocks_home_services_services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_services_services" ADD CONSTRAINT "_pages_v_blocks_home_services_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_home_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_services" ADD CONSTRAINT "_pages_v_blocks_home_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_home_services_services_sub_services_order_idx" ON "pages_blocks_home_services_services_sub_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_services_services_sub_services_parent_id_idx" ON "pages_blocks_home_services_services_sub_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_services_services_order_idx" ON "pages_blocks_home_services_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_services_services_parent_id_idx" ON "pages_blocks_home_services_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_services_services_image_idx" ON "pages_blocks_home_services_services" USING btree ("image_id");
  CREATE INDEX "pages_blocks_home_services_order_idx" ON "pages_blocks_home_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_services_parent_id_idx" ON "pages_blocks_home_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_services_path_idx" ON "pages_blocks_home_services" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_home_services_services_sub_services_order_idx" ON "_pages_v_blocks_home_services_services_sub_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_services_services_sub_services_parent_id_idx" ON "_pages_v_blocks_home_services_services_sub_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_services_services_order_idx" ON "_pages_v_blocks_home_services_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_services_services_parent_id_idx" ON "_pages_v_blocks_home_services_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_services_services_image_idx" ON "_pages_v_blocks_home_services_services" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_home_services_order_idx" ON "_pages_v_blocks_home_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_services_parent_id_idx" ON "_pages_v_blocks_home_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_services_path_idx" ON "_pages_v_blocks_home_services" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_home_services_services_sub_services" CASCADE;
  DROP TABLE "pages_blocks_home_services_services" CASCADE;
  DROP TABLE "pages_blocks_home_services" CASCADE;
  DROP TABLE "_pages_v_blocks_home_services_services_sub_services" CASCADE;
  DROP TABLE "_pages_v_blocks_home_services_services" CASCADE;
  DROP TABLE "_pages_v_blocks_home_services" CASCADE;`)
}

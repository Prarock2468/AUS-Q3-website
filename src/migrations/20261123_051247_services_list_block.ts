import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_services_list_services_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_services_list_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"button_label" varchar DEFAULT 'Explore More',
  	"button_link" varchar
  );
  
  CREATE TABLE "pages_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our Services',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_list_services_sub_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_list_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"button_label" varchar DEFAULT 'Explore More',
  	"button_link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our Services',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_services_list_services_sub_services" ADD CONSTRAINT "pages_blocks_services_list_services_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services_list_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_list_services" ADD CONSTRAINT "pages_blocks_services_list_services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_list_services" ADD CONSTRAINT "pages_blocks_services_list_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_list" ADD CONSTRAINT "pages_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_list_services_sub_services" ADD CONSTRAINT "_pages_v_blocks_services_list_services_sub_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services_list_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_list_services" ADD CONSTRAINT "_pages_v_blocks_services_list_services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_list_services" ADD CONSTRAINT "_pages_v_blocks_services_list_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_list" ADD CONSTRAINT "_pages_v_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_services_list_services_sub_services_order_idx" ON "pages_blocks_services_list_services_sub_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_list_services_sub_services_parent_id_idx" ON "pages_blocks_services_list_services_sub_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_list_services_order_idx" ON "pages_blocks_services_list_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_list_services_parent_id_idx" ON "pages_blocks_services_list_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_list_services_image_idx" ON "pages_blocks_services_list_services" USING btree ("image_id");
  CREATE INDEX "pages_blocks_services_list_order_idx" ON "pages_blocks_services_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_list_parent_id_idx" ON "pages_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_list_path_idx" ON "pages_blocks_services_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_list_services_sub_services_order_idx" ON "_pages_v_blocks_services_list_services_sub_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_list_services_sub_services_parent_id_idx" ON "_pages_v_blocks_services_list_services_sub_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_list_services_order_idx" ON "_pages_v_blocks_services_list_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_list_services_parent_id_idx" ON "_pages_v_blocks_services_list_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_list_services_image_idx" ON "_pages_v_blocks_services_list_services" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_services_list_order_idx" ON "_pages_v_blocks_services_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_list_parent_id_idx" ON "_pages_v_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_list_path_idx" ON "_pages_v_blocks_services_list" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_services_list_services_sub_services" CASCADE;
  DROP TABLE "pages_blocks_services_list_services" CASCADE;
  DROP TABLE "pages_blocks_services_list" CASCADE;
  DROP TABLE "_pages_v_blocks_services_list_services_sub_services" CASCADE;
  DROP TABLE "_pages_v_blocks_services_list_services" CASCADE;
  DROP TABLE "_pages_v_blocks_services_list" CASCADE;`)
}

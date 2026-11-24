import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_service_offerings_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Explore More',
  	"button_link" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_service_offerings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_service_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_offerings_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Explore More',
  	"button_link" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_offerings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_service_offerings_items" ADD CONSTRAINT "pages_blocks_service_offerings_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_offerings_items" ADD CONSTRAINT "pages_blocks_service_offerings_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_offerings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_offerings" ADD CONSTRAINT "pages_blocks_service_offerings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_process_steps" ADD CONSTRAINT "pages_blocks_service_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_process_steps" ADD CONSTRAINT "pages_blocks_service_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_process" ADD CONSTRAINT "pages_blocks_service_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_offerings_items" ADD CONSTRAINT "_pages_v_blocks_service_offerings_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_offerings_items" ADD CONSTRAINT "_pages_v_blocks_service_offerings_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_service_offerings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_offerings" ADD CONSTRAINT "_pages_v_blocks_service_offerings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_process_steps" ADD CONSTRAINT "_pages_v_blocks_service_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_process_steps" ADD CONSTRAINT "_pages_v_blocks_service_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_service_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_process" ADD CONSTRAINT "_pages_v_blocks_service_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_service_offerings_items_order_idx" ON "pages_blocks_service_offerings_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_offerings_items_parent_id_idx" ON "pages_blocks_service_offerings_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_offerings_items_image_idx" ON "pages_blocks_service_offerings_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_service_offerings_order_idx" ON "pages_blocks_service_offerings" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_offerings_parent_id_idx" ON "pages_blocks_service_offerings" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_offerings_path_idx" ON "pages_blocks_service_offerings" USING btree ("_path");
  CREATE INDEX "pages_blocks_service_process_steps_order_idx" ON "pages_blocks_service_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_process_steps_parent_id_idx" ON "pages_blocks_service_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_process_steps_image_idx" ON "pages_blocks_service_process_steps" USING btree ("image_id");
  CREATE INDEX "pages_blocks_service_process_order_idx" ON "pages_blocks_service_process" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_process_parent_id_idx" ON "pages_blocks_service_process" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_process_path_idx" ON "pages_blocks_service_process" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_offerings_items_order_idx" ON "_pages_v_blocks_service_offerings_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_offerings_items_parent_id_idx" ON "_pages_v_blocks_service_offerings_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_offerings_items_image_idx" ON "_pages_v_blocks_service_offerings_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_service_offerings_order_idx" ON "_pages_v_blocks_service_offerings" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_offerings_parent_id_idx" ON "_pages_v_blocks_service_offerings" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_offerings_path_idx" ON "_pages_v_blocks_service_offerings" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_process_steps_order_idx" ON "_pages_v_blocks_service_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_process_steps_parent_id_idx" ON "_pages_v_blocks_service_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_process_steps_image_idx" ON "_pages_v_blocks_service_process_steps" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_service_process_order_idx" ON "_pages_v_blocks_service_process" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_process_parent_id_idx" ON "_pages_v_blocks_service_process" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_process_path_idx" ON "_pages_v_blocks_service_process" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_service_offerings_items" CASCADE;
  DROP TABLE "pages_blocks_service_offerings" CASCADE;
  DROP TABLE "pages_blocks_service_process_steps" CASCADE;
  DROP TABLE "pages_blocks_service_process" CASCADE;
  DROP TABLE "_pages_v_blocks_service_offerings_items" CASCADE;
  DROP TABLE "_pages_v_blocks_service_offerings" CASCADE;
  DROP TABLE "_pages_v_blocks_service_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_service_process" CASCADE;`)
}

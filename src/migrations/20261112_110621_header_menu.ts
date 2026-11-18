import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_menu_items_submenu_style" AS ENUM('wide', 'compact');
  CREATE TABLE "header_menu_items_submenu" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar
  );
  
  CREATE TABLE "header_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar,
  	"submenu_style" "enum_header_menu_items_submenu_style" DEFAULT 'wide'
  );
  
  CREATE TABLE "header_menu" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "header_menu_items_submenu" ADD CONSTRAINT "header_menu_items_submenu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menu_items" ADD CONSTRAINT "header_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_menu"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_menu_items_submenu_order_idx" ON "header_menu_items_submenu" USING btree ("_order");
  CREATE INDEX "header_menu_items_submenu_parent_id_idx" ON "header_menu_items_submenu" USING btree ("_parent_id");
  CREATE INDEX "header_menu_items_order_idx" ON "header_menu_items" USING btree ("_order");
  CREATE INDEX "header_menu_items_parent_id_idx" ON "header_menu_items" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "header_menu_items_submenu" CASCADE;
  DROP TABLE "header_menu_items" CASCADE;
  DROP TABLE "header_menu" CASCADE;
  DROP TYPE "public"."enum_header_menu_items_submenu_style";`)
}

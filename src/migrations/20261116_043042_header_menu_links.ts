import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_menu_items_submenu_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_menu_items_type" AS ENUM('reference', 'custom');
  CREATE TABLE "header_menu_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"case_studies_id" integer,
  	"insights_id" integer
  );
  
  ALTER TABLE "header_menu_items_submenu" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "header_menu_items" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "header_menu_items_submenu" ADD COLUMN "type" "enum_header_menu_items_submenu_type" DEFAULT 'reference';
  ALTER TABLE "header_menu_items_submenu" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "header_menu_items" ADD COLUMN "type" "enum_header_menu_items_type" DEFAULT 'reference';
  ALTER TABLE "header_menu_items" ADD COLUMN "new_tab" boolean DEFAULT false;
  -- Rows saved before "Link to" existed keep their URL as a custom link.
  UPDATE "header_menu_items" SET "type" = 'custom';
  UPDATE "header_menu_items_submenu" SET "type" = 'custom';
  ALTER TABLE "header_menu_rels" ADD CONSTRAINT "header_menu_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menu_rels" ADD CONSTRAINT "header_menu_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menu_rels" ADD CONSTRAINT "header_menu_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menu_rels" ADD CONSTRAINT "header_menu_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_menu_rels_order_idx" ON "header_menu_rels" USING btree ("order");
  CREATE INDEX "header_menu_rels_parent_idx" ON "header_menu_rels" USING btree ("parent_id");
  CREATE INDEX "header_menu_rels_path_idx" ON "header_menu_rels" USING btree ("path");
  CREATE INDEX "header_menu_rels_pages_id_idx" ON "header_menu_rels" USING btree ("pages_id");
  CREATE INDEX "header_menu_rels_case_studies_id_idx" ON "header_menu_rels" USING btree ("case_studies_id");
  CREATE INDEX "header_menu_rels_insights_id_idx" ON "header_menu_rels" USING btree ("insights_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_menu_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "header_menu_rels" CASCADE;
  ALTER TABLE "header_menu_items_submenu" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "header_menu_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "header_menu_items_submenu" DROP COLUMN "type";
  ALTER TABLE "header_menu_items_submenu" DROP COLUMN "new_tab";
  ALTER TABLE "header_menu_items" DROP COLUMN "type";
  ALTER TABLE "header_menu_items" DROP COLUMN "new_tab";
  DROP TYPE "public"."enum_header_menu_items_submenu_type";
  DROP TYPE "public"."enum_header_menu_items_type";`)
}

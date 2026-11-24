import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Send us your enquiry',
  	"text" varchar DEFAULT 'Tell us what you need and attach any brief or document. We will get back to you shortly.',
  	"thanks_text" varchar DEFAULT 'Thank you! We have received your enquiry and sent a confirmation to your email.',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Send us your enquiry',
  	"text" varchar DEFAULT 'Tell us what you need and attach any brief or document. We will get back to you shortly.',
  	"thanks_text" varchar DEFAULT 'Thank you! We have received your enquiry and sent a confirmation to your email.',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Send us your enquiry' NOT NULL,
  	"text" varchar DEFAULT 'Tell us what you need and attach any brief or document. We will get back to you shortly.',
  	"thanks_text" varchar DEFAULT 'Thank you! We have received your enquiry and sent a confirmation to your email.',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_enquiry_form" ADD CONSTRAINT "pages_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD CONSTRAINT "_pages_v_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_enquiry_form" ADD CONSTRAINT "common_component_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_enquiry_form_order_idx" ON "pages_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_enquiry_form_parent_id_idx" ON "pages_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_enquiry_form_path_idx" ON "pages_blocks_enquiry_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_enquiry_form_order_idx" ON "_pages_v_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_enquiry_form_parent_id_idx" ON "_pages_v_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_enquiry_form_path_idx" ON "_pages_v_blocks_enquiry_form" USING btree ("_path");
  CREATE INDEX "common_component_blocks_enquiry_form_order_idx" ON "common_component_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "common_component_blocks_enquiry_form_parent_id_idx" ON "common_component_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_enquiry_form_path_idx" ON "common_component_blocks_enquiry_form" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_enquiry_form" CASCADE;
  DROP TABLE "_pages_v_blocks_enquiry_form" CASCADE;
  DROP TABLE "common_component_blocks_enquiry_form" CASCADE;`)
}

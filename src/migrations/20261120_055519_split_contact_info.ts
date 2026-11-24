import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_contact_info_phones_icon" AS ENUM('whatsapp', 'in', 'us', 'au', 'phone', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_info_phones_icon" AS ENUM('whatsapp', 'in', 'us', 'au', 'phone', 'none');
  CREATE TYPE "public"."enum_common_component_blocks_contact_info_phones_icon" AS ENUM('whatsapp', 'in', 'us', 'au', 'phone', 'none');
  CREATE TABLE "pages_blocks_contact_info_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"icon" "enum_pages_blocks_contact_info_phones_icon" DEFAULT 'phone'
  );
  
  CREATE TABLE "pages_blocks_contact_info_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Contact Us',
  	"is_page_heading" boolean DEFAULT false,
  	"show_breadcrumb" boolean DEFAULT false,
  	"text" varchar DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.',
  	"email_label" varchar DEFAULT 'Email',
  	"email" varchar DEFAULT 'sales@q3tech.com',
  	"phones_label" varchar DEFAULT 'Call Us',
  	"next_heading" varchar DEFAULT 'What Happens Next?',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_info_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"icon" "enum__pages_v_blocks_contact_info_phones_icon" DEFAULT 'phone',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_info_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Contact Us',
  	"is_page_heading" boolean DEFAULT false,
  	"show_breadcrumb" boolean DEFAULT false,
  	"text" varchar DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.',
  	"email_label" varchar DEFAULT 'Email',
  	"email" varchar DEFAULT 'sales@q3tech.com',
  	"phones_label" varchar DEFAULT 'Call Us',
  	"next_heading" varchar DEFAULT 'What Happens Next?',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_contact_info_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"icon" "enum_common_component_blocks_contact_info_phones_icon" DEFAULT 'phone'
  );
  
  CREATE TABLE "common_component_blocks_contact_info_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "common_component_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Contact Us' NOT NULL,
  	"is_page_heading" boolean DEFAULT false,
  	"show_breadcrumb" boolean DEFAULT false,
  	"text" varchar DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.',
  	"email_label" varchar DEFAULT 'Email',
  	"email" varchar DEFAULT 'sales@q3tech.com',
  	"phones_label" varchar DEFAULT 'Call Us',
  	"next_heading" varchar DEFAULT 'What Happens Next?',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_enquiry_form_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_enquiry_form_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_enquiry_form_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_enquiry_form_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_enquiry_form_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_enquiry_form_next_steps" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_enquiry_form_phones" CASCADE;
  DROP TABLE "pages_blocks_enquiry_form_next_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_enquiry_form_phones" CASCADE;
  DROP TABLE "_pages_v_blocks_enquiry_form_next_steps" CASCADE;
  DROP TABLE "common_component_blocks_enquiry_form_phones" CASCADE;
  DROP TABLE "common_component_blocks_enquiry_form_next_steps" CASCADE;
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "heading" DROP DEFAULT;
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "heading" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "heading" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contact_info_phones" ADD CONSTRAINT "pages_blocks_contact_info_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_info_next_steps" ADD CONSTRAINT "pages_blocks_contact_info_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_info" ADD CONSTRAINT "pages_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info_phones" ADD CONSTRAINT "_pages_v_blocks_contact_info_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info_next_steps" ADD CONSTRAINT "_pages_v_blocks_contact_info_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info" ADD CONSTRAINT "_pages_v_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_contact_info_phones" ADD CONSTRAINT "common_component_blocks_contact_info_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_contact_info_next_steps" ADD CONSTRAINT "common_component_blocks_contact_info_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_contact_info" ADD CONSTRAINT "common_component_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_contact_info_phones_order_idx" ON "pages_blocks_contact_info_phones" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_info_phones_parent_id_idx" ON "pages_blocks_contact_info_phones" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_info_next_steps_order_idx" ON "pages_blocks_contact_info_next_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_info_next_steps_parent_id_idx" ON "pages_blocks_contact_info_next_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_info_order_idx" ON "pages_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_info_parent_id_idx" ON "pages_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_info_path_idx" ON "pages_blocks_contact_info" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_info_phones_order_idx" ON "_pages_v_blocks_contact_info_phones" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_info_phones_parent_id_idx" ON "_pages_v_blocks_contact_info_phones" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_next_steps_order_idx" ON "_pages_v_blocks_contact_info_next_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_info_next_steps_parent_id_idx" ON "_pages_v_blocks_contact_info_next_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_order_idx" ON "_pages_v_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_info_parent_id_idx" ON "_pages_v_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_path_idx" ON "_pages_v_blocks_contact_info" USING btree ("_path");
  CREATE INDEX "common_component_blocks_contact_info_phones_order_idx" ON "common_component_blocks_contact_info_phones" USING btree ("_order");
  CREATE INDEX "common_component_blocks_contact_info_phones_parent_id_idx" ON "common_component_blocks_contact_info_phones" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_contact_info_next_steps_order_idx" ON "common_component_blocks_contact_info_next_steps" USING btree ("_order");
  CREATE INDEX "common_component_blocks_contact_info_next_steps_parent_id_idx" ON "common_component_blocks_contact_info_next_steps" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_contact_info_order_idx" ON "common_component_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "common_component_blocks_contact_info_parent_id_idx" ON "common_component_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_contact_info_path_idx" ON "common_component_blocks_contact_info" USING btree ("_path");
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "is_page_heading";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "show_breadcrumb";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "email_label";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "email";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "phones_label";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "next_heading";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "is_page_heading";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "show_breadcrumb";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "email_label";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "email";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "phones_label";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "next_heading";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "is_page_heading";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "show_breadcrumb";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "email_label";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "email";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "phones_label";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "next_heading";
  DROP TYPE "public"."enum_pages_blocks_enquiry_form_phones_icon";
  DROP TYPE "public"."enum__pages_v_blocks_enquiry_form_phones_icon";
  DROP TYPE "public"."enum_common_component_blocks_enquiry_form_phones_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_enquiry_form_phones_icon" AS ENUM('whatsapp', 'in', 'us', 'au', 'phone', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_enquiry_form_phones_icon" AS ENUM('whatsapp', 'in', 'us', 'au', 'phone', 'none');
  CREATE TYPE "public"."enum_common_component_blocks_enquiry_form_phones_icon" AS ENUM('whatsapp', 'in', 'us', 'au', 'phone', 'none');
  CREATE TABLE "pages_blocks_enquiry_form_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"icon" "enum_pages_blocks_enquiry_form_phones_icon" DEFAULT 'phone'
  );
  
  CREATE TABLE "pages_blocks_enquiry_form_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_enquiry_form_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"icon" "enum__pages_v_blocks_enquiry_form_phones_icon" DEFAULT 'phone',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_enquiry_form_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "common_component_blocks_enquiry_form_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"icon" "enum_common_component_blocks_enquiry_form_phones_icon" DEFAULT 'phone'
  );
  
  CREATE TABLE "common_component_blocks_enquiry_form_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  ALTER TABLE "pages_blocks_contact_info_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_info_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_info_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_info_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_contact_info_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_contact_info_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_contact_info_phones" CASCADE;
  DROP TABLE "pages_blocks_contact_info_next_steps" CASCADE;
  DROP TABLE "pages_blocks_contact_info" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_info_phones" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_info_next_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_info" CASCADE;
  DROP TABLE "common_component_blocks_contact_info_phones" CASCADE;
  DROP TABLE "common_component_blocks_contact_info_next_steps" CASCADE;
  DROP TABLE "common_component_blocks_contact_info" CASCADE;
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Contact Us';
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Contact Us';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Contact Us';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "is_page_heading" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "show_breadcrumb" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "email_label" varchar DEFAULT 'Email';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "email" varchar DEFAULT 'sales@q3tech.com';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "phones_label" varchar DEFAULT 'Call Us';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "next_heading" varchar DEFAULT 'What Happens Next?';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "is_page_heading" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "show_breadcrumb" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "email_label" varchar DEFAULT 'Email';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "email" varchar DEFAULT 'sales@q3tech.com';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "phones_label" varchar DEFAULT 'Call Us';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "next_heading" varchar DEFAULT 'What Happens Next?';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "is_page_heading" boolean DEFAULT false;
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "show_breadcrumb" boolean DEFAULT false;
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "email_label" varchar DEFAULT 'Email';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "email" varchar DEFAULT 'sales@q3tech.com';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "phones_label" varchar DEFAULT 'Call Us';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "next_heading" varchar DEFAULT 'What Happens Next?';
  ALTER TABLE "pages_blocks_enquiry_form_phones" ADD CONSTRAINT "pages_blocks_enquiry_form_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_enquiry_form_next_steps" ADD CONSTRAINT "pages_blocks_enquiry_form_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_enquiry_form_phones" ADD CONSTRAINT "_pages_v_blocks_enquiry_form_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_enquiry_form_next_steps" ADD CONSTRAINT "_pages_v_blocks_enquiry_form_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_enquiry_form_phones" ADD CONSTRAINT "common_component_blocks_enquiry_form_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_enquiry_form_next_steps" ADD CONSTRAINT "common_component_blocks_enquiry_form_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_enquiry_form_phones_order_idx" ON "pages_blocks_enquiry_form_phones" USING btree ("_order");
  CREATE INDEX "pages_blocks_enquiry_form_phones_parent_id_idx" ON "pages_blocks_enquiry_form_phones" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_enquiry_form_next_steps_order_idx" ON "pages_blocks_enquiry_form_next_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_enquiry_form_next_steps_parent_id_idx" ON "pages_blocks_enquiry_form_next_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_enquiry_form_phones_order_idx" ON "_pages_v_blocks_enquiry_form_phones" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_enquiry_form_phones_parent_id_idx" ON "_pages_v_blocks_enquiry_form_phones" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_enquiry_form_next_steps_order_idx" ON "_pages_v_blocks_enquiry_form_next_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_enquiry_form_next_steps_parent_id_idx" ON "_pages_v_blocks_enquiry_form_next_steps" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_enquiry_form_phones_order_idx" ON "common_component_blocks_enquiry_form_phones" USING btree ("_order");
  CREATE INDEX "common_component_blocks_enquiry_form_phones_parent_id_idx" ON "common_component_blocks_enquiry_form_phones" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_enquiry_form_next_steps_order_idx" ON "common_component_blocks_enquiry_form_next_steps" USING btree ("_order");
  CREATE INDEX "common_component_blocks_enquiry_form_next_steps_parent_id_idx" ON "common_component_blocks_enquiry_form_next_steps" USING btree ("_parent_id");
  DROP TYPE "public"."enum_pages_blocks_contact_info_phones_icon";
  DROP TYPE "public"."enum__pages_v_blocks_contact_info_phones_icon";
  DROP TYPE "public"."enum_common_component_blocks_contact_info_phones_icon";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
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
  
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Contact Us';
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'Our team will get back to you as soon as possible.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Contact Us';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'Our team will get back to you as soon as possible.';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Contact Us';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'Our team will get back to you as soon as possible.';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "is_page_heading" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "show_breadcrumb" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "email_label" varchar DEFAULT 'Email';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "email" varchar DEFAULT 'sales@q3tech.com';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "phones_label" varchar DEFAULT 'Call Us';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "next_heading" varchar DEFAULT 'What Happens Next?';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "submit_label" varchar DEFAULT 'Submit';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "privacy_url" varchar DEFAULT 'https://www.q3tech.com/privacy-policy/';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "secure_note" varchar DEFAULT 'Your information is secure and never shared with third parties.';
  ALTER TABLE "pages_blocks_enquiry_form" ADD COLUMN "thanks_heading" varchar DEFAULT 'Thanks, we''ve received your enquiry';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "is_page_heading" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "show_breadcrumb" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "email_label" varchar DEFAULT 'Email';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "email" varchar DEFAULT 'sales@q3tech.com';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "phones_label" varchar DEFAULT 'Call Us';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "next_heading" varchar DEFAULT 'What Happens Next?';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "submit_label" varchar DEFAULT 'Submit';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "privacy_url" varchar DEFAULT 'https://www.q3tech.com/privacy-policy/';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "secure_note" varchar DEFAULT 'Your information is secure and never shared with third parties.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD COLUMN "thanks_heading" varchar DEFAULT 'Thanks, we''ve received your enquiry';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "is_page_heading" boolean DEFAULT false;
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "show_breadcrumb" boolean DEFAULT false;
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "email_label" varchar DEFAULT 'Email';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "email" varchar DEFAULT 'sales@q3tech.com';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "phones_label" varchar DEFAULT 'Call Us';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "next_heading" varchar DEFAULT 'What Happens Next?';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "submit_label" varchar DEFAULT 'Submit';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "privacy_url" varchar DEFAULT 'https://www.q3tech.com/privacy-policy/';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "secure_note" varchar DEFAULT 'Your information is secure and never shared with third parties.';
  ALTER TABLE "common_component_blocks_enquiry_form" ADD COLUMN "thanks_heading" varchar DEFAULT 'Thanks, we''ve received your enquiry';
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
  CREATE INDEX "common_component_blocks_enquiry_form_next_steps_parent_id_idx" ON "common_component_blocks_enquiry_form_next_steps" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Send us your enquiry';
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Tell us what you need and attach any brief or document. We will get back to you shortly.';
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Send us your enquiry';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Tell us what you need and attach any brief or document. We will get back to you shortly.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "heading" SET DEFAULT 'Send us your enquiry';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" SET DEFAULT 'Tell us what you need and attach any brief or document. We will get back to you shortly.';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "is_page_heading";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "show_breadcrumb";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "email_label";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "email";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "phones_label";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "next_heading";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "submit_label";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "privacy_url";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "secure_note";
  ALTER TABLE "pages_blocks_enquiry_form" DROP COLUMN "thanks_heading";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "is_page_heading";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "show_breadcrumb";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "email_label";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "email";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "phones_label";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "next_heading";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "submit_label";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "privacy_url";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "secure_note";
  ALTER TABLE "_pages_v_blocks_enquiry_form" DROP COLUMN "thanks_heading";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "is_page_heading";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "show_breadcrumb";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "email_label";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "email";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "phones_label";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "next_heading";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "submit_label";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "privacy_url";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "secure_note";
  ALTER TABLE "common_component_blocks_enquiry_form" DROP COLUMN "thanks_heading";
  DROP TYPE "public"."enum_pages_blocks_enquiry_form_phones_icon";
  DROP TYPE "public"."enum__pages_v_blocks_enquiry_form_phones_icon";
  DROP TYPE "public"."enum_common_component_blocks_enquiry_form_phones_icon";`)
}

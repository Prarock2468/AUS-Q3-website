import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Country and State fields are no longer offered in Leads → Forms; their tables are dropped. Stop if a form uses one.
  const { rows } = await db.execute(sql`
    SELECT (SELECT count(*) FROM "forms_blocks_country") + (SELECT count(*) FROM "forms_blocks_state") AS n`)
  if (Number((rows[0] as { n?: number | string } | undefined)?.n) > 0) {
    throw new Error(
      'A form in Leads → Forms uses a Country or State field. Replace it with a Select field (same options), save, then migrate.',
    )
  }
  await db.execute(sql`
   CREATE TABLE "pages_blocks_form_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "common_component_blocks_form_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_phone" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"placeholder" varchar,
  	"error_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_date" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" timestamp(3) with time zone,
  	"error_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_file" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"accept" varchar DEFAULT '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp,.zip',
  	"max_size_mb" numeric DEFAULT 4,
  	"error_message" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "forms_blocks_country" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_state" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "thanks_heading" SET DEFAULT 'Thanks, we’ve received your enquiry';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "thanks_heading" SET DEFAULT 'Thanks, we’ve received your enquiry';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "thanks_heading" SET DEFAULT 'Thanks, we’ve received your enquiry';
  ALTER TABLE "forms_blocks_checkbox" ADD COLUMN "error_message" varchar;
  ALTER TABLE "forms_blocks_email" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_email" ADD COLUMN "error_message" varchar;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "error_message" varchar;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "error_message" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "error_message" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "error_message" varchar;
  ALTER TABLE "forms" ADD COLUMN "notify_to" varchar;
  ALTER TABLE "forms" ADD COLUMN "auto_reply" boolean DEFAULT true;
  ALTER TABLE "forms" ADD COLUMN "thanks_heading" varchar DEFAULT 'Thanks, we’ve received your enquiry';
  ALTER TABLE "forms" ADD COLUMN "show_consent" boolean DEFAULT true;
  ALTER TABLE "forms" ADD COLUMN "privacy_url" varchar DEFAULT 'https://www.q3tech.com/privacy-policy/';
  ALTER TABLE "forms" ADD COLUMN "show_captcha" boolean DEFAULT true;
  ALTER TABLE "forms" ADD COLUMN "secure_note" varchar DEFAULT 'Your information is secure and never shared with third parties.';
  ALTER TABLE "pages_blocks_form_section" ADD CONSTRAINT "pages_blocks_form_section_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_section" ADD CONSTRAINT "pages_blocks_form_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_section" ADD CONSTRAINT "_pages_v_blocks_form_section_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_section" ADD CONSTRAINT "_pages_v_blocks_form_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common_component_blocks_form_section" ADD CONSTRAINT "common_component_blocks_form_section_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "common_component_blocks_form_section" ADD CONSTRAINT "common_component_blocks_form_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_phone" ADD CONSTRAINT "forms_blocks_phone_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_date" ADD CONSTRAINT "forms_blocks_date_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_file" ADD CONSTRAINT "forms_blocks_file_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_form_section_order_idx" ON "pages_blocks_form_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_section_parent_id_idx" ON "pages_blocks_form_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_section_path_idx" ON "pages_blocks_form_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_section_form_idx" ON "pages_blocks_form_section" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_form_section_order_idx" ON "_pages_v_blocks_form_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_section_parent_id_idx" ON "_pages_v_blocks_form_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_section_path_idx" ON "_pages_v_blocks_form_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_section_form_idx" ON "_pages_v_blocks_form_section" USING btree ("form_id");
  CREATE INDEX "common_component_blocks_form_section_order_idx" ON "common_component_blocks_form_section" USING btree ("_order");
  CREATE INDEX "common_component_blocks_form_section_parent_id_idx" ON "common_component_blocks_form_section" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_form_section_path_idx" ON "common_component_blocks_form_section" USING btree ("_path");
  CREATE INDEX "common_component_blocks_form_section_form_idx" ON "common_component_blocks_form_section" USING btree ("form_id");
  CREATE INDEX "forms_blocks_phone_order_idx" ON "forms_blocks_phone" USING btree ("_order");
  CREATE INDEX "forms_blocks_phone_parent_id_idx" ON "forms_blocks_phone" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_phone_path_idx" ON "forms_blocks_phone" USING btree ("_path");
  CREATE INDEX "forms_blocks_date_order_idx" ON "forms_blocks_date" USING btree ("_order");
  CREATE INDEX "forms_blocks_date_parent_id_idx" ON "forms_blocks_date" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_date_path_idx" ON "forms_blocks_date" USING btree ("_path");
  CREATE INDEX "forms_blocks_file_order_idx" ON "forms_blocks_file" USING btree ("_order");
  CREATE INDEX "forms_blocks_file_parent_id_idx" ON "forms_blocks_file" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_file_path_idx" ON "forms_blocks_file" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_form_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_form_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "common_component_blocks_form_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_phone" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_date" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_file" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_form_section" CASCADE;
  DROP TABLE "_pages_v_blocks_form_section" CASCADE;
  DROP TABLE "common_component_blocks_form_section" CASCADE;
  DROP TABLE "forms_blocks_phone" CASCADE;
  DROP TABLE "forms_blocks_date" CASCADE;
  DROP TABLE "forms_blocks_file" CASCADE;
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "thanks_heading" SET DEFAULT 'Thanks, we''ve received your enquiry';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "thanks_heading" SET DEFAULT 'Thanks, we''ve received your enquiry';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "thanks_heading" SET DEFAULT 'Thanks, we''ve received your enquiry';
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  ALTER TABLE "forms_blocks_checkbox" DROP COLUMN "error_message";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "error_message";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "error_message";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "error_message";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "error_message";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "error_message";
  ALTER TABLE "forms" DROP COLUMN "notify_to";
  ALTER TABLE "forms" DROP COLUMN "auto_reply";
  ALTER TABLE "forms" DROP COLUMN "thanks_heading";
  ALTER TABLE "forms" DROP COLUMN "show_consent";
  ALTER TABLE "forms" DROP COLUMN "privacy_url";
  ALTER TABLE "forms" DROP COLUMN "show_captcha";
  ALTER TABLE "forms" DROP COLUMN "secure_note";`)
}

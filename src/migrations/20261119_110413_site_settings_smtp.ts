import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "form_emails_smtp_host" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_smtp_port" numeric DEFAULT 465;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_smtp_username" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_smtp_password" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_smtp_from_address" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_smtp_from_name" varchar DEFAULT 'Q3 Technologies Australia';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_smtp_host" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_smtp_port" numeric DEFAULT 465;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_smtp_username" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_smtp_password" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_smtp_from_address" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_smtp_from_name" varchar DEFAULT 'Q3 Technologies Australia';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "form_emails_smtp_host";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_smtp_port";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_smtp_username";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_smtp_password";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_smtp_from_address";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_smtp_from_name";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_smtp_host";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_smtp_port";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_smtp_username";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_smtp_password";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_smtp_from_address";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_smtp_from_name";`)
}

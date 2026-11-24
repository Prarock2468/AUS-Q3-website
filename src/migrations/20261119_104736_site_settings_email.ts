import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_notify_to" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_auto_reply" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_thanks_subject" varchar DEFAULT 'Thank you for contacting Q3 Technologies';
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_thanks_message" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_sign_off_name" varchar DEFAULT 'Q3 Technologies Sales Team';
  ALTER TABLE "site_settings" ADD COLUMN "form_emails_sign_off_email" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_notify_to" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_auto_reply" boolean DEFAULT true;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_thanks_subject" varchar DEFAULT 'Thank you for contacting Q3 Technologies';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_thanks_message" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_sign_off_name" varchar DEFAULT 'Q3 Technologies Sales Team';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_form_emails_sign_off_email" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'Thank you! We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'Thank you! We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "thanks_text" SET DEFAULT 'Thank you! We have received your enquiry and sent a confirmation to your email.';
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_notify_to";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_auto_reply";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_thanks_subject";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_thanks_message";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_sign_off_name";
  ALTER TABLE "site_settings" DROP COLUMN "form_emails_sign_off_email";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_notify_to";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_auto_reply";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_thanks_subject";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_thanks_message";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_sign_off_name";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_form_emails_sign_off_email";`)
}

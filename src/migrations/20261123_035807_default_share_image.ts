import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "default_share_image_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_default_share_image_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_share_image_id_media_id_fk" FOREIGN KEY ("default_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_default_share_image_id_media_id_fk" FOREIGN KEY ("version_default_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_default_share_image_idx" ON "site_settings" USING btree ("default_share_image_id");
  CREATE INDEX "_site_settings_v_version_version_default_share_image_idx" ON "_site_settings_v" USING btree ("version_default_share_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_default_share_image_id_media_id_fk";
  
  ALTER TABLE "_site_settings_v" DROP CONSTRAINT "_site_settings_v_version_default_share_image_id_media_id_fk";
  
  DROP INDEX "site_settings_default_share_image_idx";
  DROP INDEX "_site_settings_v_version_version_default_share_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "default_share_image_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_default_share_image_id";`)
}

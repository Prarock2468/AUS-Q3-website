import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "is_template_starter" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_is_template_starter" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "is_template_starter";
  ALTER TABLE "_pages_v" DROP COLUMN "version_is_template_starter";`)
}

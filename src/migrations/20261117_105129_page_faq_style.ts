import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_common_component_ref_faq_style" AS ENUM('home-faq', 'section', 'home');
  CREATE TYPE "public"."enum__pages_v_blocks_common_component_ref_faq_style" AS ENUM('home-faq', 'section', 'home');
  ALTER TABLE "pages_blocks_common_component_ref" ADD COLUMN "faq_style" "enum_pages_blocks_common_component_ref_faq_style";
  ALTER TABLE "_pages_v_blocks_common_component_ref" ADD COLUMN "faq_style" "enum__pages_v_blocks_common_component_ref_faq_style";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_common_component_ref" DROP COLUMN "faq_style";
  ALTER TABLE "_pages_v_blocks_common_component_ref" DROP COLUMN "faq_style";
  DROP TYPE "public"."enum_pages_blocks_common_component_ref_faq_style";
  DROP TYPE "public"."enum__pages_v_blocks_common_component_ref_faq_style";`)
}

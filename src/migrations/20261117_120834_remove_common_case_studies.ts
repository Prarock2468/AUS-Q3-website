import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Removes the case studies slider from Common Component entries (pages use the page builder "Case studies slider"
 * section instead). Stops, rather than silently deleting content, while any Common Component entry still has one.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const { rows } = await db.execute(sql`SELECT count(*)::int AS n FROM "common_component_blocks_case_studies_slider"`)
  if (Number((rows[0] as { n?: number } | undefined)?.n) > 0) {
    throw new Error(
      'A Common Component entry still has a Case studies slider. Before migrating, in the admin: replace on each page the ' +
        '"Common component (saved) → Case Studies Slider" section with a "Case studies slider" section (same case ' +
        'studies), publish, then delete the "Case Studies Slider" entry from Common Component.',
    )
  }
  await db.execute(sql`
   ALTER TABLE "common_component_blocks_case_studies_slider" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "common_component_blocks_case_studies_slider" CASCADE;
  ALTER TABLE "common_component_rels" DROP CONSTRAINT "common_component_rels_case_studies_fk";
  
  DROP INDEX "common_component_rels_case_studies_id_idx";
  ALTER TABLE "common_component_rels" DROP COLUMN "case_studies_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "common_component_blocks_case_studies_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Case Studies',
  	"limit" numeric DEFAULT 6,
  	"view_all_label" varchar DEFAULT 'View All',
  	"view_all_link" varchar DEFAULT '/case-studies',
  	"autoplay" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  ALTER TABLE "common_component_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "common_component_blocks_case_studies_slider" ADD CONSTRAINT "common_component_blocks_case_studies_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."common_component"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "common_component_blocks_case_studies_slider_order_idx" ON "common_component_blocks_case_studies_slider" USING btree ("_order");
  CREATE INDEX "common_component_blocks_case_studies_slider_parent_id_idx" ON "common_component_blocks_case_studies_slider" USING btree ("_parent_id");
  CREATE INDEX "common_component_blocks_case_studies_slider_path_idx" ON "common_component_blocks_case_studies_slider" USING btree ("_path");
  ALTER TABLE "common_component_rels" ADD CONSTRAINT "common_component_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "common_component_rels_case_studies_id_idx" ON "common_component_rels" USING btree ("case_studies_id");`)
}

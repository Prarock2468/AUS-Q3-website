import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Section descriptions and intros become inline rich text (bold, italic, underline, links): src/fields/inlineText.ts.
 * The existing plain text is kept, converted like src/fields/richTextValue.ts (textToRichText): one paragraph per
 * line, empty lines dropped. Down converts back to plain text (one line per paragraph; formatting and links dropped).
 */

/** Plain text → Lexical JSON (NULL for empty text). */
const TEXT_TO_LEXICAL = sql`
  CREATE OR REPLACE FUNCTION pg_temp.q3_text_to_lexical(t text) RETURNS jsonb LANGUAGE sql IMMUTABLE AS $fn$
    SELECT CASE WHEN t IS NULL OR btrim(t, E' \t\r\n') = '' THEN NULL ELSE jsonb_build_object('root', jsonb_build_object(
      'type', 'root', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
      'children', (
        SELECT coalesce(jsonb_agg(jsonb_build_object(
          'type', 'paragraph', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr', 'textFormat', 0, 'textStyle', '',
          'children', jsonb_build_array(jsonb_build_object(
            'type', 'text', 'text', line, 'format', 0, 'style', '', 'mode', 'normal', 'detail', 0, 'version', 1))
        ) ORDER BY n), '[]'::jsonb)
        FROM (SELECT btrim(l, E' \t\r') AS line, n FROM unnest(regexp_split_to_array(t, E'\n')) WITH ORDINALITY AS u(l, n)) s
        WHERE line <> ''
      ))) END
  $fn$;
`

/** Lexical JSON → plain text (one line per paragraph). */
const LEXICAL_TO_TEXT = sql`
  CREATE OR REPLACE FUNCTION pg_temp.q3_lexical_to_text(j jsonb) RETURNS text LANGUAGE sql IMMUTABLE AS $fn$
    SELECT CASE WHEN j IS NULL THEN NULL ELSE (
      SELECT string_agg((SELECT coalesce(string_agg(v #>> '{}', ''), '') FROM jsonb_path_query(p, 'strict $.**.text') AS v), E'\n' ORDER BY pn)
      FROM jsonb_array_elements(j -> 'root' -> 'children') WITH ORDINALITY AS pp(p, pn)
    ) END
  $fn$;
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(TEXT_TO_LEXICAL)
  await db.execute(sql`
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "intro" SET DEFAULT '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","textFormat":0,"textStyle":"","children":[{"type":"text","text":"Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.","format":0,"style":"","mode":"normal","detail":0,"version":1}]}]}}'::jsonb;
  ALTER TABLE "pages_blocks_contact_band" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contact_band" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "pages_blocks_contact_info" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contact_info" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "pages_blocks_contact_info" ALTER COLUMN "text" SET DEFAULT '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","textFormat":0,"textStyle":"","children":[{"type":"text","text":"Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.","format":0,"style":"","mode":"normal","detail":0,"version":1}]}]}}'::jsonb;
  ALTER TABLE "pages_blocks_form_section" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_form_section" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "pages_blocks_home_hero" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_home_hero" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "pages_blocks_home_services_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_home_services_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "pages_blocks_home_industries_industries" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_home_industries_industries" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "pages_blocks_services_list_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_services_list_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "pages_blocks_detail_hero" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_detail_hero" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "pages_blocks_about_story_milestones" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_about_story_milestones" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "pages_blocks_service_offerings_items" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_offerings_items" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "pages_blocks_service_offerings" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_offerings" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "pages_blocks_service_process_steps" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_process_steps" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "pages_blocks_service_process" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_process" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "intro" SET DEFAULT '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","textFormat":0,"textStyle":"","children":[{"type":"text","text":"Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.","format":0,"style":"","mode":"normal","detail":0,"version":1}]}]}}'::jsonb;
  ALTER TABLE "_pages_v_blocks_contact_band" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contact_band" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "_pages_v_blocks_contact_info" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contact_info" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "_pages_v_blocks_contact_info" ALTER COLUMN "text" SET DEFAULT '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","textFormat":0,"textStyle":"","children":[{"type":"text","text":"Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.","format":0,"style":"","mode":"normal","detail":0,"version":1}]}]}}'::jsonb;
  ALTER TABLE "_pages_v_blocks_form_section" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_form_section" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "_pages_v_blocks_home_hero" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_home_hero" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "_pages_v_blocks_home_services_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_home_services_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "_pages_v_blocks_home_industries_industries" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_home_industries_industries" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "_pages_v_blocks_services_list_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_services_list_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "_pages_v_blocks_detail_hero" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_detail_hero" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "_pages_v_blocks_about_story_milestones" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_about_story_milestones" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "_pages_v_blocks_service_offerings_items" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_offerings_items" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "_pages_v_blocks_service_offerings" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_offerings" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "_pages_v_blocks_service_process_steps" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_process_steps" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("description");
  ALTER TABLE "_pages_v_blocks_service_process" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_process" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "common_component_blocks_faq" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_faq" ALTER COLUMN "intro" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("intro");
  ALTER TABLE "common_component_blocks_faq" ALTER COLUMN "intro" SET DEFAULT '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","textFormat":0,"textStyle":"","children":[{"type":"text","text":"Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.","format":0,"style":"","mode":"normal","detail":0,"version":1}]}]}}'::jsonb;
  ALTER TABLE "common_component_blocks_contact_band" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_contact_band" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "common_component_blocks_contact_info" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_contact_info" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "common_component_blocks_contact_info" ALTER COLUMN "text" SET DEFAULT '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","textFormat":0,"textStyle":"","children":[{"type":"text","text":"Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.","format":0,"style":"","mode":"normal","detail":0,"version":1}]}]}}'::jsonb;
  ALTER TABLE "common_component_blocks_form_section" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_form_section" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" SET DATA TYPE jsonb USING pg_temp.q3_text_to_lexical("text");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(LEXICAL_TO_TEXT)
  await db.execute(sql`
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "intro" SET DEFAULT 'Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.';
  ALTER TABLE "pages_blocks_contact_band" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contact_band" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "pages_blocks_contact_info" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contact_info" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "pages_blocks_contact_info" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "pages_blocks_form_section" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_form_section" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "pages_blocks_enquiry_form" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "pages_blocks_home_hero" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_home_hero" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "pages_blocks_home_services_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_home_services_services" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "pages_blocks_home_industries_industries" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_home_industries_industries" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "pages_blocks_services_list_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_services_list_services" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "pages_blocks_detail_hero" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_detail_hero" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "pages_blocks_about_story_milestones" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_about_story_milestones" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "pages_blocks_service_offerings_items" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_offerings_items" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "pages_blocks_service_offerings" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_offerings" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "pages_blocks_service_process_steps" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_process_steps" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "pages_blocks_service_process" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "pages_blocks_service_process" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "intro" SET DEFAULT 'Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.';
  ALTER TABLE "_pages_v_blocks_contact_band" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contact_band" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "_pages_v_blocks_contact_info" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contact_info" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "_pages_v_blocks_contact_info" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "_pages_v_blocks_form_section" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_form_section" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "_pages_v_blocks_home_hero" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_home_hero" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "_pages_v_blocks_home_services_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_home_services_services" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "_pages_v_blocks_home_industries_industries" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_home_industries_industries" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "_pages_v_blocks_services_list_services" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_services_list_services" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "_pages_v_blocks_detail_hero" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_detail_hero" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "_pages_v_blocks_about_story_milestones" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_about_story_milestones" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "_pages_v_blocks_service_offerings_items" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_offerings_items" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "_pages_v_blocks_service_offerings" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_offerings" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "_pages_v_blocks_service_process_steps" ALTER COLUMN "description" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_process_steps" ALTER COLUMN "description" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("description");
  ALTER TABLE "_pages_v_blocks_service_process" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_service_process" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "common_component_blocks_faq" ALTER COLUMN "intro" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_faq" ALTER COLUMN "intro" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("intro");
  ALTER TABLE "common_component_blocks_faq" ALTER COLUMN "intro" SET DEFAULT 'Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.';
  ALTER TABLE "common_component_blocks_contact_band" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_contact_band" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "common_component_blocks_contact_info" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_contact_info" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "common_component_blocks_contact_info" ALTER COLUMN "text" SET DEFAULT 'Have a question, an idea, or an opportunity to discuss? Let us know how we can help, and we''ll be in touch soon.';
  ALTER TABLE "common_component_blocks_form_section" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_form_section" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" DROP DEFAULT;
  ALTER TABLE "common_component_blocks_enquiry_form" ALTER COLUMN "text" SET DATA TYPE varchar USING pg_temp.q3_lexical_to_text("text");`)
}

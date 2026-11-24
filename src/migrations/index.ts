import * as migration_20261112_053402_initial from './20261112_053402_initial';
import * as migration_20261112_071204_common_component from './20261112_071204_common_component';
import * as migration_20261112_071733_common_component_blocks from './20261112_071733_common_component_blocks';
import * as migration_20261112_083920_common_sections_on_pages from './20261112_083920_common_sections_on_pages';
import * as migration_20261112_110621_header_menu from './20261112_110621_header_menu';
import * as migration_20261116_043042_header_menu_links from './20261116_043042_header_menu_links';
import * as migration_20261116_044703_page_template_starter from './20261116_044703_page_template_starter';
import * as migration_20261117_104638_page_faqs from './20261117_104638_page_faqs';
import * as migration_20261117_105129_page_faq_style from './20261117_105129_page_faq_style';
import * as migration_20261117_120834_remove_common_case_studies from './20261117_120834_remove_common_case_studies';
import * as migration_20261117_134133_home_services_block from './20261117_134133_home_services_block';
import * as migration_20261117_151600_home_industries_block from './20261117_151600_home_industries_block';
import * as migration_20261117_153337_home_hero_block from './20261117_153337_home_hero_block';
import * as migration_20261118_050959_home_about_block from './20261118_050959_home_about_block';
import * as migration_20261118_053526_testimonials_collection from './20261118_053526_testimonials_collection';
import * as migration_20261118_062218_testimonials_in_slider from './20261118_062218_testimonials_in_slider';
import * as migration_20261118_063512_page_testimonials_section from './20261118_063512_page_testimonials_section';
import * as migration_20261119_045215_media_storage_fields from './20261119_045215_media_storage_fields';
import * as migration_20261119_082104_enquiry_form_block from './20261119_082104_enquiry_form_block';
import * as migration_20261119_104736_site_settings_email from './20261119_104736_site_settings_email';
import * as migration_20261119_110413_site_settings_smtp from './20261119_110413_site_settings_smtp';
import * as migration_20261120_050536_enquiry_form_contact_design from './20261120_050536_enquiry_form_contact_design';
import * as migration_20261120_055519_split_contact_info from './20261120_055519_split_contact_info';
import * as migration_20261120_112333_form_builder_fields from './20261120_112333_form_builder_fields';
import * as migration_20261123_035807_default_share_image from './20261123_035807_default_share_image';
import * as migration_20261123_051247_services_list_block from './20261123_051247_services_list_block';
import * as migration_20261123_061206_about_story_block from './20261123_061206_about_story_block';
import * as migration_20261123_091716_detail_hero_block from './20261123_091716_detail_hero_block';
import * as migration_20261123_151620_service_page_sections from './20261123_151620_service_page_sections';
import * as migration_20261124_042214_inline_rich_text from './20261124_042214_inline_rich_text';

export const migrations = [
  {
    up: migration_20261112_053402_initial.up,
    down: migration_20261112_053402_initial.down,
    name: '20261112_053402_initial',
  },
  {
    up: migration_20261112_071204_common_component.up,
    down: migration_20261112_071204_common_component.down,
    name: '20261112_071204_common_component',
  },
  {
    up: migration_20261112_071733_common_component_blocks.up,
    down: migration_20261112_071733_common_component_blocks.down,
    name: '20261112_071733_common_component_blocks',
  },
  {
    up: migration_20261112_083920_common_sections_on_pages.up,
    down: migration_20261112_083920_common_sections_on_pages.down,
    name: '20261112_083920_common_sections_on_pages',
  },
  {
    up: migration_20261112_110621_header_menu.up,
    down: migration_20261112_110621_header_menu.down,
    name: '20261112_110621_header_menu',
  },
  {
    up: migration_20261116_043042_header_menu_links.up,
    down: migration_20261116_043042_header_menu_links.down,
    name: '20261116_043042_header_menu_links',
  },
  {
    up: migration_20261116_044703_page_template_starter.up,
    down: migration_20261116_044703_page_template_starter.down,
    name: '20261116_044703_page_template_starter',
  },
  {
    up: migration_20261117_104638_page_faqs.up,
    down: migration_20261117_104638_page_faqs.down,
    name: '20261117_104638_page_faqs',
  },
  {
    up: migration_20261117_105129_page_faq_style.up,
    down: migration_20261117_105129_page_faq_style.down,
    name: '20261117_105129_page_faq_style',
  },
  {
    up: migration_20261117_120834_remove_common_case_studies.up,
    down: migration_20261117_120834_remove_common_case_studies.down,
    name: '20261117_120834_remove_common_case_studies',
  },
  {
    up: migration_20261117_134133_home_services_block.up,
    down: migration_20261117_134133_home_services_block.down,
    name: '20261117_134133_home_services_block',
  },
  {
    up: migration_20261117_151600_home_industries_block.up,
    down: migration_20261117_151600_home_industries_block.down,
    name: '20261117_151600_home_industries_block',
  },
  {
    up: migration_20261117_153337_home_hero_block.up,
    down: migration_20261117_153337_home_hero_block.down,
    name: '20261117_153337_home_hero_block',
  },
  {
    up: migration_20261118_050959_home_about_block.up,
    down: migration_20261118_050959_home_about_block.down,
    name: '20261118_050959_home_about_block',
  },
  {
    up: migration_20261118_053526_testimonials_collection.up,
    down: migration_20261118_053526_testimonials_collection.down,
    name: '20261118_053526_testimonials_collection',
  },
  {
    up: migration_20261118_062218_testimonials_in_slider.up,
    down: migration_20261118_062218_testimonials_in_slider.down,
    name: '20261118_062218_testimonials_in_slider',
  },
  {
    up: migration_20261118_063512_page_testimonials_section.up,
    down: migration_20261118_063512_page_testimonials_section.down,
    name: '20261118_063512_page_testimonials_section',
  },
  {
    up: migration_20261119_045215_media_storage_fields.up,
    down: migration_20261119_045215_media_storage_fields.down,
    name: '20261119_045215_media_storage_fields',
  },
  {
    up: migration_20261119_082104_enquiry_form_block.up,
    down: migration_20261119_082104_enquiry_form_block.down,
    name: '20261119_082104_enquiry_form_block',
  },
  {
    up: migration_20261119_104736_site_settings_email.up,
    down: migration_20261119_104736_site_settings_email.down,
    name: '20261119_104736_site_settings_email',
  },
  {
    up: migration_20261119_110413_site_settings_smtp.up,
    down: migration_20261119_110413_site_settings_smtp.down,
    name: '20261119_110413_site_settings_smtp',
  },
  {
    up: migration_20261120_050536_enquiry_form_contact_design.up,
    down: migration_20261120_050536_enquiry_form_contact_design.down,
    name: '20261120_050536_enquiry_form_contact_design',
  },
  {
    up: migration_20261120_055519_split_contact_info.up,
    down: migration_20261120_055519_split_contact_info.down,
    name: '20261120_055519_split_contact_info',
  },
  {
    up: migration_20261120_112333_form_builder_fields.up,
    down: migration_20261120_112333_form_builder_fields.down,
    name: '20261120_112333_form_builder_fields',
  },
  {
    up: migration_20261123_035807_default_share_image.up,
    down: migration_20261123_035807_default_share_image.down,
    name: '20261123_035807_default_share_image',
  },
  {
    up: migration_20261123_051247_services_list_block.up,
    down: migration_20261123_051247_services_list_block.down,
    name: '20261123_051247_services_list_block',
  },
  {
    up: migration_20261123_061206_about_story_block.up,
    down: migration_20261123_061206_about_story_block.down,
    name: '20261123_061206_about_story_block',
  },
  {
    up: migration_20261123_091716_detail_hero_block.up,
    down: migration_20261123_091716_detail_hero_block.down,
    name: '20261123_091716_detail_hero_block',
  },
  {
    up: migration_20261123_151620_service_page_sections.up,
    down: migration_20261123_151620_service_page_sections.down,
    name: '20261123_151620_service_page_sections',
  },
  {
    up: migration_20261124_042214_inline_rich_text.up,
    down: migration_20261124_042214_inline_rich_text.down,
    name: '20261124_042214_inline_rich_text'
  },
];

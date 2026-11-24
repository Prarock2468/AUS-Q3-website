import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'
import { buttonsField } from '../home/fields'

type PageData = { template?: string | null } | undefined

/** The Services overview design has no image or stats. */
const isOverview = (data: PageData) => data?.template === 'services'

/**
 * "Hero banner": the banner at the top of the Services page (/services), an industry page (/industries/…) and a
 * service page (/services/…). One set of fields, drawn in the design of the page's Template:
 *   Services overview → section.hero (heading lines, text, buttons; no image or stats)
 *   Industry detail   → section.ind-hero (text and buttons over a wide image; no stats)
 *   Service page      → section.hero#top (image beside the text, stats)
 * Rendered by src/components/sections/DetailHero.tsx.
 */
export const DetailHeroBlock: Block = {
  slug: 'detailHero',
  interfaceName: 'DetailHeroBlock',
  labels: { singular: 'Hero banner', plural: 'Hero banners' },
  fields: [
    {
      name: 'title',
      type: 'textarea',
      required: true,
      admin: { rows: 2, description: 'The page heading (H1). Press Enter to start a new line.' },
    },
    {
      name: 'breadcrumbLabel',
      label: 'Breadcrumb name',
      type: 'text',
      admin: {
        description:
          'Last item of the breadcrumb ("Home / …"). Leave empty to use the title. Usually a shorter name, e.g. Education or Services.',
      },
    },
    inlineText('description', { required: true }),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      // Needed by the Industry detail and Service page designs; on the Services page it is optional (the stylesheet
      // has a default background photo).
      validate: (value: unknown, { data }: { data?: PageData }) =>
        isOverview(data) || value ? true : 'Add an image (needed by this page’s design).',
      admin: {
        description:
          'Services page: background photo, about 1920 × 1080 (leave empty for the default). Industry page: about 1344 × 600. Service page: about 1440 × 880, beside the text. Set the image’s Alt text in Media.',
      },
    },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Stat', plural: 'Stats' },
      admin: {
        condition: (data) => !isOverview(data as PageData),
        description: 'Service pages only (the Industry page design has no stats).',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, admin: { width: '25%', description: 'e.g. 2000' } },
            { name: 'suffix', type: 'text', admin: { width: '15%', description: 'e.g. + or %' } },
            { name: 'label', type: 'text', required: true, admin: { width: '60%', description: 'e.g. Projects Deployed' } },
          ],
        },
      ],
    },
    buttonsField(),
  ],
}

import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'

/**
 * "Industries We Serve" on the home page: one tab per industry, each with its image, text and link.
 * Rendered by components/homeComponent/HomeIndustries.tsx.
 */
export const HomeIndustriesBlock: Block = {
  slug: 'homeIndustries',
  interfaceName: 'HomeIndustriesBlock',
  labels: { singular: 'Industries we serve (home page)', plural: 'Industries we serve (home page)' },
  fields: [
    { name: 'heading', type: 'text', required: true, defaultValue: 'Industries We Serve' },
    {
      type: 'row',
      fields: [
        { name: 'viewAllLabel', label: 'View all button text', type: 'text', defaultValue: 'View all', admin: { width: '50%' } },
        {
          name: 'viewAllLink',
          label: 'View all button link',
          type: 'text',
          defaultValue: '/industries',
          admin: { width: '50%', description: 'Leave empty to hide the button.' },
        },
      ],
    },
    {
      name: 'industries',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Industry', plural: 'Industries' },
      admin: {
        initCollapsed: true,
        description: 'One tab each, in this order. The first one starts selected.',
        components: { RowLabel: './fields/HomeIndustriesRowLabel#HomeIndustriesRowLabel' },
      },
      fields: [
        { name: 'title', type: 'text', required: true, admin: { description: 'Tab label and heading, for example "Education".' } },
        inlineText('description', { required: true }),
        {
          type: 'row',
          fields: [
            { name: 'linkLabel', label: 'Link text', type: 'text', defaultValue: 'Know More', admin: { width: '50%' } },
            {
              name: 'link',
              type: 'text',
              admin: { width: '50%', description: 'For example /industries/education. Leave empty to hide the button.' },
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Fills the card beside the text (cropped to fit). About 1200px wide.' },
        },
      ],
    },
  ],
}

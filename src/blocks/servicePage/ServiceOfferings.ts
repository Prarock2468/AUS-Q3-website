import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'

/**
 * "Services offered (Service page)": the numbered list of what a service covers ("Our Full-Spectrum AI Development
 * Services"); each item opens to show its text and an optional button. Rendered by
 * src/components/sections/ServicePageSections.tsx (ServiceOfferings); service.min.js opens the items on scroll.
 */
export const ServiceOfferingsBlock: Block = {
  slug: 'serviceOfferings',
  interfaceName: 'ServiceOfferingsBlock',
  labels: { singular: 'Services offered (Service page)', plural: 'Services offered (Service page)' },
  fields: [
    { name: 'heading', type: 'textarea', required: true, admin: { rows: 2, description: 'Press Enter to start a new line.' } },
    inlineText('intro'),
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Service', plural: 'Services' },
      admin: {
        initCollapsed: true,
        description: 'Numbered 01, 02… in this order. The first one starts open.',
        components: { RowLabel: './fields/TitleRowLabel#TitleRowLabel' },
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        inlineText('description', { required: true }),
        {
          type: 'row',
          fields: [
            { name: 'buttonLabel', label: 'Button text', type: 'text', defaultValue: 'Explore More', admin: { width: '40%' } },
            { name: 'buttonLink', label: 'Button link', type: 'text', admin: { width: '60%', description: 'Leave empty to hide the button.' } },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Background of the open item, about 600 × 374. Leave empty for the default.' },
        },
      ],
    },
  ],
}

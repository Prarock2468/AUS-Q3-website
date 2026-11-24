import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'

/**
 * "Our Services" on the Services page: the numbered list of service areas; each opens to show its image, text,
 * sub-service pills (optionally linked) and a button, with the images beside the list.
 * Rendered by src/components/sections/ServicesList.tsx (markup driven by /js/templates/services.min.js).
 */
export const ServicesListBlock: Block = {
  slug: 'servicesList',
  interfaceName: 'ServicesListBlock',
  labels: { singular: 'Our services (Services page)', plural: 'Our services (Services page)' },
  fields: [
    { name: 'heading', type: 'text', required: true, defaultValue: 'Our Services' },
    {
      name: 'services',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Service', plural: 'Services' },
      admin: {
        initCollapsed: true,
        description: 'Numbered 01, 02… in this order. The first one starts open.',
        components: { RowLabel: './fields/HomeServicesRowLabel#HomeServicesRowLabel' },
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        inlineText('description', { required: true }),
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Portrait, about 760 × 1086. Shown in the open service and in the image column.' },
        },
        {
          name: 'subServices',
          label: 'Sub-services (pills)',
          type: 'array',
          labels: { singular: 'Sub-service', plural: 'Sub-services' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'url', label: 'Link (optional)', type: 'text', admin: { width: '50%', description: 'Leave empty for a plain pill.' } },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'buttonLabel', label: 'Button text', type: 'text', defaultValue: 'Explore More', admin: { width: '50%' } },
            { name: 'buttonLink', label: 'Button link', type: 'text', admin: { width: '50%', description: 'Leave empty to hide the button.' } },
          ],
        },
      ],
    },
  ],
}

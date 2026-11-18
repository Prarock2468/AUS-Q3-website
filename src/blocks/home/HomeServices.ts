import type { Block } from 'payload'

/**
 * "Our Services" on the home page: service areas in an accordion, each with its image, link and sub-services.
 * Rendered by components/homeComponent/HomeServices.tsx.
 */
export const HomeServicesBlock: Block = {
  slug: 'homeServices',
  interfaceName: 'HomeServicesBlock',
  labels: { singular: 'Our services (home page)', plural: 'Our services (home page)' },
  fields: [
    { name: 'heading', type: 'text', required: true, defaultValue: 'Our Services' },
    {
      type: 'row',
      fields: [
        { name: 'viewAllLabel', label: 'View all button text', type: 'text', defaultValue: 'View All', admin: { width: '50%' } },
        {
          name: 'viewAllLink',
          label: 'View all button link',
          type: 'text',
          defaultValue: '/services',
          admin: { width: '50%', description: 'Leave empty to hide the button.' },
        },
      ],
    },
    {
      name: 'services',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Service', plural: 'Services' },
      admin: {
        initCollapsed: true,
        description: 'Shown as an accordion, in this order. The first one starts open; each one’s image shows while it is open.',
        components: { RowLabel: './fields/HomeServicesRowLabel#HomeServicesRowLabel' },
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        {
          type: 'row',
          fields: [
            { name: 'linkLabel', label: 'Link text', type: 'text', admin: { width: '50%', description: 'For example "Explore AI Services".' } },
            { name: 'link', type: 'text', admin: { width: '50%', description: 'For example /services/ai-solutions-development.' } },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Shown beside the list while this service is open. Portrait, about 760 × 1086.' },
        },
        {
          name: 'subServices',
          label: 'Sub-services',
          type: 'array',
          labels: { singular: 'Sub-service', plural: 'Sub-services' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'url', label: 'Link', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },
  ],
}

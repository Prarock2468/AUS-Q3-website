import type { Block } from 'payload'

/** Scrolling strip of client logos. Rendered by components/commonComponent/ClientLogos.tsx. */
export const ClientLogosBlock: Block = {
  slug: 'clientLogos',
  interfaceName: 'ClientLogosBlock',
  labels: { singular: 'Client logos', plural: 'Client logos' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Trusted By Global Brands' },
    {
      name: 'logos',
      type: 'array',
      labels: { singular: 'Logo', plural: 'Logos' },
      admin: { description: 'Shown in a scrolling strip, in this order.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%', description: 'Client name, used as alt text.' } },
            { name: 'url', label: 'Link (optional)', type: 'text', admin: { width: '50%' } },
          ],
        },
        { name: 'logo', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}

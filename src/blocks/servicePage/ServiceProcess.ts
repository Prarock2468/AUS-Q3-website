import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'

/**
 * "Delivery process (Service page)": the numbered steps that scroll sideways ("Our AI Solutions Delivery
 * Framework"); hovering a step shows its image. Rendered by src/components/sections/ServicePageSections.tsx
 * (ServiceProcess); service.min.js scrolls the row and highlights the steps.
 */
export const ServiceProcessBlock: Block = {
  slug: 'serviceProcess',
  interfaceName: 'ServiceProcessBlock',
  labels: { singular: 'Delivery process (Service page)', plural: 'Delivery process (Service page)' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    inlineText('intro'),
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Step', plural: 'Steps' },
      admin: {
        initCollapsed: true,
        description: 'Numbered 1, 2… in this order.',
        components: { RowLabel: './fields/TitleRowLabel#TitleRowLabel' },
      },
      fields: [
        {
          name: 'title',
          type: 'textarea',
          required: true,
          admin: { rows: 2, description: 'Press Enter for a line break (shown on large screens only).' },
        },
        inlineText('description', { required: true }),
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Shown when the visitor hovers the step, about 460 × 400.' },
        },
      ],
    },
  ],
}

import type { Block } from 'payload'
import { buttonsField } from './fields'

/**
 * "About Q3" on the home page: a statement that lights up word by word on scroll, buttons, and stat cards.
 * Rendered by components/homeComponent/HomeAbout.tsx.
 */
export const HomeAboutBlock: Block = {
  slug: 'homeAbout',
  interfaceName: 'HomeAboutBlock',
  labels: { singular: 'About us (home page)', plural: 'About us (home page)' },
  fields: [
    {
      name: 'statement',
      type: 'textarea',
      required: true,
      admin: { description: 'Plain text. Each word lights up in turn as the visitor scrolls.' },
    },
    buttonsField(),
    {
      name: 'stats',
      type: 'array',
      labels: { singular: 'Stat', plural: 'Stats' },
      admin: { description: 'Cards under the buttons, for example "25+ Years" / "of Industry Experience".' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, admin: { width: '40%', description: 'Big text, e.g. 2,000+' } },
            { name: 'label', type: 'text', required: true, admin: { width: '60%', description: 'e.g. Solutions Delivered' } },
          ],
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional, about 44 × 44 (PNG or WebP). Leave empty for the default award icon.' },
        },
      ],
    },
  ],
}

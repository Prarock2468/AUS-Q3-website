import type { Block } from 'payload'
import { buttonsField } from './fields'

/**
 * "About us (statement)": a statement that lights up word by word on scroll, buttons, and stat cards. Offered on the
 * Home and About templates, each in its own design: Home → components/homeComponent/HomeAbout.tsx ("About Q3"),
 * About → components/sections/AboutSections.tsx ("Q3 at a glance", no buttons).
 */
export const HomeAboutBlock: Block = {
  slug: 'homeAbout',
  interfaceName: 'HomeAboutBlock',
  labels: { singular: 'About us (statement)', plural: 'About us (statement)' },
  fields: [
    {
      name: 'statement',
      type: 'textarea',
      required: true,
      admin: { description: 'Plain text. Each word lights up in turn as the visitor scrolls.' },
    },
    { ...buttonsField(), admin: { description: 'Shown on the Home page only (the About page design has no buttons).' } },
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

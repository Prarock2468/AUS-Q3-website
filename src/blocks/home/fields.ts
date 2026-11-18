import type { ArrayField } from 'payload'

/** Field helpers shared by the home page blocks. */

/** Up to two buttons (text, link, filled or outline, optional analytics name). Used by the home hero and About us. */
export const buttonsField = (): ArrayField => ({
  name: 'buttons',
  type: 'array',
  maxRows: 2,
  labels: { singular: 'Button', plural: 'Buttons' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { width: '30%' } },
        { name: 'link', type: 'text', required: true, admin: { width: '30%' } },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Filled', value: 'primary' },
            { label: 'Outline', value: 'outline' },
          ],
          admin: { width: '20%' },
        },
        {
          name: 'trackingId',
          label: 'Tracking id',
          type: 'text',
          admin: { width: '20%', description: 'Optional analytics name (data-cta), e.g. hero_services.' },
        },
      ],
    },
  ],
})

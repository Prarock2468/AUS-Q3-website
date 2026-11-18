import type { Block } from 'payload'

/** Contact form band. */
export const ContactBand: Block = {
  slug: 'contactBand',
  labels: { singular: 'Contact form band', plural: 'Contact form bands' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    {
      name: 'thanksText',
      type: 'text',
      defaultValue: 'Our Australian team will reply within 4 business hours (AEST).',
      admin: { description: 'Shown after the form is sent.' },
    },
    { name: 'anchorId', type: 'text', admin: { description: 'Optional id, for example "contact", so links can jump here.' } },
  ],
}

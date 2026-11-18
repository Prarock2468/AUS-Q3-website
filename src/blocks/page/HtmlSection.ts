import type { Block } from 'payload'
import { adminFieldOnly } from '../../access'

/** Raw HTML section migrated from the original site. */
export const HtmlSection: Block = {
  slug: 'htmlSection',
  labels: { singular: 'Custom section (HTML)', plural: 'Custom sections (HTML)' },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Name shown in the page builder, for example "Hero" or "Our process".' },
    },
    {
      name: 'html',
      type: 'code',
      required: true,
      // Raw HTML is published exactly as typed (scripts included), so only admins may write it.
      access: { create: adminFieldOnly, update: adminFieldOnly },
      admin: {
        language: 'html',
        description:
          'Section markup migrated from the original site. Edit text carefully and keep the class names, they drive the design. Admins only.',
      },
    },
  ],
}

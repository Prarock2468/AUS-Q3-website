import type { Block } from 'payload'
import { simpleEditor } from '../../lexical'
import { FAQ_STYLES } from '../shared'

/**
 * Places a saved Common Component entry on a page, so one edit updates every page that uses it.
 * Rendered by components/commonComponent/SavedCommonComponent.tsx.
 */
export const CommonComponentRef: Block = {
  slug: 'commonComponentRef',
  interfaceName: 'CommonComponentRefBlock',
  labels: { singular: 'Common component (saved)', plural: 'Common components (saved)' },
  fields: [
    {
      name: 'component',
      type: 'relationship',
      relationTo: 'commonComponent',
      required: true,
      admin: {
        description:
          'Pick a saved entry from Common Component. For content only this page uses, add a Client logos section instead. For testimonials, add a Testimonials section (pick which ones this page shows); for case studies, a Case studies slider section.',
      },
    },
    {
      name: 'faqs',
      label: 'FAQs for this page',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      admin: {
        description:
          'Optional. These questions show instead of the saved ones, in this order, on this page only (heading, style and layout stay as saved). Leave empty to show the saved FAQ. Also published as FAQPage structured data.',
        initCollapsed: true,
        // Only shown when the picked entry contains an FAQ.
        components: { Field: './fields/RefSectionField#RefFaqsField' },
      },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', editor: simpleEditor, required: true },
      ],
    },
    {
      name: 'faqStyle',
      label: 'FAQ style for this page',
      type: 'select',
      options: [...FAQ_STYLES],
      admin: {
        description: 'Optional. Leave empty to use the saved FAQ’s style.',
        // Only shown when the picked entry contains an FAQ.
        components: { Field: './fields/RefSectionField#RefFaqStyleField' },
      },
    },
    { name: 'anchorId', type: 'text', admin: { description: 'Optional id, for example "clients", so links can jump here.' } },
  ],
}

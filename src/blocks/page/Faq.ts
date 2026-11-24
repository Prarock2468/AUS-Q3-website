import type { Block } from 'payload'
import { inlineText } from '../../fields/inlineText'
import { textToRichText } from '../../fields/richTextValue'
import { simpleEditor } from '../../lexical'
import { FAQ_STYLES } from '../shared'

/** FAQ accordion, also published as FAQPage structured data. */
export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Frequently asked questions', admin: { width: '60%' } },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'home-faq',
          options: [...FAQ_STYLES],
          admin: { width: '40%' },
        },
      ],
    },
    inlineText('intro', {
      defaultValue: textToRichText(
        'Find quick answers to the most commonly asked questions about our services, process, pricing, timelines, and support.',
      ) ?? undefined,
    }),
    { name: 'showSalesContact', type: 'checkbox', defaultValue: true, label: 'Show "Schedule a call" card' },
    {
      name: 'items',
      type: 'array',
      required: true,
      labels: { singular: 'Question', plural: 'Questions' },
      admin: { description: 'Published as FAQPage structured data for Google and AI search.' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', editor: simpleEditor, required: true },
      ],
    },
  ],
}

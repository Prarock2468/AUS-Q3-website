import type { CollectionConfig } from 'payload'
import { loggedIn, publishGate, publishedOrLoggedIn } from '../access'
import { seoExtras, slugField, sortOrderField } from '../fields/common'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate'
import { articleEditor, simpleEditor } from '../lexical'

export const INSIGHT_INDUSTRIES = [
  { label: 'Education', value: 'education' },
  { label: 'Banking and Finance', value: 'finance' },
  { label: 'Healthcare and Life Sciences', value: 'healthcare' },
]

export const INSIGHT_SERVICES = [
  { label: 'AI Development Services', value: 'ai' },
  { label: 'Custom Software Development', value: 'software' },
  { label: 'UI/UX Design', value: 'design' },
  { label: 'Microsoft Solutions', value: 'microsoft' },
  { label: 'Managed IT Services', value: 'managed-it' },
  { label: 'Cybersecurity Services', value: 'security' },
]

export const Insights: CollectionConfig = {
  slug: 'insights',
  labels: { singular: 'Insight', plural: 'Insights' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', '_status', 'publishedDate'],
    description: 'Blog articles. Each entry becomes a page at /insights/<slug>.',
    livePreview: { url: ({ data }) => `/preview?path=/insights/${data?.slug ?? ''}` },
    preview: (doc) => `/preview?path=/insights/${doc?.slug ?? ''}`,
  },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 50 },
  hooks: {
    beforeChange: [publishGate],
    afterChange: [revalidateOnChange],
    afterDelete: [revalidateOnDelete],
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Article',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'summary',
              label: 'Quick summary',
              type: 'textarea',
              admin: { description: 'Shown in the "Quick Summary" box and used in site search.' },
            },
            {
              name: 'body',
              type: 'richText',
              editor: articleEditor,
              admin: { description: 'Every H2 gets an anchor and appears in the table of contents automatically.' },
            },
            { name: 'faqHeading', label: 'FAQ heading', type: 'text', defaultValue: 'FAQs' },
            {
              name: 'faqs',
              label: 'FAQs',
              type: 'array',
              labels: { singular: 'FAQ', plural: 'FAQs' },
              admin: { description: 'Shown at the end of the article and published as FAQPage structured data for Google and AI search.' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'richText', editor: simpleEditor, required: true },
              ],
            },
          ],
        },
        {
          label: 'Card and filters',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'coverImage', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
                {
                  name: 'cardImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%', description: 'Leave empty to use the cover image.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'category', type: 'text', required: true, admin: { width: '50%', description: 'Tag on the card, for example "AI".' } },
                { name: 'readTime', type: 'text', admin: { width: '25%', description: 'For example "12 min read".' } },
                {
                  name: 'topic',
                  type: 'text',
                  admin: { width: '25%', description: 'Short key used by the list filter, for example "ai".' },
                },
              ],
            },
            { name: 'industries', type: 'select', hasMany: true, options: INSIGHT_INDUSTRIES },
            { name: 'serviceAreas', label: 'Services', type: 'select', hasMany: true, options: INSIGHT_SERVICES },
            {
              name: 'related',
              label: 'More insights',
              type: 'relationship',
              relationTo: 'insights',
              hasMany: true,
              maxRows: 3,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
              admin: { description: 'Leave empty to show the latest articles automatically.' },
            },
          ],
        },
        { label: 'Advanced SEO', fields: [seoExtras] },
      ],
    },
    { name: 'author', type: 'relationship', relationTo: 'authors', admin: { position: 'sidebar' } },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
    },
    slugField(),
    sortOrderField,
  ],
}

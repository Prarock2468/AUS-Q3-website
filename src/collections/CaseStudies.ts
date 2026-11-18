import type { CollectionConfig } from 'payload'
import { loggedIn, publishGate, publishedOrLoggedIn } from '../access'
import { seoExtras, slugField, sortOrderField } from '../fields/common'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate'
import { simpleEditor } from '../lexical'

export const CASE_STUDY_FILTERS = [
  { label: 'AI', value: 'ai' },
  { label: 'Modernisation', value: 'modernisation' },
  { label: 'Data', value: 'data' },
  { label: 'Software', value: 'software' },
  { label: 'Security', value: 'security' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Banking and Finance', value: 'finance' },
  { label: 'Education', value: 'education' },
  { label: 'Retail', value: 'retail' },
  { label: 'Logistics', value: 'logistics' },
  { label: 'Energy', value: 'energy' },
  { label: 'Manufacturing', value: 'manufacturing' },
]

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Case study', plural: 'Case studies' },
  admin: {
    group: 'Content',
    useAsTitle: 'cardTitle',
    defaultColumns: ['cardTitle', 'cardTag', '_status', 'updatedAt'],
    description: 'Each entry becomes a page at /case-studies/<slug> and a card on the Case Studies list.',
    livePreview: { url: ({ data }) => `/preview?path=/case-studies/${data?.slug ?? ''}` },
    preview: (doc) => `/preview?path=/case-studies/${doc?.slug ?? ''}`,
  },
  access: {
    read: publishedOrLoggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
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
          label: 'Card and hero',
          fields: [
            { name: 'title', label: 'Page heading (H1)', type: 'textarea', required: true },
            {
              name: 'cardTitle',
              label: 'Short title',
              type: 'text',
              required: true,
              admin: { description: 'Used on cards, in the breadcrumb and in site search.' },
            },
            {
              name: 'summary',
              type: 'textarea',
              admin: { description: 'One or two sentences. Used in site search and as the default meta description.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'industry', type: 'text', admin: { width: '50%' } },
                { name: 'services', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'cardTag',
              type: 'text',
              admin: { description: 'Label on the card image, for example "Healthcare, AI".' },
            },
            {
              name: 'filters',
              type: 'select',
              hasMany: true,
              options: CASE_STUDY_FILTERS,
              admin: { description: 'Which filter buttons on the Case Studies page show this case study.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
                { name: 'cardImage', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: 'Story',
          fields: [
            { name: 'overview', label: 'Client overview', type: 'richText', editor: simpleEditor },
            { name: 'challenge', label: 'The challenge', type: 'richText', editor: simpleEditor },
            { name: 'solutions', label: 'Solutions', type: 'richText', editor: simpleEditor },
            {
              name: 'outcome',
              label: 'The outcome',
              type: 'group',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media' },
                { name: 'caption', type: 'text' },
                {
                  name: 'stats',
                  type: 'array',
                  labels: { singular: 'Stat', plural: 'Stats' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'value', type: 'text', required: true, admin: { width: '30%' } },
                        { name: 'label', type: 'text', required: true, admin: { width: '70%' } },
                      ],
                    },
                  ],
                },
                {
                  name: 'quote',
                  label: 'Client quote',
                  type: 'group',
                  fields: [
                    { name: 'text', type: 'textarea' },
                    { name: 'attribution', type: 'text', admin: { description: 'For example "Jane Smith, CIO".' } },
                  ],
                },
                {
                  name: 'highlights',
                  type: 'array',
                  labels: { singular: 'Highlight', plural: 'Highlights' },
                  fields: [{ name: 'text', type: 'text', required: true }],
                },
              ],
            },
            {
              name: 'technology',
              label: 'Technology stack',
              type: 'array',
              labels: { singular: 'Technology', plural: 'Technologies' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                    {
                      name: 'icon',
                      type: 'text',
                      admin: { width: '50%', description: 'Icon path, for example /assets/icons/case-studies/tech/python.svg' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'related',
              label: 'More case studies',
              type: 'relationship',
              relationTo: 'case-studies',
              hasMany: true,
              maxRows: 3,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
              admin: { description: 'Up to three. Leave empty to show the three most similar case studies automatically.' },
            },
          ],
        },
        { label: 'Advanced SEO', fields: [seoExtras] },
      ],
    },
    slugField(),
    sortOrderField,
  ],
}

import type { Block } from 'payload'

export const SHARED_SECTIONS = [
  { label: 'Client logos ("Trusted by global brands")', value: 'brands' },
  { label: 'Testimonials slider', value: 'testimonials' },
  { label: 'Case studies slider', value: 'caseStudyStories' },
  { label: 'Other industries', value: 'otherIndustries' },
] as const

/** A section edited once in Site settings → Shared sections. */
export const SharedSection: Block = {
  slug: 'sharedSection',
  labels: { singular: 'Shared section', plural: 'Shared sections' },
  fields: [
    {
      name: 'section',
      type: 'select',
      required: true,
      options: [...SHARED_SECTIONS],
      admin: { description: 'Edited once in Site settings → Shared sections, and updated on every page that uses it.' },
    },
    { name: 'anchorId', type: 'text' },
  ],
}

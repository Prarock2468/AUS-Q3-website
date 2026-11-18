import type { Block } from 'payload'

/** Grid of every case study (cards come from the Case studies collection). */
export const CaseStudyList: Block = {
  slug: 'caseStudyList',
  labels: { singular: 'All case studies grid', plural: 'All case studies grids' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'All case studies',
      admin: { description: 'Read by screen readers only. Cards come from the Case studies collection.' },
    },
  ],
}

import type { Block } from 'payload'

/** Case studies slider, picking from the Case studies collection. Rendered by components/commonComponent/CaseStudiesSlider.tsx. */
export const CaseStudiesSliderBlock: Block = {
  slug: 'caseStudiesSlider',
  interfaceName: 'CaseStudiesSliderBlock',
  labels: { singular: 'Case studies slider', plural: 'Case studies sliders' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Case Studies' },
    {
      name: 'caseStudies',
      type: 'relationship',
      relationTo: 'case-studies',
      hasMany: true,
      admin: { description: 'Pick the case studies to show, in order. Leave empty to show the latest ones.' },
    },
    { name: 'limit', type: 'number', defaultValue: 6, admin: { condition: (_, s) => !s?.caseStudies?.length } },
    {
      type: 'row',
      fields: [
        { name: 'viewAllLabel', type: 'text', defaultValue: 'View All', admin: { width: '50%' } },
        { name: 'viewAllLink', type: 'text', defaultValue: '/case-studies', admin: { width: '50%' } },
      ],
    },
    { name: 'autoplay', type: 'checkbox', defaultValue: true },
  ],
}

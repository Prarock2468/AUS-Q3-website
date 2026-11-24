import type { Block } from 'payload'
import { adminFieldOnly } from '../../access'

/**
 * Testimonial slider: the testimonials are edited here. Saved once in Common Component → "Testimonial Slider",
 * each page using it can show only some of them ("Testimonials for this page" on the page's section).
 * Rendered by src/components/commonComponent/TestimonialSlider.tsx.
 */
export const TestimonialSliderBlock: Block = {
  slug: 'testimonialSlider',
  interfaceName: 'TestimonialSliderBlock',
  labels: { singular: 'Testimonial slider', plural: 'Testimonial sliders' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Testimonials' },
    {
      name: 'testimonials',
      type: 'array',
      labels: { singular: 'Testimonial', plural: 'Testimonials' },
      admin: {
        initCollapsed: true,
        description: 'Shown in this order. Pages can pick which of these they show.',
        components: { RowLabel: './fields/TestimonialRowLabel#TestimonialRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '34%' } },
            { name: 'role', label: 'Job title', type: 'text', admin: { width: '33%' } },
            {
              name: 'company',
              type: 'text',
              admin: { width: '33%', description: 'Shown after the job title, and used as the logo’s alt text.' },
            },
          ],
        },
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          admin: { rows: 6, description: 'Leave a blank line between paragraphs.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'photo', type: 'upload', relationTo: 'media', admin: { width: '50%', description: 'Portrait, about 480 × 612.' } },
            {
              name: 'companyLogo',
              type: 'upload',
              relationTo: 'media',
              admin: { width: '50%', description: 'Shown 40px high beside the name (PNG or WebP).' },
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Advanced',
          admin: { initCollapsed: true },
          fields: [
            {
              name: 'photoHtml',
              label: 'Custom photo HTML',
              type: 'code',
              // Published as typed, so admins only (like Custom HTML sections).
              access: { create: adminFieldOnly, update: adminFieldOnly },
              admin: {
                language: 'html',
                description:
                  'Optional. Replaces the photo with this markup inside the photo box (used by testimonials migrated from the old site). Admins only.',
              },
            },
          ],
        },
      ],
    },
    { name: 'autoplay', type: 'checkbox', defaultValue: true },
  ],
}

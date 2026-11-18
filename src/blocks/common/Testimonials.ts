import type { Block } from 'payload'

/** Key of the Common Component entry whose Testimonial slider holds every testimonial ("Testimonial Slider"). */
export const TESTIMONIALS_ENTRY_KEY = 'testimonial-slider'

/**
 * "Testimonials" page section: shows testimonials picked from the list in Common Component → Testimonial Slider
 * (where they are added and edited). Rendered by src/lib/render/common.ts (renderTestimonials).
 */
export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    {
      // Ids of the picked rows of the Testimonial Slider's testimonials list (picked in the admin by name).
      name: 'testimonials',
      label: 'Testimonials to show',
      type: 'text',
      hasMany: true,
      admin: {
        description:
          'Pick the testimonials for this page; drag to reorder. Leave empty to show all of them. Add or edit testimonials in Common Component → Testimonial Slider.',
        components: { Field: './fields/TestimonialsPickerField#TestimonialsPickerField' },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: { width: '50%', placeholder: 'Testimonials', description: 'Optional. Leave empty for the saved heading.' },
        },
        {
          name: 'anchorId',
          type: 'text',
          admin: { width: '50%', description: 'Optional id, for example "testimonials", so links can jump here.' },
        },
      ],
    },
  ],
}

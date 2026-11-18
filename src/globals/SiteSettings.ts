import type { GlobalConfig } from 'payload'
import { adminFieldOnly, anyone, loggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

/**
 * Raw HTML output on every page. Only admins may change it: anything typed here (including scripts) goes live on
 * the public site straight away, on the same domain as the CMS.
 */
const html = (name: string, label: string, description?: string) => ({
  name,
  label,
  type: 'code' as const,
  access: { create: adminFieldOnly, update: adminFieldOnly },
  admin: { language: 'html', description: [description, 'Admins only.'].filter(Boolean).join(' ') },
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: anyone, update: loggedIn },
  versions: { max: 30 },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Organisation',
          description: 'Used for Organization structured data on every page.',
          fields: [
            { name: 'orgName', type: 'text', defaultValue: 'Q3 Technologies' },
            { name: 'telephone', type: 'text' },
            { name: 'email', type: 'text' },
            { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text', required: true }] },
            {
              name: 'defaultOgImage',
              label: 'Default social sharing image URL',
              type: 'text',
              defaultValue: '/assets/images/og-image.png',
            },
          ],
        },
        {
          label: 'Sales contact',
          description: 'The "Schedule a call" card shown next to FAQs.',
          fields: [
            { name: 'salesName', type: 'text' },
            { name: 'salesRole', type: 'text' },
            { name: 'salesPhoto', type: 'text', admin: { description: 'Image path, for example /assets/images/rajat-bansal.webp' } },
          ],
        },
        {
          label: 'Header and footer',
          description:
            'Shared on every page. The current page’s menu link is highlighted automatically. Links use clean URLs such as /services/managed-it-services.',
          fields: [html('header', 'Header'), html('footer', 'Footer')],
        },
        {
          label: 'Shared sections',
          description: 'Edit once here; every page that uses the section updates.',
          fields: [
            html('brands', 'Client logos'),
            html('testimonials', 'Testimonials slider'),
            html('caseStudyStories', 'Case studies slider'),
            html('otherIndustries', 'Other industries'),
          ],
        },
        {
          label: 'Page extras',
          description: 'Floating elements after the footer.',
          fields: [
            html('extrasFull', 'Lead pop-up, cookie banner, back-to-top and "Talk to our agent"'),
            html('extrasSimple', '"Talk to our agent" button only'),
          ],
        },
        {
          label: 'Site search',
          description: 'Extra entries for site search that are not CMS pages (for example UI/UX work items).',
          fields: [
            {
              name: 'searchExtras',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'desc', type: 'textarea' },
                { name: 'url', type: 'text', required: true },
                { name: 'img', type: 'text' },
                { name: 'section', type: 'text' },
                { name: 'type', type: 'text' },
                { name: 'tag', type: 'text' },
                { name: 'keys', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'gtmId',
              label: 'Google Tag Manager ID',
              type: 'text',
              admin: { description: 'For example GTM-XXXXXXX. GA4 and Microsoft Clarity are configured inside GTM.' },
              access: { update: ({ req }) => req.user?.role === 'admin' },
            },
          ],
        },
      ],
    },
  ],
}


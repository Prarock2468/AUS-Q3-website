import type { GlobalConfig } from 'payload'
import { adminFieldOnly, anyone, loggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { encryptSecret, isEncrypted } from '../lib/secretBox'
import { smtpTestEndpoint } from './smtpTestEndpoint'

/** Shown instead of a saved secret; saving it unchanged keeps the stored value. */
const SECRET_MASK = '••••••••'

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
  endpoints: [smtpTestEndpoint],
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
            {
              name: 'sameAs',
              label: 'Social profiles',
              type: 'array',
              labels: { singular: 'Profile link', plural: 'Profile links' },
              admin: { description: 'Company pages elsewhere (LinkedIn, the global site…). Shown to Google as the same organisation.' },
              fields: [{ name: 'url', type: 'text', required: true }],
            },
            {
              name: 'defaultShareImage',
              label: 'Default social sharing image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Shown when a page is shared (WhatsApp, LinkedIn, Facebook…) and has no image of its own. Each page can set its own in its SEO tab → Meta image. Best size 1200 × 630.',
              },
            },
            {
              // Before images could be uploaded here: an image address. Still used when no image is chosen above.
              name: 'defaultOgImage',
              label: 'Default social sharing image URL',
              type: 'text',
              defaultValue: '/assets/images/og-image.png',
              admin: { hidden: true },
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
          label: 'Email',
          description:
            'Emails sent when someone submits a form on the site. The mail server and its password are set on the server (SMTP_* settings), not here.',
          fields: [
            {
              // Not public: Site settings are readable by anyone through the API, these addresses are not.
              name: 'formEmails',
              type: 'group',
              label: false,
              access: { read: ({ req }) => Boolean(req.user) },
              fields: [
                {
                  name: 'notifyTo',
                  label: 'Send enquiries to',
                  type: 'text',
                  admin: {
                    description:
                      'Who receives each enquiry, with any attached file. Separate several addresses with commas. Leave empty to use the server setting (LEADS_NOTIFY_TO).',
                    placeholder: 'sales@q3tech.com, manager@q3tech.com',
                  },
                },
                {
                  name: 'autoReply',
                  label: 'Send a thank-you email to the person who submitted the form',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  type: 'collapsible',
                  label: 'Thank-you email',
                  admin: { condition: (_, sibling) => sibling?.autoReply !== false },
                  fields: [
                    { name: 'thanksSubject', label: 'Subject', type: 'text', defaultValue: 'Thank you for contacting Q3 Technologies' },
                    {
                      name: 'thanksMessage',
                      label: 'Message',
                      type: 'textarea',
                      admin: {
                        rows: 6,
                        description:
                          'Goes after "Hi {their name},". Leave a blank line between paragraphs. Leave empty for the standard message.',
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'signOffName',
                          label: 'Regards: name',
                          type: 'text',
                          defaultValue: 'Q3 Technologies Sales Team',
                          admin: { width: '50%' },
                        },
                        {
                          name: 'signOffEmail',
                          label: 'Regards: email',
                          type: 'text',
                          admin: {
                            width: '50%',
                            description: 'Shown under "Regards"; replies go here. Empty: the server setting (SALES_EMAIL).',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  // Admins only (read and write). The password is stored encrypted and never sent back to the browser.
                  name: 'smtp',
                  type: 'group',
                  label: 'Mail server (SMTP)',
                  access: { read: adminFieldOnly, create: adminFieldOnly, update: adminFieldOnly },
                  admin: {
                    description:
                      'Optional. Fill in all of host, username and password to send form emails through this mail server; otherwise the server settings (SMTP_*) are used. Gmail: host smtp.gmail.com, port 465, your Gmail address, and an App Password (myaccount.google.com/apppasswords). Admins only.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'host', label: 'SMTP host', type: 'text', admin: { width: '70%', placeholder: 'smtp.gmail.com' } },
                        { name: 'port', type: 'number', defaultValue: 465, admin: { width: '30%', description: '465 (SSL) or 587' } },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'username', type: 'text', admin: { width: '50%', placeholder: 'name@gmail.com' } },
                        {
                          name: 'password',
                          type: 'text',
                          admin: {
                            width: '50%',
                            description: 'Saved encrypted and never shown again. Type a new one to replace it; clear the field to remove it.',
                          },
                          hooks: {
                            // Shown as a mask; only the email code (context.revealSmtpPassword) gets the stored value.
                            afterRead: [
                              ({ value, req }) =>
                                req.context?.revealSmtpPassword ? value : isEncrypted(value) ? SECRET_MASK : '',
                            ],
                            beforeChange: [
                              async ({ value, previousValue, req }) => {
                                if (value === SECRET_MASK || value === undefined || value === null) {
                                  if (isEncrypted(previousValue)) return previousValue
                                  const raw = await req.payload.findGlobal({ slug: 'site-settings', depth: 0, context: { revealSmtpPassword: true } })
                                  return raw.formEmails?.smtp?.password ?? ''
                                }
                                const plain = String(value).replace(/\s+/g, '')
                                return plain ? encryptSecret(plain) : ''
                              },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'fromAddress',
                          label: 'From address',
                          type: 'text',
                          admin: { width: '50%', description: 'Empty: the username. Gmail only sends from its own address.' },
                        },
                        { name: 'fromName', label: 'From name', type: 'text', defaultValue: 'Q3 Technologies Australia', admin: { width: '50%' } },
                      ],
                    },
                    {
                      name: 'testEmail',
                      type: 'ui',
                      admin: { components: { Field: './fields/SmtpTestButton#SmtpTestButton' } },
                    },
                  ],
                },
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


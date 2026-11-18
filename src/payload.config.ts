import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { loggedIn } from './access'
import { Authors } from './collections/Authors'
import { CaseStudies } from './collections/CaseStudies'
import { CommonComponents } from './collections/CommonComponents'
import { Insights } from './collections/Insights'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { HeaderMenu } from './globals/HeaderMenu'
import { SiteSettings } from './globals/SiteSettings'
import { revalidateOnChange } from './hooks/revalidate'
import { simpleEditor } from './lexical'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Signs CMS logins. Fail at startup rather than run with an empty or placeholder secret. */
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || ''
if (PAYLOAD_SECRET.length < 32 || PAYLOAD_SECRET === 'change-me') {
  throw new Error('PAYLOAD_SECRET must be set to a random value of at least 32 characters (openssl rand -hex 32).')
}

/** Without DATABASE_URL a production server would silently start on an empty local SQLite file; fail instead. */
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in production, for example postgres://user:password@host:5432/q3?sslmode=require')
}
const DATABASE_URL = process.env.DATABASE_URL || 'file:./q3.db'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/**
 * PostgreSQL (DATABASE_URL=postgres://...) locally and in production; a SQLite file is still supported for quick
 * experiments. PostgreSQL schema changes ship as migrations in src/migrations:
 *   npm run migrate:create <name>   after changing a collection, field or block (commit the generated files)
 *   npm run migrate                 on every deploy, before the new version starts
 */
const db = DATABASE_URL.startsWith('postgres')
  ? postgresAdapter({
      pool: { connectionString: DATABASE_URL },
      migrationDir: path.resolve(dirname, 'migrations'),
      // Never auto-sync the schema: every change goes through a reviewed migration, so dev matches production.
      push: false,
    })
  : sqliteAdapter({ client: { url: DATABASE_URL } })

/** Outgoing email (lead alerts, password resets) over SMTP when configured; otherwise Payload logs emails to the console. */
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || 'no-reply@q3tech.com',
      defaultFromName: 'Q3 Technologies Australia',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      },
    })
  : undefined

const pathFor = (collection: string | undefined, doc: Record<string, any>) => {
  if (collection === 'pages') return doc?.path || '/'
  if (collection === 'case-studies') return `/case-studies/${doc?.slug ?? ''}`
  if (collection === 'insights') return `/insights/${doc?.slug ?? ''}`
  return '/'
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | Q3 Australia CMS' },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Pages, CaseStudies, Insights, CommonComponents, Authors, Media, Users],
  globals: [HeaderMenu, SiteSettings],
  editor: simpleEditor,
  secret: PAYLOAD_SECRET,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  email,
  sharp,
  plugins: [
    seoPlugin({
      collections: ['pages', 'case-studies', 'insights'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => `${doc?.cardTitle || doc?.title || 'Q3 Technologies'} | Q3 Technologies`,
      generateDescription: ({ doc }) => doc?.summary || doc?.searchDescription || '',
      generateURL: ({ doc, collectionConfig }) => `${SITE_URL}${pathFor(collectionConfig?.slug, doc)}`,
    }),
    redirectsPlugin({
      collections: ['pages', 'case-studies', 'insights'],
      overrides: {
        admin: { group: 'Settings', description: 'Old URL → new URL. Checked when no page matches the address.' },
        access: { read: () => true, create: loggedIn, update: loggedIn, delete: loggedIn },
        hooks: { afterChange: [revalidateOnChange] },
      },
    }),
    formBuilderPlugin({
      fields: { payment: false },
      formOverrides: { admin: { group: 'Leads' } },
      formSubmissionOverrides: {
        admin: { group: 'Leads', defaultColumns: ['form', 'createdAt'] },
        // Public enquiries go through /forms/enquiry (validation, spam checks, rate limit), which writes with the
        // Local API. The REST endpoint /api/form-submissions is closed to anonymous visitors.
        access: { read: loggedIn, update: loggedIn, delete: loggedIn, create: loggedIn },
      },
    }),
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION || 'ap-southeast-2',
        endpoint: process.env.S3_ENDPOINT || undefined,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})

import React from 'react'
import { getSettings, resolvePath, toPath } from '@/lib/data'
import { ASSET_VERSION, TEMPLATES } from '@/templates'

type Props = { children: React.ReactNode; params: Promise<{ slug?: string[] }> }

/**
 * Google Consent Mode v2 defaults. Runs first in <head> on every template, before Tag Manager, so no tag can fire
 * with consent it was not given. Analytics is granted only if the visitor accepted the cookie banner (stored by
 * /js/templates/main.min.js under "q3au-consent"); advertising storage stays denied.
 */
const CONSENT_DEFAULTS =
  'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}' +
  'gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"denied",wait_for_update:500});' +
  'try{if(localStorage.getItem("q3au-consent")==="accepted")gtag("consent","update",{analytics_storage:"granted"})}catch(e){}'

const gtmLoader = (id: string) =>
  `if(!window.__gtmLoaded){window.__gtmLoaded=true;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id.replace(/[^A-Z0-9-]/gi, '')}');}`

const SR_WAIT =
  'document.documentElement.classList.add("sr-wait");setTimeout(function(){document.documentElement.classList.remove("sr-wait")},1500)'

/**
 * Root layout for the public site. It sits inside the catch-all route so it can read the URL and load exactly the
 * stylesheets and scripts that page's template used on the original site, in the same order.
 */
export default async function SiteLayout({ children, params }: Props) {
  const { slug } = await params
  const r = await resolvePath(toPath(slug))
  const template = TEMPLATES[r.kind === 'redirect' ? 'notFound' : r.template]
  const settings = await getSettings()
  const bodyClass = r.kind === 'page' ? r.doc.bodyClass || undefined : undefined
  const v = `?v=${ASSET_VERSION}`

  return (
    <html lang="en-AU" className={template.htmlClass} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS }} />
        {template.srWait ? <script dangerouslySetInnerHTML={{ __html: SR_WAIT }} /> : null}
        {template.css.map((href) => (
          <link key={href} rel="stylesheet" href={`${href}${v}`} />
        ))}
        <link rel="preload" href="/assets/fonts/google-sans-flex.woff2" as="font" type="font/woff2" crossOrigin="" />
        {template.js.map((src) => (
          <script key={src} src={src === '/js/search-index.js' ? src : `${src}${v}`} defer />
        ))}
        {settings.gtmId ? <script dangerouslySetInnerHTML={{ __html: gtmLoader(settings.gtmId) }} /> : null}
      </head>
      <body className={bodyClass} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}

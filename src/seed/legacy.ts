/**
 * Helpers for reading the original static HTML site (legacy/site) during the one-off migration.
 */
import fs from 'fs'
import path from 'path'

export const ROOT = path.resolve(process.cwd())
export const SITE_DIR = process.env.SEED_SOURCE ? path.resolve(process.env.SEED_SOURCE) : path.join(ROOT, 'legacy/site')
export const PUBLIC_DIR = path.join(ROOT, 'public')

export const read = (file: string) => fs.readFileSync(path.join(SITE_DIR, file), 'utf8')

/** Old file path → new clean URL path. */
export function cleanPath(file: string): string {
  let p = file.replace(/\\/g, '/').replace(/^\/+/, '')
  if (p === 'index.html' || p === '') return '/'
  if (p === 'industry-details.html') return '/industries/education'
  p = p.replace(/\.html$/, '')
  return `/${p}`
}

/**
 * Rewrite every relative URL in a chunk of HTML (written for page `fromFile`) to an absolute, clean URL:
 *   ../assets/x.webp → /assets/x.webp, services/a.html#top → /services/a#top, ../index.html → /
 */
export function normaliseHtml(html: string, fromFile: string): string {
  const baseDir = path.posix.dirname(fromFile.replace(/\\/g, '/'))

  const fix = (url: string): string => {
    const u = url.trim()
    if (!u || /^(?:[a-z]+:|\/\/|#|data:|mailto:|tel:|javascript:|\{\{)/i.test(u)) return url
    const m = u.match(/^([^?#]*)([?#].*)?$/)
    const pathPart = m?.[1] ?? u
    const suffix = m?.[2] ?? ''
    const resolved = pathPart.startsWith('/') ? pathPart.slice(1) : path.posix.normalize(path.posix.join(baseDir, pathPart))
    if (/\.html$/.test(resolved) || resolved === '' || resolved === '.') return cleanPath(resolved === '.' ? 'index.html' : resolved) + suffix
    return `/${resolved.replace(/^\.\/?/, '')}${suffix}`
  }

  return html
    .replace(/\b(href|src|poster|data-src|data-href|data-poster|data-bg|action)="([^"]*)"/g, (_m, a, v) => `${a}="${fix(v)}"`)
    .replace(/\b(srcset|data-srcset)="([^"]*)"/g, (_m, a, v: string) =>
      `${a}="${v
        .split(',')
        .map((part) => {
          const [u, ...rest] = part.trim().split(/\s+/)
          return [fix(u), ...rest].join(' ')
        })
        .join(', ')}"`,
    )
    .replace(/url\((['"]?)([^'")]+)\1\)/g, (_m, q, v) => `url(${q}${fix(v)}${q})`)
}

/** Every page of the old site, relative to legacy/site. */
export function listPages(): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(path.join(SITE_DIR, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${e.name}` : e.name
      if (e.isDirectory()) {
        if (e.name !== 'partials') walk(rel)
      } else if (e.name.endsWith('.html') && e.name !== '404.html') out.push(rel)
    }
  }
  walk('')
  return out.sort()
}

/** Absolute disk path of a public asset URL such as /assets/images/x.webp. */
export const publicFile = (url: string) => path.join(PUBLIC_DIR, decodeURI(url.split(/[?#]/)[0]))

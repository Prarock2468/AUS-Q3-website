import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/assets/**' }],
  },
  /**
   * Old static-site URLs (about.html, case-studies/x.html …) keep working with a permanent redirect to the clean
   * URL, so existing links and rankings carry over. Redirects editors add in the CMS are handled by the page route.
   */
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/industry-details.html', destination: '/industries/education', permanent: true },
      { source: '/:path((?!admin|api|_next).*)\\.html', destination: '/:path', permanent: true },
    ]
  },
  async headers() {
    const year = 'public, max-age=31536000, immutable'
    return [
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: year }] },
      { source: '/css/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
      { source: '/js/:path((?!search-index).*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

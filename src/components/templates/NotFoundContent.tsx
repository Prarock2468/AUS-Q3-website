import { ScriptOwned } from '../ui/ScriptOwned'

/** The 404 page content. */
export function NotFoundContent() {
  return (
    <section className="list-hero">
      <div className="wrap">
        {/* The first section's h1: common.min.js splits it into animated lines on load. */}
        <ScriptOwned as="h1">Page not found</ScriptOwned>
        <p className="list-lede">The page you are looking for has moved or does not exist.</p>
        <p style={{ marginTop: 24 }}>
          <a className="btn btn-primary" href="/">
            Back to home
          </a>{' '}
          <a className="btn btn-outline" href="/search">
            Search the site
          </a>
        </p>
      </div>
    </section>
  )
}

import { getTestimonialsSlider } from '@/lib/commonComponents'
import { media } from '@/lib/media'
import type { TestimonialSliderBlock, TestimonialsBlock } from '@/payload-types'
import { NextIcon, PrevIcon } from '../ui/icons'
import { ScriptOwned } from '../ui/ScriptOwned'

type Testimonial = NonNullable<TestimonialSliderBlock['testimonials']>[number]

/** One testimonial: photo, then quote, name, role and company logo. */
function Card({ t, active }: { t: Testimonial; active: boolean }) {
  const photo = media(t.photo)
  const logo = media(t.companyLogo)
  const role = [t.role, t.company].filter(Boolean).join(', ')
  const paragraphs = t.quote
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  return (
    // The slider script moves `is-active` between cards.
    <div className={active ? 'tcard is-active' : 'tcard'} suppressHydrationWarning>
      {t.photoHtml ? (
        <div className="tphoto" dangerouslySetInnerHTML={{ __html: t.photoHtml }} />
      ) : (
        <div className="tphoto">
          {photo?.url ? <img decoding="async" loading="lazy" className="tphoto__img" src={photo.url} width={photo.width || 480} height={photo.height || 612} alt="" /> : null}
        </div>
      )}
      {/* Script-owned: the slider script adds a "View All" button after the quote on load. */}
      <ScriptOwned className="tbody">
        <img decoding="async" loading="lazy" className="tbody__quote" src="/assets/icons/common/testi-quote.svg" width={50} height={37} alt="" />
        <div className="tbody__text">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {/* The empty last paragraph is needed: on phones the CSS hides each quote's last paragraph. */}
          <p>{'​'}</p>
        </div>
        <div className="tbody__who">
          <div className="tbody__attr">
            <p className="tbody__name">{t.name}</p>
            {role ? <p className="tbody__role">{role}</p> : null}
          </div>
          {logo?.url ? (
            <img decoding="async" loading="lazy" className="tbody__logo" src={logo.url} width={logo.width || 163} height={logo.height || 51} alt={t.company || ''} />
          ) : null}
        </div>
      </ScriptOwned>
    </div>
  )
}

/** Testimonials carousel (section.testi), driven by the template's slider script (dots, arrows, swipe). */
export function TestimonialSlider({ block, anchorId }: { block: TestimonialSliderBlock; anchorId?: string | null }) {
  const items = block.testimonials || []
  if (!items.length) return null
  return (
    <section className="testi" aria-labelledby="testi-title" id={anchorId || undefined}>
      <div className="testi__inner" suppressHydrationWarning>
        <h2 id="testi-title">{block.heading || 'Testimonials'}</h2>
        <div className="testi__viewport">
          <div className="testi__track" data-carousel="testimonials" suppressHydrationWarning>
            {items.map((t, i) => (
              <Card key={t.id || i} t={t} active={i === 0} />
            ))}
          </div>
        </div>
        {items.length > 1 ? (
          <div className="testi__nav">
            <div className="testi__dots">
              {items.map((t, i) => (
                <button
                  key={t.id || i}
                  className={i === 0 ? 'testi__dot is-active' : 'testi__dot'}
                  type="button"
                  aria-pressed={i === 0}
                  aria-label={`Show testimonial ${i + 1}`}
                  suppressHydrationWarning
                />
              ))}
            </div>
            <div className="testi__arrows">
              <button className="testi__arrow" type="button" data-testi-prev="" aria-label="Previous testimonial" suppressHydrationWarning>
                <PrevIcon />
              </button>
              <button className="testi__arrow" type="button" data-testi-next="" aria-label="Next testimonial" suppressHydrationWarning>
                <NextIcon />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/**
 * A "Testimonials" page section: the testimonials it picked from Common Component → Testimonial Slider, in the
 * picked order (all of them when it picked none, or none of its picks still exist), with the saved slider's layout.
 */
export async function Testimonials({ block }: { block: TestimonialsBlock }) {
  const slider = await getTestimonialsSlider()
  if (!slider) return null
  const all = slider.testimonials || []
  const picked = (block.testimonials || []).flatMap((id) => all.filter((t) => t.id === id))
  return (
    <TestimonialSlider
      block={{ ...slider, heading: block.heading || slider.heading, testimonials: picked.length ? picked : all }}
      anchorId={block.anchorId}
    />
  )
}

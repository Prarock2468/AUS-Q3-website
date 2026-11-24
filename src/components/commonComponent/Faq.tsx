import { SalesCard } from '@/components/ui/cards'
import { getPayloadClient, isDraft } from '@/lib/data'
import { richTextToHTML } from '@/lib/richtext'
import type { CommonComponent, Page, SiteSetting } from '@/payload-types'
import { RichText, hasText } from '@/components/ui/RichText'

/** An FAQ section as stored in the CMS (on a page, or inside a Common Component entry). */
export type FaqData = Extract<NonNullable<Page['layout']>[number], { blockType: 'faq' }>
/** Questions as stored in the CMS ("Questions" on an FAQ, or "FAQs for this page"). */
export type FaqItem = { question: string; answer: unknown; id?: string | null }

type FaqProps = {
  block: Pick<FaqData, 'heading' | 'intro' | 'style' | 'showSalesContact'> & {
    items?: FaqItem[] | null
  }
  settings: SiteSetting
  /** Optional id on the <section>, so links can jump here. */
  anchorId?: string | null
}

/**
 * FAQ section (questions and answers, with the optional "Schedule a call" card), rendered from CMS data.
 * The markup and class names match the original site, so the existing CSS and scripts drive it:
 *  - style "Standard" (home-faq): section.home-faq with the h2 the section is labelled by;
 *  - style "Compact" (section) and "Home page" (home): section.section.
 * The same questions are published as FAQPage structured data by buildJsonLd (src/lib/seo.ts).
 */
export function Faq({ block, settings, anchorId }: FaqProps) {
  const style = block.style || 'home-faq'
  const items = block.items || []
  const isStandard = style === 'home-faq'
  return (
    <section
      id={anchorId || undefined}
      className={isStandard ? 'home-faq' : 'section'}
      aria-labelledby={isStandard ? 'home-faq-title' : undefined}
    >
      {/* The site scripts animate this section on load, before React hydrates: the scroll reveal (common.min.js)
          adds `sr` classes and a --sr-delay style to .sticky and .faq, and the home script (main.min.js) adds
          `reveal g` / `is-in` and animation styles to .faq. suppressHydrationWarning tells React to expect that on
          exactly these elements (it only covers their own attributes, not their children). */}
      <div className="wrap two-col">
        <div className="sticky" suppressHydrationWarning>
          <h2 id={isStandard ? 'home-faq-title' : undefined}>{block.heading}</h2>
          {hasText(block.intro) ? (
            style === 'home' ? (
              <p className="faq-intro">
                <RichText value={block.intro} />
              </p>
            ) : (
              <p style={{ marginTop: 16, maxWidth: '36ch' }}>
                <RichText value={block.intro} />
              </p>
            )
          ) : null}
          {block.showSalesContact ? <SalesCard settings={settings} /> : null}
        </div>
        <div className={style === 'home' ? 'faq home-faq' : 'faq'} suppressHydrationWarning>
          {items.map((item, i) => (
            <details key={item.id || i} className="faqList">
              <summary>{item.question}</summary>
              <div dangerouslySetInnerHTML={{ __html: richTextToHTML(item.answer) }} />
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/** The page's own questions and style replace the saved FAQ's, when set ("FAQs / FAQ style for this page"). */
export function withPageFaq(
  saved: FaqData,
  page: { faqs?: FaqItem[] | null; faqStyle?: FaqData['style'] | null },
): FaqProps['block'] {
  return {
    ...saved,
    items: page.faqs?.length ? page.faqs : saved.items,
    style: page.faqStyle || saved.style,
  }
}

/** Loads a Common Component entry by its key (drafts included in preview). */
async function findCommonComponent(componentKey: string): Promise<CommonComponent | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'commonComponent',
    where: { key: { equals: componentKey } },
    depth: 2,
    limit: 1,
    overrideAccess: await isDraft(),
  })
  return docs[0] || null
}

/**
 * The shared FAQ from the admin (Common Component → FAQ, key "faq"), optionally with this page's own questions
 * and style. For example: <SharedFaq settings={settings} faqs={pageQuestions} />.
 */
export async function SharedFaq({
  settings,
  componentKey = 'faq',
  faqs,
  faqStyle,
  anchorId,
}: {
  settings: SiteSetting
  componentKey?: string
  faqs?: FaqItem[] | null
  faqStyle?: FaqData['style'] | null
  anchorId?: string | null
}) {
  const entry = await findCommonComponent(componentKey)
  const saved = entry?.layout?.find((b): b is FaqData => b.blockType === 'faq')
  if (!saved) return null
  return (
    <Faq block={withPageFaq(saved, { faqs, faqStyle })} settings={settings} anchorId={anchorId} />
  )
}

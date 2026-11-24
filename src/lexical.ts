import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

const base = [
  ParagraphFeature(),
  BoldFeature(),
  ItalicFeature(),
  LinkFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
]

/** Short rich text: paragraphs, bold, links and lists (case study sections, FAQ answers). */
export const simpleEditor = lexicalEditor({ features: () => base })

/** Article body: adds H2/H3 headings and tables (insights). */
export const articleEditor = lexicalEditor({
  features: () => [...base, HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }), EXPERIMENTAL_TableFeature()],
})

/**
 * Inline rich text for section descriptions and intros (shown inside the design's own paragraph): bold, italic,
 * underline and links. Enter starts a new line. No headings or lists, which cannot sit inside a paragraph.
 * Drawn on the website by components/ui/RichText.tsx.
 */
export const inlineEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    LinkFeature({ enabledCollections: ['pages', 'case-studies', 'insights'] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

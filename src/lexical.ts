import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
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

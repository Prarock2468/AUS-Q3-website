import type { Author, Media } from '@/payload-types'

/** An upload field's value as a Media doc (null when empty or not populated). */
export const media = (m: unknown): Media | null => (m && typeof m === 'object' ? (m as Media) : null)
export const mediaUrl = (m: unknown, fallback = '') => media(m)?.url || fallback
/** The 800px version (Media → imageSizes w800), used in srcsets. */
export const mediaSizeUrl = (m: unknown, size: 'w800') => media(m)?.sizes?.[size]?.url || ''

/** A relationship to Authors as the Author doc (null when empty or not populated). */
export const author = (a: unknown): Author | null => (a && typeof a === 'object' ? (a as Author) : null)

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

/**
 * Encrypts small secrets stored in the database (the SMTP password in Site settings → Email) with AES-256-GCM.
 * The key comes from PAYLOAD_SECRET, so the database alone does not reveal the secret. Changing PAYLOAD_SECRET makes
 * stored secrets unreadable; they then have to be entered again.
 */
const PREFIX = 'enc:v1:'
const key = () => createHash('sha256').update(`${process.env.PAYLOAD_SECRET || ''}:site-secrets`).digest()

export const isEncrypted = (value: unknown): value is string => typeof value === 'string' && value.startsWith(PREFIX)

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return PREFIX + [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join(':')
}

/** The plain secret, or null when it is missing or cannot be decrypted (for example after PAYLOAD_SECRET changed). */
export function decryptSecret(stored: string | null | undefined): string | null {
  if (!isEncrypted(stored)) return null
  try {
    const [iv, tag, data] = stored.slice(PREFIX.length).split(':').map((p) => Buffer.from(p, 'base64'))
    const decipher = createDecipheriv('aes-256-gcm', key(), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

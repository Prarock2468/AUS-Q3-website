import { Fragment } from 'react'

/** Text typed with Enter for new lines, drawn with <br> between the lines. */
export function Lines({ text }: { text: string | null | undefined }) {
  const lines = (text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.map((l, i) => (
    <Fragment key={i}>
      {i ? <br /> : null}
      {l}
    </Fragment>
  ))
}

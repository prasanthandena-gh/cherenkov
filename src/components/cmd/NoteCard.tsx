import type { ReactNode } from 'react'

export type NoteKind = 'note' | 'field' | 'warn' | 'crit' | 'violet' | 'plasma'

interface Props {
  kind?: NoteKind
  tag?: string
  /** Italic flourish — typically a `fun:` line from data */
  fun?: string
  children?: ReactNode
}

export default function NoteCard({ kind = 'note', tag, fun, children }: Props) {
  const cls = kind === 'note' ? 'fc-note' : `fc-note fc-note--${kind}`
  return (
    <div className={cls}>
      {tag && <div className="fc-note__tag">{tag}</div>}
      {children && <div className="fc-note__body">{children}</div>}
      {fun && <em className="fc-note__fun">{fun}</em>}
    </div>
  )
}

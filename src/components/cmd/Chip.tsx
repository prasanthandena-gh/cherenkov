import type { ReactNode } from 'react'

export type ChipTone = 'signal' | 'warn' | 'ok' | 'ghost' | 'plasma' | 'crit' | 'violet'

interface Props {
  on?: boolean
  tone?: ChipTone
  onClick?: () => void
  title?: string
  disabled?: boolean
  children: ReactNode
}

export default function Chip({ on, tone = 'signal', onClick, title, disabled, children }: Props) {
  return (
    <button
      type="button"
      className={`fc-chip fc-chip--${tone} ${on ? 'is-on' : ''}`.trim()}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

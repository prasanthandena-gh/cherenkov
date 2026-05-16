import type { ReactNode } from 'react'

interface Props {
  label?: string
  columns?: 1 | 2 | 3 | 4 | 'flow'
  children: ReactNode
}

export default function ChipGroup({ label, columns = 'flow', children }: Props) {
  const cls = columns === 'flow' ? 'fc-chip-group__chips--flow' : `fc-chip-group__chips--c${columns}`
  return (
    <div className="fc-chip-group">
      {label && <span className="fc-chip-group__tag">{label}</span>}
      <div className={`fc-chip-group__chips ${cls}`}>{children}</div>
    </div>
  )
}

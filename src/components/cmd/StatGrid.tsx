import type { ReactNode } from 'react'

interface GridProps {
  cols?: 1 | 2 | 3
  children: ReactNode
  className?: string
}

export function StatGrid({ cols = 2, children, className = '' }: GridProps) {
  return (
    <div className={`fc-stats fc-stats--c${cols} ${className}`.trim()}>{children}</div>
  )
}

export type StatTone = 'signal' | 'warn' | 'ok' | 'crit' | 'ink'

interface StatProps {
  k: string                       // label
  v: ReactNode                    // value
  u?: string                      // unit
  tone?: StatTone
  small?: boolean
  span?: 2 | 3
}

export function Stat({ k, v, u, tone = 'signal', small, span }: StatProps) {
  const cls = [
    'fc-stat',
    span ? `fc-stat--span${span}` : '',
  ].filter(Boolean).join(' ')
  const vCls = [
    'fc-stat__v',
    small ? 'fc-stat__v--sm' : '',
    tone !== 'signal' ? `fc-stat__v--${tone}` : '',
  ].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <div className="fc-stat__k">{k}</div>
      <div className={vCls}>
        {v}
        {u && <span className="fc-stat__u">{u}</span>}
      </div>
    </div>
  )
}

export default StatGrid

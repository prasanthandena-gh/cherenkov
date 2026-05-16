import type { CSSProperties, ReactNode } from 'react'

type Position = 'top-right' | 'top-left' | 'bot-right' | 'bot-left' | 'floating' | 'inline'

interface Props {
  position?: Position
  width?: number | string
  tag?: string
  id?: string
  style?: CSSProperties
  className?: string
  children: ReactNode
}

export default function ControlPanel({
  position = 'inline',
  width,
  tag,
  id,
  style,
  className = '',
  children,
}: Props) {
  const w: CSSProperties = width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}
  return (
    <section
      className={`fc-panel fc-panel--${position} ${className}`.trim()}
      style={{ ...w, ...style }}
    >
      {(tag || id) && (
        <header className="fc-panel__head">
          {tag && <span className="fc-panel__tag">{tag}</span>}
          {id  && <span className="fc-panel__id">{id}</span>}
        </header>
      )}
      {children}
    </section>
  )
}

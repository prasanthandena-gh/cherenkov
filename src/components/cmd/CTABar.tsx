export interface CTAAction {
  label: string
  onClick: () => void
  primary?: boolean
  tone?: 'warn' | 'crit'
  disabled?: boolean
  title?: string
}

interface Props {
  coordLabel?: string
  actions: CTAAction[]
  help?: string
  inline?: boolean
}

export default function CTABar({ coordLabel, actions, help, inline }: Props) {
  return (
    <div className={`fc-cta ${inline ? 'fc-cta--inline' : ''}`.trim()}>
      {coordLabel ? <div className="fc-cta__coord">{coordLabel}</div> : <span />}
      <div className="fc-cta__buttons">
        {actions.map((a, i) => {
          const cls = [
            'fc-cta__btn',
            a.primary ? 'fc-cta__btn--primary' : '',
            a.tone ? `fc-cta__btn--${a.tone}` : '',
          ].filter(Boolean).join(' ')
          return (
            <button
              key={i}
              className={cls}
              onClick={a.onClick}
              disabled={a.disabled}
              title={a.title}
            >{a.label}</button>
          )
        })}
      </div>
      {help ? <div className="fc-cta__help">{help}</div> : <span />}
    </div>
  )
}

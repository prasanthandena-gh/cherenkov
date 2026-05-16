interface Props {
  label: string
  value: number
  min?: number
  max: number
  unit?: string
  /** Value above which the readout switches to crit tone (blinks) */
  redline?: number
  /** Value above which readout switches to warn tone */
  warnline?: number
  /** Format the displayed value */
  format?: (v: number) => string
  size?: number
}

export default function Gauge({
  label,
  value,
  min = 0,
  max,
  unit,
  redline,
  warnline,
  format,
  size = 110,
}: Props) {
  const span = max - min || 1
  const clamped = Math.max(min, Math.min(max, value))
  const pct = (clamped - min) / span
  // semicircle: 180° sweep from 180° to 360° (left to right across the top)
  const angle = Math.PI + pct * Math.PI
  const cx = size / 2
  const cy = size * 0.62
  const r = size * 0.38
  const x = cx + Math.cos(angle) * r
  const y = cy + Math.sin(angle) * r

  // background arc path (full semicircle)
  const startX = cx - r
  const startY = cy
  const endX = cx + r
  const endY = cy
  const bgArc = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`

  // fill arc (partial)
  const fillArc = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${x} ${y}`

  const isCrit = redline !== undefined && value >= redline
  const isWarn = !isCrit && warnline !== undefined && value >= warnline
  const tone = isCrit ? 'crit' : isWarn ? 'warn' : 'ok'

  const display = format ? format(value) : value.toFixed(1)

  // tick marks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => {
    const a = Math.PI + t * Math.PI
    const x1 = cx + Math.cos(a) * (r + 2)
    const y1 = cy + Math.sin(a) * (r + 2)
    const x2 = cx + Math.cos(a) * (r + 6)
    const y2 = cy + Math.sin(a) * (r + 6)
    return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--rule-strong)" strokeWidth="1" />
  })

  return (
    <div className="fc-gauge">
      <svg className="fc-gauge__svg" width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        <path d={bgArc} fill="none" stroke="var(--rule)" strokeWidth="3" />
        <path
          d={fillArc}
          fill="none"
          stroke={isCrit ? 'var(--crit)' : isWarn ? 'var(--warn)' : 'var(--ok)'}
          strokeWidth="3"
          style={{ filter: `drop-shadow(0 0 4px ${isCrit ? 'var(--crit)' : isWarn ? 'var(--warn)' : 'var(--ok)'})` }}
        />
        {ticks}
        {/* needle */}
        <line
          x1={cx} y1={cy}
          x2={x} y2={y}
          stroke="var(--ink)"
          strokeWidth="1.5"
        />
        <circle cx={cx} cy={cy} r="2.5" fill="var(--signal)" />
      </svg>
      <span className={`fc-gauge__val fc-gauge__val--${tone}`}>
        {display}{unit && <span style={{ fontSize: 10, color: 'var(--ink-dim)', marginLeft: 2 }}>{unit}</span>}
      </span>
      <span className="fc-gauge__label">{label}</span>
    </div>
  )
}

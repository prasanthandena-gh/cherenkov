import type { CSSProperties } from 'react'

export interface RangeBand {
  from: number
  to: number
  color: string
  label?: string
}

interface Props {
  label: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  step?: number
  unit?: string
  /** Format value for the readout (defaults to String(value)) */
  format?: (v: number) => string
  /** Colored zones painted behind the fill (e.g. Sandbox enrichment bands) */
  bands?: RangeBand[]
  /** Show min/max range row under the track */
  showRange?: boolean
  /** Show value readout in the head row */
  showValue?: boolean
}

export default function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  unit,
  format,
  bands,
  showRange = true,
  showValue = true,
}: Props) {
  const span = max - min || 1
  const pct = ((value - min) / span) * 100
  const display = format ? format(value) : String(value)

  return (
    <div className="fc-range">
      <div className="fc-range__head">
        <span className="fc-range__tag">{label}</span>
        {showValue && (
          <span className="fc-range__val">
            {display}
            {unit && <span className="fc-range__unit">{unit}</span>}
          </span>
        )}
      </div>
      <div className="fc-range__track">
        {bands?.map((b, i) => {
          const left  = ((b.from - min) / span) * 100
          const width = ((b.to - b.from) / span) * 100
          const style: CSSProperties = { left: `${left}%`, width: `${width}%`, background: b.color }
          return <span key={i} className="fc-range__band" style={style} title={b.label} />
        })}
        <span className="fc-range__fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="fc-range__input"
          aria-label={label}
        />
      </div>
      {showRange && (
        <div className="fc-range__range">
          <span>{format ? format(min) : min}</span>
          <span>{format ? format(max) : max}</span>
        </div>
      )}
    </div>
  )
}

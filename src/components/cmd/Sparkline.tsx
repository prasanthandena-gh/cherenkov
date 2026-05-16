interface Props {
  data: number[]
  width?: number
  height?: number
  tone?: 'signal' | 'warn' | 'ok' | 'crit'
  area?: boolean
  min?: number
  max?: number
}

const TONE_COLOR: Record<NonNullable<Props['tone']>, string> = {
  signal: 'var(--signal)',
  warn:   'var(--warn)',
  ok:     'var(--ok)',
  crit:   'var(--crit)',
}

export default function Sparkline({
  data,
  width = 120,
  height = 32,
  tone = 'signal',
  area = true,
  min,
  max,
}: Props) {
  if (data.length === 0) {
    return <svg className="fc-spark" width={width} height={height} />
  }
  const lo = min ?? Math.min(...data)
  const hi = max ?? Math.max(...data)
  const span = hi - lo || 1
  const stepX = data.length > 1 ? width / (data.length - 1) : 0

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - lo) / span) * height
    return [x, y] as const
  })
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`
  const color = TONE_COLOR[tone]

  return (
    <svg className="fc-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {area && <path className="fc-spark__area" d={areaPath} fill={color} />}
      <path className="fc-spark__path" d={linePath} stroke={color} />
    </svg>
  )
}

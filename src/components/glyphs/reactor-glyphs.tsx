/* =====================================================
   REACTOR GLYPHS — compact black-on-yellow isometrics.
   One named export per reactor kind. Used by the Reactors
   gallery cards. Each glyph fills a 200×220 viewBox.
   ===================================================== */

import type { ReactNode } from 'react'

interface Props { className?: string }

const Base = ({ children, className }: Props & { children: ReactNode }) => (
  <svg viewBox="0 0 200 220" className={className}>
    <path d="M 30 200 L 100 220 L 170 200 L 100 180 Z" fill="rgba(0,0,0,0.15)" stroke="#000" strokeWidth="1" />
    {children}
  </svg>
)

export function PwrGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M 60 90 Q 60 50 100 50 Q 140 50 140 90 L 140 200 L 60 200 Z" fill="none" stroke="#000" strokeWidth="2" />
      <rect x="85" y="100" width="30" height="80" stroke="#000" strokeWidth="2" fill="none" />
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={90 + i * 7} y1={108} x2={90 + i * 7} y2={170} stroke="#000" strokeWidth="1.2" />
      ))}
    </Base>
  )
}

export function BwrGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <path d="M 60 90 Q 60 50 100 50 Q 140 50 140 90 L 140 200 L 60 200 Z" fill="none" stroke="#000" strokeWidth="2" />
      <rect x="80" y="120" width="40" height="60" stroke="#000" strokeWidth="2" fill="none" />
      <path d="M 80 120 Q 100 105 120 120" fill="none" stroke="#000" strokeWidth="1.4" />
    </Base>
  )
}

export function CanduGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="40" y="100" width="120" height="80" stroke="#000" strokeWidth="2" fill="none" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <line key={i} x1={48 + i * 16} y1={104} x2={48 + i * 16} y2={176} stroke="#000" strokeWidth="1" />
      ))}
      <text x="100" y="60" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#000">D₂O</text>
    </Base>
  )
}

export function HtgrGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <circle cx="100" cy="130" r="55" stroke="#000" strokeWidth="2" fill="none" />
      {Array.from({ length: 18 }).map((_, i) => {
        const a = i * 0.7 + 0.2
        const r = 14 + (i % 3) * 10
        return <circle key={i} cx={100 + Math.cos(a) * r} cy={130 + Math.sin(a) * r} r="3.5" fill="#000" />
      })}
    </Base>
  )
}

export function SfrGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <ellipse cx="100" cy="120" rx="60" ry="20" stroke="#000" strokeWidth="2" fill="none" />
      <path d="M 40 120 L 40 180 L 160 180 L 160 120" stroke="#000" strokeWidth="2" fill="none" />
      <rect x="90" y="85" width="20" height="35" stroke="#000" strokeWidth="1.5" fill="none" />
      <line x1="50" y1="170" x2="150" y2="170" stroke="#000" strokeWidth="0.6" strokeDasharray="2 3" />
      <text x="100" y="60" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#000">Na</text>
    </Base>
  )
}

export function SmrGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <ellipse cx="100" cy="70" rx="30" ry="8" fill="none" stroke="#000" strokeWidth="2" />
      <rect x="70" y="70" width="60" height="110" stroke="#000" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="180" rx="30" ry="8" fill="none" stroke="#000" strokeWidth="2" />
      <line x1="100" y1="80" x2="100" y2="170" stroke="#000" strokeWidth="1.2" />
      {[0, 1].map(i => (
        <line key={i} x1={86 + i * 28} y1={100} x2={86 + i * 28} y2={170} stroke="#000" strokeWidth="1" />
      ))}
    </Base>
  )
}

export function MsrGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="50" y="90" width="100" height="100" stroke="#000" strokeWidth="2" fill="none" />
      <path d="M 70 100 Q 100 130 130 100 M 70 130 Q 100 160 130 130 M 70 160 Q 100 190 130 160" fill="none" stroke="#000" strokeWidth="1.2" />
      <text x="100" y="80" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#000">SALT</text>
    </Base>
  )
}

export function MicroGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="80" y="100" width="40" height="90" stroke="#000" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="100" rx="20" ry="6" stroke="#000" strokeWidth="2" fill="none" />
      <rect x="60" y="190" width="80" height="14" stroke="#000" strokeWidth="1.4" fill="none" />
    </Base>
  )
}

export function TokamakGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <ellipse cx="100" cy="130" rx="65" ry="20" stroke="#000" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="130" rx="40" ry="12" stroke="#000" strokeWidth="2" fill="none" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = i * (Math.PI / 4)
        const x = 100 + Math.cos(a) * 52
        const y = 130 + Math.sin(a) * 16
        return <circle key={i} cx={x} cy={y} r="3" fill="#000" />
      })}
      <text x="100" y="70" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#000">D-T</text>
    </Base>
  )
}

export function GenericGlyph({ className }: Props) {
  return (
    <Base className={className}>
      <rect x="60" y="80" width="80" height="120" stroke="#000" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="80" rx="40" ry="10" stroke="#000" strokeWidth="2" fill="none" />
    </Base>
  )
}

/** Look up the right glyph for a model id (e.g. "pwr-generic", "msr-salt"). */
export function GlyphFor({ modelId, className }: { modelId: string; className?: string }) {
  const kind = modelId.split('-')[0]
  switch (kind) {
    case 'pwr':           return <PwrGlyph className={className} />
    case 'bwr':           return <BwrGlyph className={className} />
    case 'candu':         return <CanduGlyph className={className} />
    case 'htgr':          return <HtgrGlyph className={className} />
    case 'sfr':           return <SfrGlyph className={className} />
    case 'smr':           return <SmrGlyph className={className} />
    case 'msr':           return <MsrGlyph className={className} />
    case 'microreactor':  return <MicroGlyph className={className} />
    case 'tokamak':
    case 'fusion':        return <TokamakGlyph className={className} />
    default:              return <GenericGlyph className={className} />
  }
}

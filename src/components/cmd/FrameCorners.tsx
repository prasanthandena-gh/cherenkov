import { useEffect, useState } from 'react'

interface Props {
  leftTag: string
  leftMeta?: string
  rightTag: string
  rightMeta?: string
  /** Jitter the last digit of rightMeta every 4-7s for that "alive" feel */
  jitter?: boolean
}

function bumpLastDigit(s: string): string {
  return s.replace(/(\d)(?!.*\d)/, d => String((Number(d) + 1) % 10))
}

export default function FrameCorners({ leftTag, leftMeta, rightTag, rightMeta, jitter = true }: Props) {
  const [meta, setMeta] = useState(rightMeta ?? '')

  useEffect(() => { setMeta(rightMeta ?? '') }, [rightMeta])

  useEffect(() => {
    if (!jitter || !rightMeta || !/\d/.test(rightMeta)) return
    let timer: number
    const schedule = () => {
      const ms = 4000 + Math.random() * 3000
      timer = window.setTimeout(() => {
        setMeta(prev => bumpLastDigit(prev))
        schedule()
      }, ms)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [jitter, rightMeta])

  return (
    <>
      <div className="fc-corners fc-corners--left">
        <span className="fc-corners__tag">{leftTag}</span>
        {leftMeta && <span className="fc-corners__meta">{leftMeta}</span>}
      </div>
      <div className="fc-corners fc-corners--right">
        <span className="fc-corners__tag">{rightTag}</span>
        {rightMeta && <span className="fc-corners__meta">{meta}</span>}
      </div>
    </>
  )
}

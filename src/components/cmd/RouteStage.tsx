import type { ReactNode } from 'react'
import './cmd.css'

interface Props {
  variant?: 'bleed' | 'scroll' | 'pan'
  className?: string
  children: ReactNode
}

export default function RouteStage({ variant = 'bleed', className = '', children }: Props) {
  return (
    <div className={`fc-stage fc-stage--${variant} ${className}`.trim()}>
      {children}
    </div>
  )
}

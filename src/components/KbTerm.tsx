/* =====================================================
   KbTerm — inline link to glossary. Navigates to /glossary?term=slug.
   ===================================================== */

import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  slug: string
  children: ReactNode
}

export default function KbTerm({ slug, children }: Props) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/glossary?term=${slug}`)}
      style={{
        display: 'inline',
        padding: 0,
        background: 'transparent',
        border: 'none',
        color: 'var(--signal)',
        font: 'inherit',
        cursor: 'pointer',
        borderBottom: '1px dotted var(--signal)',
      }}
    >
      {children}
    </button>
  )
}

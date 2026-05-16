import { useEffect, useState } from 'react'

interface Props {
  modName: string
}

export default function BootPulse({ modName }: Props) {
  const [key, setKey] = useState(0)
  useEffect(() => { setKey(k => k + 1) }, [modName])

  return (
    <span key={key} className="fc-boot">▸ INITIALIZING {modName}…</span>
  )
}

import BootPulse from './BootPulse'

interface Props {
  mod: string         // e.g. "MOD.04 / FISSION SIM"
  title: string
  deck?: string
  /** Suppress boot-up pulse (rare — most routes should keep it) */
  noBoot?: boolean
}

export default function RouteHeader({ mod, title, deck, noBoot }: Props) {
  return (
    <header className="fc-header">
      {!noBoot && <BootPulse modName={mod} />}
      <div className="fc-header__mod">{mod}</div>
      <h1 className="fc-header__title">{title}</h1>
      {deck && <p className="fc-header__deck">{deck}</p>}
    </header>
  )
}

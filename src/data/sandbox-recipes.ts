/* =====================================================
   SANDBOX RECIPES — fuel × coolant × moderator → verdict.
   Used by §08 Build-a-Reactor.
   ===================================================== */

export type Fuel     = 'u235' | 'u238' | 'pu239' | 'th232' | 'dt'
export type Coolant  = 'lwater' | 'hwater' | 'sodium' | 'salt' | 'helium' | 'leadbi' | 'none'
export type Moderator = 'lwater' | 'hwater' | 'graphite' | 'beryllium' | 'none'

export const FUELS: { id: Fuel; label: string }[] = [
  { id: 'u235',  label: 'LEU (U-235 enriched 3-5%)' },
  { id: 'u238',  label: 'Natural Uranium (mostly U-238)' },
  { id: 'pu239', label: 'Plutonium-239' },
  { id: 'th232', label: 'Thorium-232' },
  { id: 'dt',    label: 'Deuterium + Tritium (D-T)' },
]

export const COOLANTS: { id: Coolant; label: string }[] = [
  { id: 'lwater', label: 'Light water (H₂O)' },
  { id: 'hwater', label: 'Heavy water (D₂O)' },
  { id: 'sodium', label: 'Liquid sodium' },
  { id: 'salt',   label: 'Molten salt' },
  { id: 'helium', label: 'Helium gas' },
  { id: 'leadbi', label: 'Lead-bismuth eutectic' },
  { id: 'none',   label: 'No coolant (just… don\'t)' },
]

export const MODERATORS: { id: Moderator; label: string }[] = [
  { id: 'lwater',    label: 'Light water' },
  { id: 'hwater',    label: 'Heavy water' },
  { id: 'graphite',  label: 'Graphite' },
  { id: 'beryllium', label: 'Beryllium' },
  { id: 'none',      label: 'No moderator (fast spectrum)' },
]

export interface Verdict {
  name: string
  real: boolean
  verdict: string
  snark: string
  vibe: 'good' | 'bad' | 'weird'
}

type Key = `${Fuel}|${Coolant}|${Moderator}`

const TABLE: Partial<Record<Key, Verdict>> = {
  'u235|lwater|lwater':   { name: 'PWR / BWR',         real: true,  vibe: 'good',  verdict: 'You invented the Pressurized Water Reactor — or its sibling, the BWR. About 80% of every commercial reactor on Earth.', snark: 'Congratulations, you are now Westinghouse. Or maybe GE.' },
  'u235|hwater|hwater':   { name: 'CANDU-like',        real: true,  vibe: 'good',  verdict: 'Heavy water moderator AND coolant — but with enriched fuel, you\'re overshooting. CANDU\'s whole trick is using NATURAL uranium.', snark: 'Close. Drop the enrichment and Canada will send you a Tim Hortons gift card.' },
  'u238|hwater|hwater':   { name: 'CANDU',             real: true,  vibe: 'good',  verdict: 'You invented CANDU. Canada says thanks. Heavy water is such a good moderator you don\'t need to enrich anything.', snark: 'Eight reactors named Bruce nod in approval.' },
  'u235|lwater|graphite': { name: 'RBMK',              real: true,  vibe: 'bad',   verdict: 'Graphite-moderated, light-water-cooled, low-enriched uranium. You\'ve re-built the RBMK. Chernobyl was an RBMK. Positive void coefficient. Famously stable.', snark: 'A miniseries about you is currently in pre-production. Voiced by Jared Harris.' },
  'pu239|sodium|none':    { name: 'Fast breeder',     real: true,  vibe: 'good',  verdict: 'Sodium-cooled fast reactor (SFR). Russia\'s BN-800 runs on this. So does TerraPower\'s Natrium design. Burns plutonium, breeds more.', snark: 'Just don\'t let the sodium touch water. Or air. Or look at it funny.' },
  'u238|sodium|none':     { name: 'Fast breeder',     real: true,  vibe: 'good',  verdict: 'Classic sodium-cooled fast-breeder. The BN-800 is the only one running commercially today.', snark: 'Russia has been doing this since 1980. France gave up. Japan blew up Monju.' },
  'th232|salt|graphite':  { name: 'LFTR',             real: false, vibe: 'weird', verdict: 'You\'re flirting with LFTR — a Cold War paper reactor everyone won\'t shut up about online. A 4-year demo ran at Oak Ridge in the 1960s. No commercial version has ever existed.', snark: 'You are now legally required to post about this on Twitter.' },
  'u235|salt|graphite':   { name: 'MSR',              real: false, vibe: 'weird', verdict: 'A uranium-fueled molten salt reactor. Cousin of LFTR. Several startups (Kairos, Terrestrial, ThorCon) are chasing variants.', snark: 'In 20 years this will be normal. Or laughed at. We genuinely don\'t know yet.' },
  'u238|helium|graphite': { name: 'HTGR (HTR-PM)',    real: true,  vibe: 'good',  verdict: 'A high-temperature gas-cooled reactor. China\'s HTR-PM at Shidao Bay runs this way — tennis-ball-sized graphite pebbles, helium coolant.', snark: 'It looks like a tumble dryer full of glowing marbles. Because it is.' },
  'u235|helium|graphite': { name: 'HTGR (Xe-100)',    real: true,  vibe: 'good',  verdict: 'X-energy\'s Xe-100 SMR uses this combination — TRISO fuel pebbles, helium coolant, graphite moderator. Inherently safe.', snark: 'TRISO pellets are basically uranium kibble. Sort of.' },
  'u235|leadbi|none':     { name: 'LFR',              real: false, vibe: 'weird', verdict: 'Lead-bismuth fast reactor. The Soviets cooled some submarines this way. Hyperion / Gen4 Energy have proposed civilian versions.', snark: 'Bismuth is heavy and unfortunately the only good thing about this is the name "lead-cooled."' },
  'pu239|lwater|lwater':  { name: 'MOX-fueled PWR',   real: true,  vibe: 'good',  verdict: 'Mixed-oxide fuel: plutonium recovered from spent fuel, blended with depleted uranium. France runs ~30 reactors on partial MOX cores.', snark: 'It is, in a literal sense, recycled.' },
  'dt|none|none':         { name: 'Tokamak fuel',     real: true,  vibe: 'good',  verdict: 'Fusion fuel. Confined magnetically (tokamak) or inertially (NIF). Not a "reactor" in the same sense — see §06.', snark: 'See you in 2050. Maybe.' },

  // catch some chaotic combos
  'u235|none|lwater':     { name: 'Imminent melt',    real: false, vibe: 'bad',   verdict: 'No coolant. Light water moderator that\'s also gone. The fuel is generating heat with nowhere to send it.', snark: 'Beautiful. Bad. Brief.' },
  'u235|none|none':       { name: 'Big oops',         real: false, vibe: 'bad',   verdict: 'No coolant, no moderator. Even ignoring the meltdown, fast neutrons in LEU won\'t sustain a chain reaction.', snark: 'You\'ve invented an expensive radioactive paperweight.' },
  'u238|lwater|lwater':   { name: 'Won\'t go critical', real: false, vibe: 'bad', verdict: 'Natural uranium and light water won\'t reach criticality — light water absorbs too many neutrons. The whole point of heavy water (CANDU) is solving this.', snark: 'A reactor that refuses to react. Zen.' },
  'th232|hwater|hwater':  { name: 'Indian AHWR',      real: false, vibe: 'weird', verdict: 'Thorium fuel with heavy water moderation. India\'s Advanced Heavy Water Reactor has been "almost ready" since the early 2000s.', snark: 'India: "Three Stage Nuclear Programme." World: "We\'ll wait."' },
}

const FALLBACKS: Verdict[] = [
  { name: 'Frankenreactor',   real: false, vibe: 'weird', verdict: 'No one has built anything like this. The combination is physically odd, but you could plausibly imagine a research paper proposing it.', snark: 'You have invented a reactor only PhD students will love.' },
  { name: 'Paper reactor',    real: false, vibe: 'weird', verdict: 'This combination has appeared in proposals but never in a built reactor. Probably because it\'s harder than it looks.', snark: 'A paper reactor is always cheap, always clean, always sometime in the future.' },
  { name: 'It melted',        real: false, vibe: 'bad',   verdict: 'Beautiful. Briefly. The combination of choices doesn\'t leave a path for heat to leave the core fast enough.', snark: 'Add this to the long list of materials that decided to become lava.' },
  { name: 'Subcritical heap', real: false, vibe: 'bad',   verdict: 'Won\'t reach criticality. Either the fuel isn\'t fissile enough or the moderator/coolant is eating too many neutrons.', snark: 'On the bright side: it can\'t melt down if it never started.' },
]

export function lookupVerdict(fuel: Fuel, coolant: Coolant, moderator: Moderator): Verdict {
  const key = `${fuel}|${coolant}|${moderator}` as Key
  if (TABLE[key]) return TABLE[key] as Verdict

  // heuristics for unmatched combos
  if (coolant === 'none') {
    return FALLBACKS[2]
  }
  if (fuel === 'u238' && moderator === 'lwater') {
    return FALLBACKS[3]
  }
  if (fuel === 'dt') {
    return { name: 'Half a fusion device', real: false, vibe: 'weird', verdict: 'D-T fuel without magnetic or inertial confinement is just very mild hydrogen gas. Hot, briefly. Then gone.', snark: 'Real fusion takes its own §06. Yours is closed.' }
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

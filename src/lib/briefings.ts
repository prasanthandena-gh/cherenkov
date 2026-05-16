/* =====================================================
   BRIEFINGS — single file owns the app's voice.
   Designers edit copy here without touching components.
   ===================================================== */

export interface Briefing {
  mod: string                     // e.g. "MOD.07 / CARBON LEDGER"
  title: string                   // headline
  deck: string                    // italic subtitle, the voice
  /** Optional one-liners pushed to the alert log on specific interactions */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  voice?: Record<string, string | ((...args: any[]) => string)>
  /** Frame-corner labels */
  frame: { leftTag: string; leftMeta?: string; rightTag: string; rightMeta?: string }
}

export const BRIEFINGS: Record<string, Briefing> = {
  reactors: {
    mod:   'MOD.02 / REACTOR LIBRARY',
    title: 'Reactor Family',
    deck:  'Eight archetypes. Forty years of evolution. Most still running on the same idea: boil water with nightmares.',
    frame: { leftTag: 'FIG.002 // CATALOG', leftMeta: 'GEN II → GEN IV', rightTag: 'FRAME 100412', rightMeta: 'ARCHIVE 088' },
    voice: {
      pickFamily: (name: string) => `▸ DOSSIER LOADED — ${name.toUpperCase()}. THE SPECS, THE HISTORY, THE QUIRKS.`,
      filter:     (gen: string)  => `▸ FILTER LOCKED — ${gen.toUpperCase()}.`,
    },
  },

  reactorModel: {
    mod:   'MOD.02A / DISSECT',
    title: 'Cutaway View',
    deck:  'Explode the assembly. Read the parts. Pretend you signed off on it.',
    frame: { leftTag: 'FIG.002A // DISSECT', rightTag: 'FRAME 100450', rightMeta: 'PART 0' },
    voice: {
      explode: (v: string) => `▸ EXPLODE → ${v}. PARTS DRIFTING TO ORBIT.`,
      hover:   (p: string) => `▸ INSPECTING — ${p.toUpperCase()}.`,
    },
  },

  fusion: {
    mod:   'MOD.03 / FUSION DESK',
    title: 'Confinement, Ignition, Stalling',
    deck:  '30 years away, for 70 years running. Two ways to squeeze a sun.',
    frame: { leftTag: 'FIG.003 // PLASMA', rightTag: 'FRAME 099001', rightMeta: 'CONFIG 02' },
    voice: {
      tab:        (t: string) => `▸ CHANNEL — ${t.toUpperCase()}.`,
      ignition:   '▸ IGNITION. NET GAIN. NIF DID IT FIRST, 2022.',
      fizzle:     '▸ FIZZLE. PELLET ABLATED. RECALIBRATE THE LASERS.',
      pickProject: (n: string) => `▸ PROJECT FILE — ${n.toUpperCase()}.`,
    },
  },

  fission: {
    mod:   'MOD.04 / FISSION SIM',
    title: 'Chain Reaction Sandbox',
    deck:  'Drop a neutron. Watch what happens. The control rods are right there. Don\'t blame us.',
    frame: { leftTag: 'FIG.004 // CHAIN', rightTag: 'FRAME 087712', rightMeta: 'GEN 00' },
    voice: {
      scenario:   (s: string) => `▸ SCENARIO LOADED — ${s.toUpperCase()}.`,
      supercrit:  '▸ SUPERCRITICAL — k > 1. THE NEUTRONS ARE WINNING.',
      meltdown:   '▸ MELTDOWN. EVACUATE THE METAPHOR.',
      reset:      '▸ CORE RESET — CALM, FOR NOW.',
      jettison:   '▸ CORE JETTISONED. (KIDDING. THIS BUTTON DOES NOTHING.)',
    },
  },

  sandbox: {
    mod:   'MOD.05 / DESIGN SANDBOX',
    title: 'Build Your Own Reactor',
    deck:  'Pick a fuel. Pick a coolant. Pick a moderator. The physics will judge you.',
    frame: { leftTag: 'FIG.005 // RECIPE', rightTag: 'FRAME 200110', rightMeta: 'BUILD 0' },
    voice: {
      pick:    (s: string) => `▸ ${s.toUpperCase()} SELECTED.`,
      save:    '▸ BUILD SAVED — IT\'S YOURS NOW.',
      verdict: (v: string) => `▸ VERDICT — ${v.toUpperCase()}.`,
    },
  },

  grids: {
    mod:   'MOD.06 / GRID DESK',
    title: 'Generation vs Demand',
    deck:  'Keep the frequency at 50 Hz. Don\'t blink. The sun set. Now what.',
    frame: { leftTag: 'FIG.006 // GRID', rightTag: 'FRAME 050020', rightMeta: '50.00 Hz' },
    voice: {
      nominal:  (f: string) => `▸ FREQUENCY ${f} Hz. NOMINAL. SHIFT TEA.`,
      drift:    (f: string) => `▸ DRIFT — ${f} Hz. WATCH IT.`,
      brownout: '▸ BROWNOUT — SHED LOAD OR LIGHTS GO OUT.',
      preset:   (p: string) => `▸ PRESET — ${p.toUpperCase()}.`,
    },
  },

  carbon: {
    mod:   'MOD.07 / CARBON LEDGER',
    title: 'Grams per Kilowatt-hour',
    deck:  'The bill the atmosphere eats. France whistles. Poland coughs.',
    frame: { leftTag: 'FIG.007 // gCO₂/kWh', rightTag: 'FRAME 044020', rightMeta: 'CO₂ INDEX' },
    voice: {
      pick:   (c: string) => `▸ ATMOSPHERIC LEDGER LOADED — ${c.toUpperCase()}.`,
      adjust: (src: string, dir: string) => `▸ ${src.toUpperCase()} ${dir}. THE LEDGER UPDATES.`,
    },
  },

  roadmap: {
    mod:   'MOD.08 / ROADMAP',
    title: 'Hype vs Likely',
    deck:  'Every milestone has two dates. The press release date, and the one that actually shows up.',
    frame: { leftTag: 'FIG.008 // TIMELINE', rightTag: 'FRAME 205050', rightMeta: '2024 → 2056' },
    voice: {
      mode:  (m: string) => `▸ TIMELINE MODE — ${m.toUpperCase()}.`,
      pick:  (name: string, slip: number) => slip > 0
        ? `▸ ${name.toUpperCase()} — SLIPPED ${slip} YEARS. WHO\'S COUNTING.`
        : `▸ ${name.toUpperCase()} — ON SCHEDULE. A MIRACLE.`,
    },
  },

  glossary: {
    mod:   'MOD.09 / KNOWLEDGE BASE',
    title: 'Terms, Cross-Linked',
    deck:  'Words that look harmless until you read the footnotes.',
    frame: { leftTag: 'FIG.009 // KB', rightTag: 'FRAME 051010', rightMeta: 'TERMS 51' },
    voice: {
      pick:   (term: string) => `▸ TERM OPENED — ${term.toUpperCase()}.`,
      search: (q: string)    => q ? `▸ FILTER — "${q}"` : '▸ FILTER CLEARED.',
    },
  },
}

export function getBriefing(key: keyof typeof BRIEFINGS): Briefing {
  return BRIEFINGS[key]
}

/* === Operator hints — italic flourishes shown in the empty RightRail dossier
   when no target is selected. Rotated on a slow timer. =========================== */
export const OPERATOR_HINTS: string[] = [
  'The map is a model. The reactors are real.',
  'France runs the most nuclear-dense grid on Earth. It mostly works.',
  'Click a pin. Read the dossier. Question the snark.',
  'k-effective hugs 1.0. The drama is in the third decimal place.',
  'Cooling matters more than fuel. Water is the unsung hero.',
  'Vogtle 4 cost about a Mars rover per megawatt-hour.',
  'The ticker is mostly real. Mostly.',
  'Drag the globe. Scroll to zoom. Open a country dossier from the left.',
]

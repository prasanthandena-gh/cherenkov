/* =====================================================
   Isotopes + enrichment levels for §09.
   ===================================================== */

export interface Isotope {
  symbol: string
  name: string
  protons: number
  neutrons: number
  abundance: string
  fissile: boolean
  fertile: boolean
  usedBy: string
  blurb: string
}

export const ISOTOPES: Isotope[] = [
  { symbol: '²³⁵U', name: 'Uranium-235', protons: 92, neutrons: 143, abundance: '0.72% of natural U', fissile: true, fertile: false,
    usedBy: 'Every commercial reactor (after enrichment)',
    blurb: 'The only naturally-occurring fissile nuclide. Almost the entire world\'s civil and military nuclear infrastructure rests on this one isotope.' },
  { symbol: '²³⁸U', name: 'Uranium-238', protons: 92, neutrons: 146, abundance: '99.27% of natural U', fissile: false, fertile: true,
    usedBy: 'Reactor fuel matrix · breeder feedstock',
    blurb: 'Not fissile, but fertile — absorb a neutron and beta-decay twice and you get fissile Pu-239. Hidden source of a third of any LWR\'s energy.' },
  { symbol: '²³⁹Pu', name: 'Plutonium-239', protons: 94, neutrons: 145, abundance: 'Bred — not natural', fissile: true, fertile: false,
    usedBy: 'MOX fuel · fast breeders · weapons',
    blurb: 'Made by neutron-irradiating U-238. The dual-use elephant in every fuel-cycle discussion.' },
  { symbol: '²³²Th', name: 'Thorium-232', protons: 90, neutrons: 142, abundance: '~100% of natural Th', fissile: false, fertile: true,
    usedBy: 'Indian AHWR · paper LFTRs',
    blurb: 'Three to four times more abundant than uranium. Absorb a neutron → U-233 (fissile). No country burns thorium commercially yet.' },
  { symbol: '²H / ³H', name: 'Deuterium + Tritium', protons: 1, neutrons: 1, abundance: 'D: 1 in 6,400 H · T: trace', fissile: false, fertile: false,
    usedBy: 'Fusion reactors (ITER, NIF, SPARC)',
    blurb: 'The easiest fusion fuel. D is abundant in seawater. T has a 12.3-year half-life so you have to breed it from lithium.' },
]

export interface Enrichment {
  id: string
  label: string
  range: string
  use: string
  blurb: string
  warning: boolean
}

export const ENRICHMENTS: Enrichment[] = [
  { id: 'nat',   label: 'NATURAL',   range: '0.72% U-235', use: 'CANDU, magnox',
    blurb: 'No enrichment needed — heavy water makes up for the low U-235 fraction.', warning: false },
  { id: 'leu',   label: 'LEU',       range: '3–5%',        use: 'Almost everything else',
    blurb: 'Low-Enriched Uranium. The fuel of the existing fleet of light-water reactors.', warning: false },
  { id: 'haleu', label: 'HALEU',     range: '5–20%',       use: 'Most SMRs, Gen IV',
    blurb: 'High-Assay LEU. The bottleneck of the SMR build-out — Western supply is just now spinning up.', warning: false },
  { id: 'heu',   label: 'HEU',       range: '>20%',        use: 'Naval, research, weapons',
    blurb: 'Please don\'t. Civilian use is being phased out. Above 90% is weapons-grade.', warning: true },
]

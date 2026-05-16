/* =====================================================
   TIMELINE — milestones for §12 Roadmap.
   Hype = announced. Likely = slipped realistically.
   ===================================================== */

export interface Milestone {
  hype: number
  likely: number
  label: string
  detail: string
  tone: 'fission' | 'smr' | 'fusion' | 'grid'
  side: 'above' | 'below'
  /** Other milestones (by label) that must land before this one is realistic. */
  prereqs?: string[]
}

export const TIMELINE: Milestone[] = [
  { hype: 2024, likely: 2024, label: 'Vogtle 4 online',          detail: 'First new US reactor in over three decades. Done.', tone: 'fission', side: 'above' },
  { hype: 2026, likely: 2027, label: 'SPARC first plasma',       detail: 'Commonwealth Fusion\'s HTS-magnet tokamak. The most aggressive private fusion schedule.', tone: 'fusion', side: 'below' },
  { hype: 2028, likely: 2030, label: 'BWRX-300 first power',     detail: 'OPG\'s SMR at Darlington. First Western SMR on the grid.', tone: 'smr', side: 'above' },
  { hype: 2028, likely: 2031, label: 'Natrium demo',             detail: 'TerraPower\'s sodium-cooled SMR + thermal storage at Kemmerer, WY.', tone: 'smr', side: 'below' },
  { hype: 2028, likely: 2032, label: 'Helion net electricity',   detail: 'Polaris. Microsoft is the offtaker. We will believe it when we see it.', tone: 'fusion', side: 'above',
    prereqs: ['SPARC first plasma'] },
  { hype: 2030, likely: 2032, label: 'Hinkley Point C',           detail: '3.2 GW EPR plant. Britain\'s biggest civil-engineering project.', tone: 'fission', side: 'below' },
  { hype: 2030, likely: 2035, label: '1 Gt CO₂/yr captured',     detail: 'Pathway implied by IEA Net Zero. We are not on it.', tone: 'grid', side: 'above' },
  { hype: 2034, likely: 2036, label: 'ITER first plasma',        detail: 'Slipped from 2025 to 2034 already. Now showing more slip.', tone: 'fusion', side: 'below' },
  { hype: 2035, likely: 2040, label: 'First US AP1000 fleet expansion', detail: 'New Westinghouse builds following lessons from Vogtle.', tone: 'fission', side: 'above',
    prereqs: ['Vogtle 4 online'] },
  { hype: 2039, likely: 2043, label: 'ITER D-T fuel',            detail: 'First fusion-relevant operations. Not a power plant.', tone: 'fusion', side: 'below',
    prereqs: ['ITER first plasma'] },
  { hype: 2040, likely: 2048, label: 'First HALEU surplus',      detail: 'Western enrichment finally exceeding SMR fuel demand.', tone: 'smr', side: 'above',
    prereqs: ['BWRX-300 first power', 'Natrium demo'] },
  { hype: 2050, likely: 2055, label: 'First commercial fusion',  detail: 'Generously, optimistically, almost certainly slipping.', tone: 'fusion', side: 'below',
    prereqs: ['ITER D-T fuel', 'Helion net electricity'] },
]

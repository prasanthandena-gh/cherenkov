/* =====================================================
   REACTOR FAMILY — Gen I-IV card data for §04.
   ===================================================== */

export type Gen = 'I' | 'II' | 'III' | 'III+' | 'IV'

export interface ReactorCard {
  id: string
  name: string
  gen: Gen
  country: string
  type: string
  mwe: number
  blurb: string
  fun: string
  units: number
}

export const REACTOR_CARDS: ReactorCard[] = [
  { id: 'ap1000', name: 'AP1000', gen: 'III+', country: 'USA',    type: 'PWR',         mwe: 1117, units: 6,
    blurb: 'Westinghouse\'s passive-safety flagship. Cools itself for 72 hours without operators, AC power, or external water.',
    fun: 'The "AP" is for "Advanced Passive." The "1000" is for, well, megawatts.' },
  { id: 'epr',    name: 'EPR',    gen: 'III+', country: 'France', type: 'PWR',         mwe: 1660, units: 4,
    blurb: 'Areva/Framatome\'s giant. Four redundant cooling trains, double containment, core catcher. The most over-engineered reactor in commercial use.',
    fun: 'Olkiluoto 3 took 18 years to build. Many millennia in budget years.' },
  { id: 'candu',  name: 'CANDU 6', gen: 'III', country: 'Canada', type: 'PHWR',        mwe: 700, units: 17,
    blurb: 'Heavy-water moderated, runs on natural (un-enriched) uranium. Can be refueled while operating — no shutdown needed.',
    fun: 'Designed in a country with both lots of uranium and zero enrichment plants. Necessity, mother, etc.' },
  { id: 'hualong', name: 'Hualong One', gen: 'III+', country: 'China', type: 'PWR',    mwe: 1180, units: 8,
    blurb: 'China\'s flagship export reactor. 177 fuel assemblies, double containment, mostly Chinese-designed despite borrowing from French and US ancestors.',
    fun: '"Hualong" means "Dragon" — because of course it does.' },
  { id: 'bn800',  name: 'BN-800',  gen: 'IV',  country: 'Russia', type: 'SFR (fast)',  mwe: 880, units: 1,
    blurb: 'Sodium-cooled fast-breeder. Burns plutonium, breeds more from U-238. The only commercial Gen IV reactor running today.',
    fun: 'Cooled by molten sodium, which reacts violently with both water AND air. Russian engineering: hold my vodka.' },
  { id: 'apr1400', name: 'APR-1400', gen: 'III+', country: 'S. Korea', type: 'PWR',    mwe: 1400, units: 8,
    blurb: 'Korean evolutionary PWR. The UAE\'s Barakah plant runs four of them. Built on time, on budget — uncommon for new builds.',
    fun: 'Korea built four of these in twelve years. Western projects look at this and weep.' },
  { id: 'vver1200', name: 'VVER-1200', gen: 'III+', country: 'Russia', type: 'PWR',    mwe: 1200, units: 8,
    blurb: 'Russia\'s modern export PWR — VVER lineage going back to the 1960s, with added passive cooling and core catchers.',
    fun: 'The Russian alphabet soup version of the AP1000. Comes with sanctions.' },
  { id: 'abwr',   name: 'ABWR',    gen: 'III', country: 'Japan',  type: 'BWR',         mwe: 1356, units: 5,
    blurb: 'Advanced Boiling Water Reactor — first Gen III certified reactor (1996). Reactor internal pumps eliminate the recirculation loop.',
    fun: 'Kashiwazaki has four of them, and it\'s currently the largest plant on Earth by nameplate.' },
]

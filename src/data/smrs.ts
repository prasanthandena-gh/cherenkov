/* =====================================================
   SMR cards for §05.
   ===================================================== */

export interface SmrCard {
  id: string
  name: string
  vendor: string
  type: string
  mwe: number
  country: string
  status: 'design' | 'licensing' | 'construction' | 'operating'
  blurb: string
  fun: string
}

export const SMRS: SmrCard[] = [
  { id: 'voygr',  name: 'VOYGR-12',   vendor: 'NuScale',           type: 'iPWR · LWR',     mwe: 924, country: 'USA',     status: 'licensing',
    blurb: '12 modules in a shared pool. NRC-certified design (the first SMR ever certified). First customer (UAMPS) cancelled in 2023.',
    fun: 'Twelve reactors in a hot tub. Strangely literal.' },
  { id: 'bwrx',   name: 'BWRX-300',   vendor: 'GE Hitachi',        type: 'BWR',            mwe: 300, country: 'Canada',  status: 'construction',
    blurb: 'Simplified BWR derived from the ESBWR. Ontario Power Generation broke ground at Darlington in 2024 — first western SMR construction.',
    fun: 'A BWR that finally got Marie Kondo\'d.' },
  { id: 'rrsmr',  name: 'Rolls-Royce SMR', vendor: 'Rolls-Royce',  type: 'PWR',            mwe: 470, country: 'UK',      status: 'licensing',
    blurb: 'British factory-built PWR. Yes, the engine people. They make submarine reactors too — this is the civilian cousin.',
    fun: 'A reactor with the same nameplate as your dad\'s favorite car brand.' },
  { id: 'xe100',  name: 'Xe-100',     vendor: 'X-energy',          type: 'HTGR · pebble',  mwe: 320, country: 'USA',     status: 'design',
    blurb: 'High-temperature gas-cooled, TRISO pebble fuel, helium coolant. Pursuing first deployment with Dow Chemical for industrial process heat.',
    fun: 'Fuel that looks like uranium kibble. Each pebble is its own containment vessel.' },
  { id: 'natrium', name: 'Natrium',   vendor: 'TerraPower',        type: 'SFR · fast',     mwe: 345, country: 'USA',     status: 'construction',
    blurb: 'Sodium-cooled fast reactor with a molten-salt thermal-storage tank. Can ramp up to 500 MWe for short bursts. Bill Gates\' favorite reactor.',
    fun: 'Pairs with a giant thermos. Yes, really.' },
  { id: 'ap300',  name: 'AP300',      vendor: 'Westinghouse',      type: 'iPWR · LWR',     mwe: 300, country: 'USA',     status: 'design',
    blurb: 'Single-loop PWR scaled down from the AP1000. Same passive safety, smaller footprint, faster to build.',
    fun: 'The AP1000 hit the gym. Now it\'s the AP300.' },
  { id: 'smr300', name: 'SMR-300',    vendor: 'Holtec',            type: 'iPWR · LWR',     mwe: 300, country: 'USA',     status: 'licensing',
    blurb: 'Holtec\'s integral PWR. Initial deployment planned at Palisades, where Holtec is also restarting a shut-down full-size reactor.',
    fun: 'A reactor brought to you by the people who make dry-cask spent-fuel storage.' },
  { id: 'aurora', name: 'Aurora',     vendor: 'Oklo',              type: 'SFR · micro',    mwe: 15,  country: 'USA',     status: 'design',
    blurb: 'Sealed sodium-cooled micro-reactor. Designed to run unattended for 10+ years on HALEU. Targets remote sites, AI datacenters, military.',
    fun: 'The reactor as a heat appliance you replace like a giant battery.' },
]

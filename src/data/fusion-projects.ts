/* =====================================================
   FUSION FRONTIER projects for §07.
   ===================================================== */

export type FusionCategory = 'public' | 'private' | 'ignited'
export type FusionGeometry = 'tokamak' | 'stellarator' | 'icf' | 'frc' | 'st' | 'mif'

export interface FusionProject {
  id: string
  name: string
  org: string
  country: string
  category: FusionCategory
  geometry: FusionGeometry
  milestone: string
  blurb: string
  fun: string
  lat: number
  lng: number
}

export const FUSION_PROJECTS: FusionProject[] = [
  { id: 'iter',    name: 'ITER',          org: '35 nations',       country: 'France',    category: 'public',  geometry: 'tokamak',
    lat: 43.706, lng: 5.760,             // Cadarache
    milestone: 'FIRST PLASMA · 2034',
    blurb: 'The flagship public tokamak. Target Q=10 (ten times energy out vs in to the plasma). First D-T operations in 2039.',
    fun: 'On schedule slipped sideways. Costs measured in geopolitics.' },
  { id: 'nif',     name: 'NIF',           org: 'LLNL',             country: 'USA',       category: 'ignited', geometry: 'icf',
    lat: 37.41, lng: -121.71,            // Livermore, CA
    milestone: 'Q_FUEL > 1 · 2022',
    blurb: '192 lasers, one fuel pellet. First device ever to put out more fusion energy than the lasers deposited.',
    fun: 'The lasers consumed 300 MJ from the grid. We have a long way to go.' },
  { id: 'w7x',     name: 'Wendelstein 7-X', org: 'IPP',           country: 'Germany',   category: 'public',  geometry: 'stellarator',
    lat: 54.07, lng: 13.40,              // Greifswald
    milestone: 'STEADY STATE · 30 MIN',
    blurb: 'The world\'s most advanced stellarator. 50 pretzel-shaped superconducting coils confine the plasma without an internal current.',
    fun: 'Engineers built the coils to ±1 mm. Across 16 meters. The plasma noticed.' },
  { id: 'sparc',   name: 'SPARC',         org: 'Commonwealth',     country: 'USA',       category: 'private', geometry: 'tokamak',
    lat: 42.54, lng: -71.60,             // Devens, MA
    milestone: 'FIRST PLASMA · 2026',
    blurb: 'MIT spin-out using high-temperature superconducting (HTS) magnets to shrink ITER physics into a much smaller, faster machine.',
    fun: 'Strapped tokamak physics to better magnets. Skipping a decade.' },
  { id: 'polaris', name: 'Polaris',       org: 'Helion',           country: 'USA',       category: 'private', geometry: 'frc',
    lat: 47.97, lng: -122.20,            // Everett, WA
    milestone: 'NET ELECTRICITY · 2028',
    blurb: 'Field-reversed-configuration approach using D-He3. Compresses plasma rings into each other; harvests electricity directly from the expanding plasma — no steam cycle.',
    fun: 'Microsoft has pre-ordered the power. We\'ll see who blinks first.' },
  { id: 'copernicus', name: 'Copernicus', org: 'TAE',              country: 'USA',       category: 'private', geometry: 'frc',
    lat: 33.69, lng: -117.66,            // Foothill Ranch, CA
    milestone: 'NET ENERGY · LATE 2020s',
    blurb: 'TAE pursues p-B11 (aneutronic) fusion using field-reversed configurations. Hardest physics, cleanest waste.',
    fun: 'They keep changing their company name every funding round. We give up tracking.' },
  { id: 'st40',    name: 'ST-40 / E1',    org: 'Tokamak Energy',   country: 'UK',        category: 'private', geometry: 'st',
    lat: 51.61, lng: -1.27,              // Milton Park, UK
    milestone: '100M °C · 2022',
    blurb: 'Spherical tokamak — squashed-donut geometry that\'s mechanically more efficient. Now scaling toward E1, a pilot plant.',
    fun: 'A tokamak that\'s been put through a tortilla press.' },
  { id: 'm3',      name: 'M3',            org: 'First Light',      country: 'UK',        category: 'private', geometry: 'mif',
    lat: 51.72, lng: -1.26,              // Oxford
    milestone: 'PROJECTILE FUSION · 2024',
    blurb: 'Projectile-driven inertial confinement. They literally shoot a fuel target at hypersonic speeds. Aiming for Q=1 by late 2020s.',
    fun: 'Fusion via "hit it really hard with another rock."' },
]

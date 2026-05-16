/* =====================================================
   REACTOR DATABASE
   Real lat/lng coordinates for the world's commercial reactors.
   Used by Globe.tsx and section galleries.
   ===================================================== */

export type ReactorStatus = 'active' | 'paused' | 'ghost'

export interface Reactor {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  capGW: number        // 0 for ghost / non-operational
  status: ReactorStatus
  year: number         // year online OR year decommissioned
  type?: string        // PWR, BWR, CANDU, etc.
  note?: string
  kind?: 'smr' | 'fusion' | 'custom'   // optional classification
  fun?: string         // quirky one-liner, shown in italic in dossier
}

export const REACTORS: Reactor[] = [
  // === NORTH AMERICA ===
  { id: 'us-vogtle',   name: 'Vogtle',           country: 'USA',         lat: 33.14,  lng: -81.76,  capGW: 4.5, status: 'active', year: 1987, type: 'PWR',
    note: 'Newest US nuclear build. Units 3 & 4 came online 2023/24, the first new US reactors in three decades.',
    fun: 'Built so slowly its Wikipedia page outgrew the containment dome.' },
  { id: 'us-palo',     name: 'Palo Verde',       country: 'USA',         lat: 33.39,  lng: -112.86, capGW: 3.9, status: 'active', year: 1988, type: 'PWR',
    note: 'Largest US plant by output. The only nuclear plant on Earth not sited on a major body of water — uses treated wastewater for cooling.',
    fun: 'Cools itself on the desert\'s pee. Truly an engineering flex.' },
  { id: 'us-indian',   name: 'Indian Point',     country: 'USA',         lat: 41.27,  lng: -73.95,  capGW: 0,   status: 'ghost',  year: 2021,
    note: 'Closed in 2021 over environmental concerns. 25 miles from Times Square.' },
  { id: 'us-tmi',      name: 'Three Mile Island',country: 'USA',         lat: 40.15,  lng: -76.72,  capGW: 0.8, status: 'active', year: 1974, type: 'PWR',
    note: 'Unit 2 partial meltdown in 1979 — the worst US commercial reactor accident. Unit 1 kept running until 2019.',
    fun: 'The China Syndrome opened twelve days before the accident. Marketing budget unspent.' },
  { id: 'us-shoreham', name: 'Shoreham',         country: 'USA',         lat: 40.96,  lng: -72.87,  capGW: 0,   status: 'ghost',  year: 1989,
    note: 'Completed, tested at low power, then abandoned over evacuation-plan disputes. Long Island ratepayers paid the $6B bill over 30 years.',
    fun: 'Cost six billion dollars to be allergic to plugging in.' },
  { id: 'ca-bruce',    name: 'Bruce',            country: 'Canada',      lat: 44.32,  lng: -81.60,  capGW: 6.4, status: 'active', year: 1977, type: 'CANDU',
    note: 'Largest operational nuclear plant on Earth by output. Eight CANDU reactors on Lake Huron.',
    fun: 'Eight reactors named Bruce. Canada keeps it simple.' },
  { id: 'mx-laguna',   name: 'Laguna Verde',     country: 'Mexico',      lat: 19.72,  lng: -96.41,  capGW: 1.6, status: 'active', year: 1990, type: 'BWR' },

  // === SOUTH AMERICA ===
  { id: 'br-angra',    name: 'Angra',            country: 'Brazil',      lat: -23.01, lng: -44.46,  capGW: 1.9, status: 'active', year: 1985, type: 'PWR' },
  { id: 'ar-atucha',   name: 'Atucha',           country: 'Argentina',   lat: -33.97, lng: -59.21,  capGW: 1.7, status: 'active', year: 1974, type: 'PHWR' },

  // === WESTERN EUROPE ===
  { id: 'uk-hinkley',  name: 'Hinkley Point C',  country: 'UK',          lat: 51.21,  lng: -3.13,   capGW: 3.2, status: 'paused', year: 2030, type: 'EPR',
    note: 'Under construction. EPR design, expected online late 2020s. The most expensive object ever built in Britain.' },
  { id: 'fr-graveline',name: 'Gravelines',       country: 'France',      lat: 50.99,  lng:  2.14,   capGW: 5.4, status: 'active', year: 1980, type: 'PWR',
    note: 'Europe\'s largest nuclear site. France runs the world\'s most nuclear-heavy grid — about 70% of electricity.' },
  { id: 'fr-cattenom', name: 'Cattenom',         country: 'France',      lat: 49.42,  lng:  6.22,   capGW: 5.2, status: 'active', year: 1986, type: 'PWR' },
  { id: 'fr-civaux',   name: 'Civaux',           country: 'France',      lat: 46.46,  lng:  0.65,   capGW: 2.9, status: 'active', year: 1997, type: 'PWR' },
  { id: 'es-almaraz',  name: 'Almaraz',          country: 'Spain',       lat: 39.81,  lng: -5.70,   capGW: 2.0, status: 'active', year: 1981, type: 'PWR' },
  { id: 'de-isar',     name: 'Isar 2',           country: 'Germany',     lat: 48.61,  lng: 12.29,   capGW: 0,   status: 'ghost',  year: 2023,
    note: 'Germany shut down its final reactors on 15 April 2023, ending a 23-year nuclear phaseout.' },
  { id: 'at-zwent',    name: 'Zwentendorf',      country: 'Austria',     lat: 48.35,  lng: 15.88,   capGW: 0,   status: 'ghost',  year: 1978,
    note: 'Built, fueled, switched off by a single referendum before going critical. Now used as a film set and training facility.',
    fun: 'Voted against existing. Currently moonlighting in disaster movies.' },
  { id: 'be-doel',     name: 'Doel',             country: 'Belgium',     lat: 51.32,  lng:  4.27,   capGW: 2.9, status: 'active', year: 1974, type: 'PWR' },
  { id: 'ch-leibst',   name: 'Leibstadt',        country: 'Switzerland', lat: 47.60,  lng:  8.18,   capGW: 1.2, status: 'active', year: 1984, type: 'BWR' },
  { id: 'se-forsmark', name: 'Forsmark',         country: 'Sweden',      lat: 60.40,  lng: 18.18,   capGW: 3.2, status: 'active', year: 1980, type: 'BWR' },
  { id: 'fi-olki',     name: 'Olkiluoto',        country: 'Finland',     lat: 61.24,  lng: 21.44,   capGW: 4.4, status: 'active', year: 1978, type: 'BWR/EPR',
    note: 'OL3 (EPR) finally synced to the grid in 2023 after 18 years of construction. One of the most over-budget projects in industrial history.',
    fun: 'Spent 18 years being assembled. Will eventually outlive us all.' },
  { id: 'cz-temelin',  name: 'Temelín',          country: 'Czechia',     lat: 49.18,  lng: 14.38,   capGW: 2.0, status: 'active', year: 2000, type: 'VVER' },

  // === EASTERN EUROPE / RUSSIA ===
  { id: 'ua-zapor',    name: 'Zaporizhzhia',     country: 'Ukraine',     lat: 47.51,  lng: 34.59,   capGW: 5.7, status: 'paused', year: 1985, type: 'VVER',
    note: 'Europe\'s largest nuclear plant. In cold shutdown since 2022, under military occupation. The IAEA maintains a permanent monitoring presence.' },
  { id: 'ua-cherno',   name: 'Chernobyl',        country: 'Ukraine',     lat: 51.39,  lng: 30.10,   capGW: 3.0, status: 'active', year: 1977, type: 'RBMK',
    note: 'Reactor 4 exploded on 26 April 1986. The remaining units kept generating power until 2000. The original ghost — and the namesake of the genre.',
    fun: 'The only reactor with its own miniseries. Audiobook bigger than reality.' },
  { id: 'ru-lenin',    name: 'Leningrad',        country: 'Russia',      lat: 59.85,  lng: 29.05,   capGW: 4.4, status: 'active', year: 1974, type: 'RBMK/VVER' },
  { id: 'ru-kalinin',  name: 'Kalinin',          country: 'Russia',      lat: 57.91,  lng: 35.05,   capGW: 4.0, status: 'active', year: 1984, type: 'VVER' },
  { id: 'ru-bele',     name: 'Beloyarsk',        country: 'Russia',      lat: 56.84,  lng: 61.32,   capGW: 1.5, status: 'active', year: 1980, type: 'BN-800',
    note: 'Home of the BN-800 sodium-cooled fast-breeder reactor. One of only two commercial fast reactors operating today.',
    fun: 'Cooled by molten sodium. Spectacular when it leaks. Spectacular as a design.' },

  // === MIDDLE EAST / ASIA ===
  { id: 'tr-akkuyu',   name: 'Akkuyu',           country: 'Türkiye',     lat: 36.14,  lng: 33.54,   capGW: 1.2, status: 'paused', year: 2025, type: 'VVER',
    note: 'Turkey\'s first nuclear plant. Russian-built, slowly bringing units online.' },
  { id: 'ae-barakah',  name: 'Barakah',          country: 'UAE',         lat: 23.97,  lng: 52.20,   capGW: 5.6, status: 'active', year: 2020, type: 'APR-1400',
    note: 'All four Korean APR-1400 units online — the Arabian Peninsula\'s first nuclear plant.' },
  { id: 'in-tarapur',  name: 'Tarapur',          country: 'India',       lat: 19.83,  lng: 72.66,   capGW: 1.4, status: 'active', year: 1969, type: 'BWR',
    note: 'India\'s oldest reactor — still running, 57 years after first sync.',
    fun: 'Older than the moon landing. Younger than the Beatles.' },
  { id: 'in-kudan',    name: 'Kudankulam',       country: 'India',       lat:  8.17,  lng: 77.71,   capGW: 2.0, status: 'active', year: 2013, type: 'VVER' },

  // === CHINA ===
  { id: 'cn-daya',     name: 'Daya Bay',         country: 'China',       lat: 22.60,  lng: 114.55,  capGW: 3.9, status: 'active', year: 1994, type: 'PWR' },
  { id: 'cn-tian',     name: 'Tianwan',          country: 'China',       lat: 34.69,  lng: 119.46,  capGW: 6.7, status: 'active', year: 2007, type: 'VVER/Hualong' },
  { id: 'cn-haiy',     name: 'Haiyang',          country: 'China',       lat: 36.71,  lng: 121.16,  capGW: 2.5, status: 'active', year: 2018, type: 'AP1000' },
  { id: 'cn-fuq',      name: 'Fuqing',           country: 'China',       lat: 25.71,  lng: 119.45,  capGW: 6.7, status: 'active', year: 2014, type: 'Hualong One',
    note: 'Home of Hualong One — China\'s flagship reactor and primary export model.' },
  { id: 'cn-shidao',   name: 'Shidao Bay',       country: 'China',       lat: 36.84,  lng: 122.43,  capGW: 0.2, status: 'active', year: 2021, type: 'HTR-PM',
    note: 'World\'s first operating commercial high-temperature gas-cooled reactor.',
    fun: 'Runs on tennis-ball-sized pebbles of graphite. Yes, really.' },

  // === KOREA / JAPAN ===
  { id: 'kr-hanul',    name: 'Hanul',            country: 'S. Korea',    lat: 37.09,  lng: 129.38,  capGW: 6.0, status: 'active', year: 1988, type: 'OPR-1000' },
  { id: 'kr-kori',     name: 'Kori',             country: 'S. Korea',    lat: 35.32,  lng: 129.29,  capGW: 7.5, status: 'active', year: 1978, type: 'PWR' },
  { id: 'jp-kashi',    name: 'Kashiwazaki',      country: 'Japan',       lat: 37.43,  lng: 138.59,  capGW: 7.9, status: 'paused', year: 1985, type: 'ABWR',
    note: 'Largest plant on Earth by capacity. Mostly idle since Fukushima; restart of certain units now proceeding.',
    fun: 'Sleeping giant of the Pacific — has more nameplate than most countries.' },
  { id: 'jp-fuku',     name: 'Fukushima Daiichi',country: 'Japan',       lat: 37.42,  lng: 141.03,  capGW: 0,   status: 'ghost',  year: 2011,
    note: 'Meltdown 11 March 2011 following the Tōhoku earthquake and tsunami. Decommissioning projected through the 2050s.' },
  { id: 'jp-genkai',   name: 'Genkai',           country: 'Japan',       lat: 33.51,  lng: 129.84,  capGW: 2.4, status: 'active', year: 1975, type: 'PWR' },

  // === PHILIPPINES / AFRICA ===
  { id: 'ph-bataan',   name: 'Bataan',           country: 'Philippines', lat: 14.62,  lng: 120.34,  capGW: 0,   status: 'ghost',  year: 1986,
    note: 'A $2.3B Westinghouse PWR completed in 1984. Marcos fell before it could be fueled. Forty years of tropical heat and indecision.',
    fun: 'Forty years of tropical heat, zero kilowatts. A tribute to political timing.' },
  { id: 'za-koeberg',  name: 'Koeberg',          country: 'S. Africa',   lat: -33.68, lng: 18.43,   capGW: 1.9, status: 'active', year: 1984, type: 'PWR',
    note: 'Africa\'s only commercial nuclear plant.' },
]

// =====================================================
// NATION LEADERBOARD
// fleet = real-world operational reactors (IAEA PRIS Nov 2025)
// pins  = number of REACTORS pins on the globe for this country
//         (derived at module init from REACTORS array)
// =====================================================

export interface NationRow {
  rank: number
  name: string
  /** REACTORS pins matching this country */
  pins: number
  /** Real-world operating units (IAEA PRIS, Nov 2025) */
  fleet: number
}

// Map our REACTORS country labels → display name in leaderboard
const COUNTRY_DISPLAY: Record<string, string> = {
  'USA':         'United States',
  'France':      'France',
  'China':       'China',
  'Russia':      'Russia',
  'Japan':       'Japan',
  'S. Korea':    'South Korea',
  'India':       'India',
  'Canada':      'Canada',
  'Ukraine':     'Ukraine',
  'UK':          'United Kingdom',
  'Germany':     'Germany',
  'Spain':       'Spain',
  'Sweden':      'Sweden',
  'Belgium':     'Belgium',
  'Czechia':     'Czechia',
  'Switzerland': 'Switzerland',
  'Finland':     'Finland',
  'Türkiye':     'Türkiye',
  'UAE':         'UAE',
  'Brazil':      'Brazil',
  'Argentina':   'Argentina',
  'Mexico':      'Mexico',
  'S. Africa':   'South Africa',
  'Austria':     'Austria',
  'Philippines': 'Philippines',
}

// Real-world counts of operational reactors per country, IAEA PRIS Nov 2025
const FLEET_COUNT: Record<string, number> = {
  'United States':  94,
  'France':         57,
  'China':          57,
  'Russia':         36,
  'Japan':          33,
  'South Korea':    26,
  'India':          23,
  'Canada':         19,
  'Ukraine':        15,
  'United Kingdom':  9,
  'Spain':           7,
  'Sweden':          6,
  'Czechia':         6,
  'Belgium':         5,
  'Switzerland':     4,
  'Finland':         5,
  'Pakistan':        6,
  'Slovakia':        5,
  'Hungary':         4,
  'Argentina':       3,
  'Brazil':          2,
  'Bulgaria':        2,
  'Mexico':          2,
  'Romania':         2,
  'South Africa':    2,
  'Türkiye':         1,
  'UAE':             4,
  'Belarus':         2,
  'Iran':            1,
  'Slovenia':        1,
  'Armenia':         1,
  'Netherlands':     1,
  'Bangladesh':      0,
  'Egypt':           0,
  'Austria':         0,
  'Germany':         0,    // shut down their entire fleet in 2023
  'Philippines':     0,
}

function buildLeaderboard(): NationRow[] {
  const pinsByCountry: Record<string, number> = {}
  for (const r of REACTORS) {
    const display = COUNTRY_DISPLAY[r.country] ?? r.country
    pinsByCountry[display] = (pinsByCountry[display] ?? 0) + 1
  }
  // Union of countries with either pins or a fleet entry
  const all = new Set([...Object.keys(pinsByCountry), ...Object.keys(FLEET_COUNT)])
  const rows: NationRow[] = []
  for (const name of all) {
    rows.push({
      rank: 0, // assigned after sort
      name,
      pins: pinsByCountry[name] ?? 0,
      fleet: FLEET_COUNT[name] ?? 0,
    })
  }
  rows.sort((a, b) => b.fleet - a.fleet || b.pins - a.pins)
  rows.forEach((r, i) => { r.rank = i + 1 })
  return rows
}

export const NATION_LEADERBOARD: NationRow[] = buildLeaderboard()

/** Highest fleet count in the leaderboard — used to scale the dual-fill bar. */
export const MAX_FLEET = NATION_LEADERBOARD.reduce((m, n) => Math.max(m, n.fleet), 0)

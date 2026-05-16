/* =====================================================
   KNOWLEDGE BASE — glossary entries for the drawer.
   Wrap inline terms with <KbTerm slug="..."> to open the drawer here.
   ===================================================== */

export interface KbEntry {
  slug: string
  term: string
  short: string
  long: string
  related?: string[]
}

export const KB: KbEntry[] = [
  {
    slug: 'criticality',
    term: 'Criticality',
    short: 'When a chain reaction sustains itself — each fission produces, on average, exactly one fission in the next generation.',
    long: 'A reactor is "critical" when k-effective equals 1.0. Below 1 (subcritical) the reaction dies out. Above 1 (supercritical) it grows. Bombs use a brief supercritical excursion. Reactors hold k-eff at 1 within tiny margins, adjusted second-by-second by control rods and other feedback. The word sounds dramatic but it just means "steady state."',
    related: ['control-rod', 'moderator', 'k-effective'],
  },
  {
    slug: 'k-effective',
    term: 'k-effective',
    short: 'The multiplication factor: average number of next-generation fissions per current fission.',
    long: 'k_eff = 1 → critical. < 1 → subcritical. > 1 → supercritical. In a stable reactor it sits within 0.001 of 1. Operators control it via rod positions, coolant flow, and (slowly) fuel burn-up.',
    related: ['criticality'],
  },
  {
    slug: 'moderator',
    term: 'Moderator',
    short: 'A material that slows neutrons so they can split more U-235.',
    long: 'Fast neutrons fly through uranium nuclei without much interaction. Slow ("thermal") neutrons are far more likely to cause fission. Light water, heavy water, and graphite are the three main moderators in commercial use. CANDU reactors use heavy water; everyone else uses light water; RBMK reactors used graphite.',
    related: ['fission', 'thermal-neutron'],
  },
  {
    slug: 'thermal-neutron',
    term: 'Thermal neutron',
    short: 'A neutron slowed to ~0.025 eV — about the same energy as the surrounding atoms.',
    long: 'After bouncing through a moderator, neutrons reach thermal equilibrium with the atoms around them. At that energy, the probability of being absorbed by U-235 (and triggering fission) jumps by orders of magnitude versus a fast neutron.',
  },
  {
    slug: 'control-rod',
    term: 'Control rod',
    short: 'A neutron-absorbing rod that can be inserted into the core to slow or stop the chain reaction.',
    long: 'Typically made of boron, cadmium, or hafnium — elements with high neutron-absorption cross-sections. Drop them all the way in and the reactor "scrams" (shuts down). Pull them out and reactivity rises.',
    related: ['scram'],
  },
  {
    slug: 'scram',
    term: 'SCRAM',
    short: 'Emergency shutdown — all control rods fully inserted in seconds.',
    long: 'Folk etymology says "Safety Control Rod Axe Man" from Fermi\'s Chicago Pile, where a man stood by with an axe to cut a rope holding a safety rod. Probably apocryphal. The name stuck either way.',
  },
  {
    slug: 'fission',
    term: 'Fission',
    short: 'Splitting a heavy nucleus into lighter pieces, releasing energy and free neutrons.',
    long: 'A free neutron is absorbed by a U-235 nucleus. The nucleus deforms, then splits into two roughly-half-sized fragments plus 2-3 new neutrons. About 200 MeV is released per event, mostly as kinetic energy of the fragments — which turns into heat as they collide with surrounding atoms.',
    related: ['u235', 'criticality'],
  },
  {
    slug: 'fusion',
    term: 'Fusion',
    short: 'Forcing two light nuclei together, releasing energy when the product is more stable.',
    long: 'D + T → He-4 + n + 17.6 MeV is the easiest reaction to ignite, which is why every near-term project chases it. The catch: the two positively-charged nuclei repel each other, so you need temperatures of ~100 million °C to give them enough thermal energy to fuse.',
    related: ['deuterium', 'tritium', 'tokamak'],
  },
  {
    slug: 'u235',
    term: 'U-235',
    short: 'The 235-mass isotope of uranium — the only naturally-occurring nuclide that fissions easily with slow neutrons.',
    long: '0.72% of natural uranium. Almost every commercial reactor burns this. Enrichment increases its share above natural levels — LEU (3-5%) for most reactors, HALEU (5-20%) for several next-gen designs, HEU (>20%) for naval / research reactors.',
    related: ['enrichment', 'u238'],
  },
  {
    slug: 'u238',
    term: 'U-238',
    short: '99.27% of natural uranium. Not fissile with thermal neutrons, but fertile.',
    long: 'A fast neutron can convert U-238 → Pu-239, which IS fissile. This is how breeder reactors work: they make more fuel than they burn. Most of the energy in any uranium reactor secretly comes from Pu-239 bred from U-238 mid-cycle.',
    related: ['pu239', 'breeder'],
  },
  {
    slug: 'pu239',
    term: 'Pu-239',
    short: 'A fissile plutonium isotope, bred from U-238 inside reactors.',
    long: 'Created when U-238 absorbs a neutron, then beta-decays twice. Plutonium is recovered by reprocessing spent fuel. About a third of the energy in a typical PWR comes from Pu-239 bred and fissioned mid-cycle. Also: weapons.',
  },
  {
    slug: 'th232',
    term: 'Th-232',
    short: 'Thorium — fertile, becomes fissile U-233 when it absorbs a neutron.',
    long: 'Three to four times more abundant in Earth\'s crust than uranium. No commercial reactor burns thorium today, but India and China both have programs, and molten-salt advocates have been talking about it since the 1960s.',
    related: ['lftr'],
  },
  {
    slug: 'deuterium',
    term: 'Deuterium',
    short: 'Hydrogen with one neutron. About 1 in every 6,400 hydrogen atoms in seawater.',
    long: 'Abundant, stable, the lighter half of the D-T fusion fuel. Heavy water (D₂O) is also a neutron moderator used in CANDU reactors.',
  },
  {
    slug: 'tritium',
    term: 'Tritium',
    short: 'Hydrogen with two neutrons. Radioactive (12.3-year half-life), so you mostly have to make it.',
    long: 'Bred inside fusion reactors by colliding neutrons with lithium. Today\'s entire civilian supply is a few tens of kilograms, mostly from CANDU reactors. ITER and follow-ons aim to breed their own tritium from lithium blankets surrounding the plasma.',
  },
  {
    slug: 'tokamak',
    term: 'Tokamak',
    short: 'A donut-shaped magnetic-confinement fusion device — currently the dominant approach.',
    long: 'Russian for "toroidal chamber, magnetic coils." Plasma circulates inside a torus, confined by a combination of toroidal magnets and a current induced in the plasma itself. ITER, JET, SPARC, EAST, KSTAR — all tokamaks.',
    related: ['stellarator', 'fusion'],
  },
  {
    slug: 'stellarator',
    term: 'Stellarator',
    short: 'An alternative magnetic-confinement geometry — twisted, plasma-stable, harder to build.',
    long: 'Uses elaborately shaped external magnets to confine the plasma without an internal current. Harder to manufacture (the W7-X coils are pretzel-shaped) but the plasma is more stable. Wendelstein 7-X in Germany is the modern flagship.',
  },
  {
    slug: 'icf',
    term: 'Inertial confinement',
    short: 'Compress a fuel pellet so fast that inertia holds it together long enough to fuse.',
    long: 'Lasers (or X-rays from a hohlraum) hit a millimeter-sized D-T pellet symmetrically, imploding it. The fuel reaches densities hundreds of times that of lead for billionths of a second. NIF achieved net fusion energy gain this way in December 2022.',
    related: ['nif'],
  },
  {
    slug: 'nif',
    term: 'NIF',
    short: 'National Ignition Facility — first device to achieve scientific energy gain from fusion.',
    long: '192 lasers, Lawrence Livermore. On 5 December 2022, an ICF shot deposited 2.05 MJ on a pellet and recovered 3.15 MJ from the fusion reaction. Q (fuel) > 1 for the first time. The lasers themselves consumed ~300 MJ from the grid, so "wall-plug" Q is still small.',
  },
  {
    slug: 'iter',
    term: 'ITER',
    short: '35-nation tokamak under construction in France. Designed for Q=10.',
    long: 'First plasma planned 2034 (slipped from 2025). D-T operations from 2039. Not a power plant — a physics experiment at power-plant scale.',
  },
  {
    slug: 'q-value',
    term: 'Q (fusion)',
    short: 'Energy out divided by energy in. Q=1 is "breakeven." Power plants need Q >> 1.',
    long: 'Comes in flavors: Q_plasma (out of fuel / into fuel), Q_engineering (electricity out / electricity in), Q_wall-plug. NIF\'s 2022 shot was Q_fuel ≈ 1.5; the lasers were maybe Q_wall-plug 0.01.',
  },
  {
    slug: 'breeder',
    term: 'Breeder reactor',
    short: 'A reactor that produces more fissile material than it consumes.',
    long: 'Usually fast-neutron and sodium-cooled. Russia\'s BN-800 is the only commercial breeder running. Generates Pu-239 from U-238 (or U-233 from Th-232). Long-promised for closing the fuel cycle and unlocking ~100x more energy from existing uranium.',
  },
  {
    slug: 'lwr',
    term: 'LWR',
    short: 'Light Water Reactor — uses ordinary water as moderator and coolant. ~80% of all reactors.',
    long: 'Two main flavors: PWR (pressurized, water stays liquid, separate steam loop) and BWR (boiling, steam goes straight to the turbine). Cheap, well-understood, but require enriched fuel.',
  },
  {
    slug: 'pwr',
    term: 'PWR',
    short: 'Pressurized Water Reactor — water at 150 bar, never boils in the core.',
    long: 'Heat is transferred via a secondary loop to a steam generator, which spins the turbine. AP1000, EPR, VVER, Hualong, APR-1400 are all PWRs. Most common power-reactor design in the world.',
  },
  {
    slug: 'bwr',
    term: 'BWR',
    short: 'Boiling Water Reactor — water boils right in the core, steam straight to turbine.',
    long: 'Simpler than a PWR (no steam generator) but the entire turbine sees mildly radioactive steam. Fukushima and Kashiwazaki are BWRs.',
  },
  {
    slug: 'candu',
    term: 'CANDU',
    short: 'CANadian Deuterium Uranium — uses heavy water and natural (un-enriched) uranium.',
    long: 'Heavy water is a better moderator than light water, so the design can sustain a chain reaction without enrichment. Trade-off: heavy water is expensive to make. Bruce and Darlington (Canada), Cernavoda (Romania), Atucha (Argentina).',
  },
  {
    slug: 'smr',
    term: 'SMR',
    short: 'Small Modular Reactor — 50 to 300 MWe, factory-built, transportable.',
    long: 'Bet against gigawatt-scale construction: smaller plants are simpler to license, can be mass-produced, and don\'t require remote sites with cooling rivers. VOYGR, BWRX-300, Natrium, Aurora, Xe-100 are leading designs.',
    related: ['microreactor'],
  },
  {
    slug: 'microreactor',
    term: 'Microreactor',
    short: 'Under ~20 MWe. Truck-portable. Aimed at remote mines, military bases, disaster relief.',
    long: 'Oklo\'s Aurora and BWXT\'s Project Pele are early examples. Sealed cores, run for 10+ years without refueling.',
  },
  {
    slug: 'enrichment',
    term: 'Enrichment',
    short: 'Raising the U-235 fraction of uranium above the natural 0.72%.',
    long: 'Done via gas centrifuges spinning UF₆ — heavier U-238 drifts to the wall, lighter U-235 stays near the axis. LEU (3-5%) for most reactors. HALEU (5-20%) for many advanced designs. HEU (>20%) for naval and research reactors. Above ~90% is weapons-grade.',
  },
  {
    slug: 'leu',
    term: 'LEU',
    short: 'Low-Enriched Uranium — 3 to 5% U-235. The fuel for almost every commercial reactor today.',
    long: 'Adequate for LWRs given the moderation provided by ordinary water.',
  },
  {
    slug: 'haleu',
    term: 'HALEU',
    short: 'High-Assay LEU — 5 to 20% U-235. Required by many advanced reactor designs.',
    long: 'Western HALEU supply is the biggest bottleneck for the SMR build-out. Currently most production is in Russia.',
  },
  {
    slug: 'heu',
    term: 'HEU',
    short: 'Highly-Enriched Uranium — >20% U-235. Naval reactors, research reactors, weapons.',
    long: 'Civilian use is being phased out under non-proliferation programs.',
  },
  {
    slug: 'lftr',
    term: 'LFTR',
    short: 'Liquid Fluoride Thorium Reactor — molten-salt design fueled with thorium.',
    long: 'Proposed in the 1960s at Oak Ridge. A small demonstration (the MSRE) ran for 4 years. Never commercialized. Often hyped online as a clean-energy panacea — the real engineering is genuinely tricky, especially the chemistry of fluoride salts.',
  },
  {
    slug: 'fuel-cycle',
    term: 'Fuel cycle',
    short: 'The path of uranium from ore through enrichment, use, and disposal or reprocessing.',
    long: '"Once-through" (US): mine, enrich, burn, store. "Closed" (France, Russia): mine, enrich, burn, reprocess to recover plutonium and unfissioned U, fabricate new fuel.',
  },
  {
    slug: 'spent-fuel',
    term: 'Spent fuel',
    short: 'Used reactor fuel — still highly radioactive, still ~95% U-238 + U-235.',
    long: 'Cooled in on-site pools for ~5 years, then transferred to dry casks. Yucca Mountain was the intended US permanent repository; it has been politically blocked for decades. Finland\'s Onkalo is the first deep geological repository to begin operation.',
  },
  {
    slug: 'cherenkov',
    term: 'Cherenkov radiation',
    short: 'The eerie blue glow from spent fuel pools — light from charged particles moving faster than light in water.',
    long: 'Discovered by Pavel Cherenkov in 1934. Particles travel faster than the local speed of light in the medium (not c in vacuum), producing a shockwave of photons. Pretty. Also the name of this site.',
  },
  {
    slug: 'gen4',
    term: 'Gen IV',
    short: 'A category covering six next-gen reactor concepts: SFR, LFR, GFR, MSR, SCWR, VHTR.',
    long: 'Defined by the Generation IV International Forum in 2002. None are commercial yet. Common goals: better fuel efficiency, less long-lived waste, passive safety, resistance to proliferation.',
  },
  {
    slug: 'passive-safety',
    term: 'Passive safety',
    short: 'Systems that work without operator action, AC power, or active controls.',
    long: 'Gravity, convection, thermal expansion. AP1000 cools itself for 72 hours without operators or pumps. SMRs lean heavily on this.',
  },
  {
    slug: 'dac',
    term: 'DAC',
    short: 'Direct Air Capture — machines that pull CO₂ from open atmosphere.',
    long: 'Energy-intensive: every ton of CO₂ removed takes ~1-2 MWh of energy and heat. Nuclear reactors output exactly the kind of low-carbon process heat that DAC needs.',
  },
  {
    slug: 'ccs',
    term: 'CCS',
    short: 'Carbon Capture and Storage — capture CO₂ at the point of emission, inject it underground.',
    long: 'Cheaper than DAC per ton but only works for point sources (gas plants, cement, steel).',
  },
  {
    slug: 'gco2-kwh',
    term: 'gCO₂/kWh',
    short: 'Lifecycle emissions intensity. Nuclear ~12. Wind ~11. Solar ~40. Gas ~490. Coal ~820.',
    long: 'Includes mining, manufacturing, construction, operation, decommissioning. Nuclear sits with wind/hydro at the low end. Gas is roughly 40x dirtier per kWh. Coal is ~70x dirtier.',
  },
  {
    slug: 'capacity-factor',
    term: 'Capacity factor',
    short: 'Actual output / theoretical max output. Nuclear ~93%. Wind ~35%. Solar ~25%.',
    long: 'A 1 GW nuclear plant produces ~8 TWh/year. A 1 GW wind farm produces ~3 TWh/year. This is why "capacity" alone misleads.',
  },
  {
    slug: 'baseload',
    term: 'Baseload',
    short: 'Continuous electricity demand that runs 24/7. Nuclear, geothermal, and hydro are the natural baseload sources.',
    long: 'Fossil baseload is being retired. Replacing it with intermittent wind/solar + storage works in principle; in practice, nuclear remains the cheapest dispatchable carbon-free option for many grids.',
  },
  {
    slug: 'grid',
    term: 'Grid',
    short: 'The interconnected system of generators, transmission lines, and loads.',
    long: 'Frequency must stay within ~0.1 Hz of nominal (50/60 Hz). Generation and load must match instantaneously — there is essentially no storage on most grids. This is what "the grid is balanced" means in operator-speak.',
    related: ['smart-grid', 'hvdc'],
  },
  {
    slug: 'smart-grid',
    term: 'Smart grid',
    short: 'A grid with sensors, two-way communication, and automated response.',
    long: 'Smart meters, dynamic pricing, demand response, distributed energy resources (DERs). The traditional grid was one-way (plant → home). A smart grid handles bidirectional flow from rooftop solar, EV chargers, batteries.',
  },
  {
    slug: 'microgrid',
    term: 'Microgrid',
    short: 'A small grid that can run connected to the main grid or "island" off it.',
    long: 'Common on military bases, hospitals, remote communities. Increasingly proposed as a model for SMR deployment.',
  },
  {
    slug: 'hvdc',
    term: 'HVDC',
    short: 'High-Voltage Direct Current transmission — moves bulk power over long distances with low loss.',
    long: 'AC works fine over hundreds of km. For thousands of km, DC is cheaper. China\'s Changji-Guquan UHV DC line moves 12 GW over 3,300 km. The NorNed cable between Norway and the Netherlands runs 580 km undersea.',
  },
  {
    slug: 'vpp',
    term: 'VPP',
    short: 'Virtual Power Plant — an aggregator that orchestrates many small distributed assets as one.',
    long: 'Combine 50,000 home batteries and you have a 200 MW dispatchable resource you can bid into wholesale markets. Tesla, Sunrun, Octopus all run VPPs.',
  },
  {
    slug: 'rbmk',
    term: 'RBMK',
    short: 'The Soviet graphite-moderated, water-cooled reactor type — Chernobyl was an RBMK-1000.',
    long: 'Positive void coefficient: when coolant boils, reactivity rises. That feedback drove the 1986 runaway. Remaining RBMKs were heavily modified after; a few are still operating in Russia.',
  },
  {
    slug: 'meltdown',
    term: 'Meltdown',
    short: 'Loss of cooling → core temperature exceeds fuel melting point → fuel slumps.',
    long: 'Three Mile Island had a partial melt. Chernobyl had a graphite fire on top of melt. Fukushima had three melts after the tsunami knocked out backup power. Not a "nuclear explosion" — that requires a very different geometry and high enrichment.',
  },
  {
    slug: 'half-life',
    term: 'Half-life',
    short: 'Time for half a population of radioactive atoms to decay.',
    long: 'U-238: 4.5 billion years. U-235: 700 million. Pu-239: 24,000. Cs-137: 30. Tritium: 12.3. I-131: 8 days. The very-long-lived stuff is barely radioactive precisely because it decays slowly.',
  },
]

export const KB_BY_SLUG: Record<string, KbEntry> = Object.fromEntries(KB.map(e => [e.slug, e]))

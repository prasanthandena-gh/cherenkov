/* =====================================================
   REACTOR MODELS — manifests for the dissectable 3D viewer.
   Each manifest maps an archetype id to a list of part builders
   with positions. Many gallery cards map to the same manifest.
   ===================================================== */

import type { BuilderKey } from '../lib/reactor-parts'

export interface PartSpec {
  id: string
  build: BuilderKey
  pos: [number, number, number]
  scale?: number
  color?: number
  info: {
    partName: string
    blurb: string
    kbSlug?: string
  }
}

export interface ReactorModelManifest {
  id: string
  kind: string
  name: string
  short: string
  parts: PartSpec[]
}

/* --- PWR generic --- */
const PWR_GENERIC: ReactorModelManifest = {
  id: 'pwr-generic',
  kind: 'pwr',
  name: 'PRESSURIZED WATER REACTOR',
  short: 'Most common civilian reactor type. ~80% of the operating fleet.',
  parts: [
    { id: 'dome',    build: 'containmentDome', pos: [0, 0.4, 0],
      info: { partName: 'Containment Dome', blurb: 'Meter-thick steel-reinforced concrete shell. Designed to survive an unintentional aircraft impact.', kbSlug: 'pwr' } },
    { id: 'vessel',  build: 'pressureVessel',  pos: [0, 0.0, 0],
      info: { partName: 'Pressure Vessel', blurb: 'Holds water at 150 bar / 320°C. Bus-sized forging, never opened during operation.', kbSlug: 'pwr' } },
    { id: 'fuel',    build: 'fuelAssemblies',  pos: [0, -0.05, 0],
      info: { partName: 'Fuel Assemblies', blurb: 'Stacks of UO₂ pellets in zirconium tubes. 3-5% enriched U-235.', kbSlug: 'leu' } },
    { id: 'rods',    build: 'controlRods',     pos: [0, 0.3, 0],
      info: { partName: 'Control Rods', blurb: 'Boron / hafnium. Inserted between fuel assemblies. Drop them all → scram.', kbSlug: 'control-rod' } },
    { id: 'sg',      build: 'steamGenerator',  pos: [1.4, 0.05, 0],
      info: { partName: 'Steam Generator', blurb: 'Heat-exchanger between the radioactive primary loop and the clean secondary loop driving the turbine.' } },
    { id: 'turb',    build: 'turbine',         pos: [2.6, 0.05, 0],
      info: { partName: 'Turbine + Generator', blurb: 'Where steam pressure becomes electricity. Same mechanical setup as any thermal plant.' } },
    { id: 'cool',    build: 'coolingTower',    pos: [3.8, -0.4, 0],
      info: { partName: 'Cooling Tower', blurb: 'Rejects waste heat to atmosphere. The visible plume is water vapor, not radioactivity.' } },
  ],
}

/* --- BWR generic --- */
const BWR_GENERIC: ReactorModelManifest = {
  id: 'bwr-generic',
  kind: 'bwr',
  name: 'BOILING WATER REACTOR',
  short: 'Water boils inside the reactor vessel — steam goes straight to the turbine.',
  parts: [
    { id: 'dome',    build: 'containmentDome',  pos: [0, 0.4, 0],
      info: { partName: 'Containment', blurb: 'Includes a suppression pool below the vessel to absorb a steam release.', kbSlug: 'bwr' } },
    { id: 'vessel',  build: 'pressureVessel',   pos: [0, 0.0, 0], scale: 1.1,
      info: { partName: 'Reactor Pressure Vessel', blurb: 'Larger than a PWR vessel — water actually boils inside it.', kbSlug: 'bwr' } },
    { id: 'fuel',    build: 'fuelAssemblies',   pos: [0, -0.05, 0],
      info: { partName: 'Fuel Assemblies', blurb: 'UO₂ pellets in zirc tubes. 2-5% enriched.', kbSlug: 'leu' } },
    { id: 'rods',    build: 'controlRods',      pos: [0, -0.4, 0],
      info: { partName: 'Control Rods (bottom)', blurb: 'Unlike a PWR, BWRs insert control rods from BELOW the core.', kbSlug: 'control-rod' } },
    { id: 'turb',    build: 'turbine',          pos: [2.0, 0.05, 0],
      info: { partName: 'Turbine + Generator', blurb: 'Sees mildly radioactive steam directly from the core. Built into the same building.' } },
    { id: 'cool',    build: 'coolingTower',     pos: [3.2, -0.4, 0],
      info: { partName: 'Cooling Tower', blurb: 'Rejects waste heat.' } },
  ],
}

/* --- CANDU (heavy water) --- */
const CANDU: ReactorModelManifest = {
  id: 'candu',
  kind: 'candu',
  name: 'CANDU PHWR',
  short: 'Heavy-water moderated, natural uranium. Refuels online.',
  parts: [
    { id: 'calandria', build: 'pressureVessel', pos: [0, 0.05, 0], scale: 1.4, color: 0x4cc8ff,
      info: { partName: 'Calandria', blurb: 'Horizontal tank of heavy water (D₂O) at low pressure. Fuel channels run through it.', kbSlug: 'candu' } },
    { id: 'fuel',    build: 'fuelAssemblies', pos: [0, 0.05, 0], scale: 1.4,
      info: { partName: 'Fuel Channels', blurb: 'Hundreds of horizontal tubes — natural uranium pellets in zirconium bundles.', kbSlug: 'candu' } },
    { id: 'sg',      build: 'steamGenerator', pos: [1.4, 0.1, 0],
      info: { partName: 'Steam Generator', blurb: 'D₂O carries heat to ordinary water in the steam generator.' } },
    { id: 'turb',    build: 'turbine',        pos: [2.6, 0.1, 0],
      info: { partName: 'Turbine + Generator', blurb: 'Conventional once-through steam cycle.' } },
    { id: 'cool',    build: 'coolingTower',   pos: [3.8, -0.4, 0],
      info: { partName: 'Lake Cooling', blurb: 'Most CANDUs sit on the Great Lakes and use lake water directly.' } },
  ],
}

/* --- HTGR pebble bed --- */
const HTGR_PEBBLE: ReactorModelManifest = {
  id: 'htgr-pebble',
  kind: 'htgr',
  name: 'HTR-PM PEBBLE BED',
  short: 'TRISO fuel pebbles cooled by helium. Inherently safe.',
  parts: [
    { id: 'vessel',  build: 'pressureVessel', pos: [0, 0.1, 0], scale: 1.2, color: 0xfacc15,
      info: { partName: 'Pressure Vessel', blurb: 'Holds the pebble bed and helium coolant at ~70 bar.', kbSlug: 'gen4' } },
    { id: 'pebbles', build: 'pebble',         pos: [0, 0.0, 0],
      info: { partName: 'Pebble Bed', blurb: '~440,000 graphite pebbles, each containing thousands of TRISO microspheres of UO₂.', kbSlug: 'gen4' } },
    { id: 'sg',      build: 'steamGenerator', pos: [1.4, 0.1, 0],
      info: { partName: 'Steam Generator', blurb: 'Helium → water heat exchanger. Outlet temp ~750°C — useful for hydrogen + chemistry.' } },
    { id: 'turb',    build: 'turbine',        pos: [2.6, 0.1, 0],
      info: { partName: 'Turbine + Generator', blurb: 'Conventional Rankine cycle today; future versions may go direct-cycle helium Brayton.' } },
    { id: 'cool',    build: 'coolingTower',   pos: [3.8, -0.4, 0],
      info: { partName: 'Cooling Tower', blurb: 'Atmospheric reject.' } },
  ],
}

/* --- SFR fast breeder --- */
const SFR_FAST: ReactorModelManifest = {
  id: 'sfr-fast',
  kind: 'sfr',
  name: 'SODIUM FAST REACTOR',
  short: 'Liquid-sodium-cooled, fast-spectrum, breeds Pu-239 from U-238.',
  parts: [
    { id: 'pool',    build: 'sodiumPool',     pos: [0, -0.2, 0],
      info: { partName: 'Sodium Pool', blurb: 'Primary sodium pool sits at near-atmospheric pressure — no pressurization risk.', kbSlug: 'breeder' } },
    { id: 'vessel',  build: 'pressureVessel', pos: [0, 0.05, 0], scale: 0.8, color: 0xff8c00,
      info: { partName: 'Core', blurb: 'Fast-spectrum core. No moderator needed.', kbSlug: 'breeder' } },
    { id: 'fuel',   build: 'fuelAssemblies', pos: [0, 0.05, 0], scale: 0.9, color: 0xa371ff,
      info: { partName: 'MOX Fuel', blurb: 'Mixed oxide — UO₂ + PuO₂. Burns plutonium, breeds more.', kbSlug: 'pu239' } },
    { id: 'sg',     build: 'steamGenerator',  pos: [1.4, 0.1, 0], color: 0x4cc8ff,
      info: { partName: 'Intermediate Heat Exchanger', blurb: 'Primary sodium → secondary sodium → water. Two loops to keep any sodium-water reactions far from the core.' } },
    { id: 'turb',   build: 'turbine',         pos: [2.6, 0.1, 0],
      info: { partName: 'Turbine + Generator', blurb: 'Standard steam cycle.' } },
  ],
}

/* --- SMR integral --- */
const SMR_INTEGRAL: ReactorModelManifest = {
  id: 'smr-integral',
  kind: 'smr',
  name: 'INTEGRAL PWR — SMR',
  short: 'Integral pressurizer + steam generators inside the vessel.',
  parts: [
    { id: 'dome',    build: 'containmentDome', pos: [0, 0.3, 0], scale: 0.7,
      info: { partName: 'Containment', blurb: 'Often submerged in a water pool. Passive cooling for days without external power.', kbSlug: 'passive-safety' } },
    { id: 'vessel',  build: 'pressureVessel',  pos: [0, 0.0, 0], scale: 0.85,
      info: { partName: 'Integral Vessel', blurb: 'Steam generator + pressurizer + core in one vessel — eliminates large piping.', kbSlug: 'smr' } },
    { id: 'fuel',    build: 'fuelAssemblies',  pos: [0, -0.05, 0], scale: 0.7,
      info: { partName: 'Fuel Assemblies', blurb: 'Standard UO₂ at LEU or HALEU.', kbSlug: 'haleu' } },
    { id: 'rods',    build: 'controlRods',     pos: [0, 0.2, 0], scale: 0.7,
      info: { partName: 'Control Rods', blurb: 'Drop-in, gravity-driven SCRAM.', kbSlug: 'scram' } },
    { id: 'turb',    build: 'turbine',         pos: [1.6, 0.05, 0], scale: 0.8,
      info: { partName: 'Turbine Module', blurb: 'Compact turbine often ships pre-assembled from the factory.' } },
  ],
}

/* --- MSR molten salt --- */
const MSR_SALT: ReactorModelManifest = {
  id: 'msr-salt',
  kind: 'msr',
  name: 'MOLTEN SALT REACTOR',
  short: 'Fuel dissolved in fluoride salt. Low pressure, high temperature.',
  parts: [
    { id: 'vessel', build: 'moltenSaltVessel', pos: [0, 0.0, 0],
      info: { partName: 'Salt Reactor Vessel', blurb: 'Fuel salt circulates through this vessel.', kbSlug: 'lftr' } },
    { id: 'sg',     build: 'steamGenerator',   pos: [1.4, 0.1, 0], color: 0xff4081,
      info: { partName: 'Salt-to-Salt Heat Exchanger', blurb: 'Primary fuel salt to secondary clean salt.' } },
    { id: 'turb',   build: 'turbine',          pos: [2.6, 0.1, 0],
      info: { partName: 'Turbine + Generator', blurb: 'Often a supercritical CO₂ cycle in modern designs.' } },
  ],
}

/* --- Microreactor sealed --- */
const MICROREACTOR_SEALED: ReactorModelManifest = {
  id: 'microreactor-sealed',
  kind: 'microreactor',
  name: 'MICROREACTOR (SEALED CORE)',
  short: 'Truck-portable. 10+ years on a single fuel load. No on-site refueling.',
  parts: [
    { id: 'body',  build: 'microreactor', pos: [0, 0.0, 0],
      info: { partName: 'Sealed Core', blurb: 'Factory-fueled, factory-sealed. Site never sees fuel handling.', kbSlug: 'microreactor' } },
    { id: 'turb',  build: 'turbine',      pos: [1.2, 0.0, 0], scale: 0.7,
      info: { partName: 'Power Conversion', blurb: 'Often a Brayton or sCO₂ cycle for compactness.' } },
  ],
}

/* --- Tokamak (fusion) --- */
const TOKAMAK_FUSION: ReactorModelManifest = {
  id: 'tokamak-fusion',
  kind: 'fusion',
  name: 'TOKAMAK',
  short: 'Magnetic donut holding a fusion plasma.',
  parts: [
    { id: 'shell', build: 'moltenSaltVessel', pos: [0, 0.0, 0], scale: 1.5, color: 0xff4081,
      info: { partName: 'Vacuum Vessel', blurb: 'Toroidal vacuum chamber holding the plasma.', kbSlug: 'tokamak' } },
    { id: 'coils', build: 'coolantLoop',      pos: [0, 0.0, 0], scale: 1.2, color: 0xa371ff,
      info: { partName: 'Toroidal Field Coils', blurb: 'Superconducting magnets shape and contain the plasma.', kbSlug: 'tokamak' } },
  ],
}

/* ---------- TABLE ---------- */

const ALL_MANIFESTS: ReactorModelManifest[] = [
  PWR_GENERIC, BWR_GENERIC, CANDU, HTGR_PEBBLE, SFR_FAST,
  SMR_INTEGRAL, MSR_SALT, MICROREACTOR_SEALED, TOKAMAK_FUSION,
]

/** Lookup by either manifest id OR gallery card id (alias). */
export const REACTOR_MODELS: Record<string, ReactorModelManifest> = {}

ALL_MANIFESTS.forEach(m => { REACTOR_MODELS[m.id] = m })

// Aliases — every gallery card id → a manifest
const ALIASES: Record<string, string> = {
  // Family
  ap1000:   'pwr-generic',
  epr:      'pwr-generic',
  candu:    'candu',
  hualong:  'pwr-generic',
  bn800:    'sfr-fast',
  apr1400:  'pwr-generic',
  vver1200: 'pwr-generic',
  abwr:     'bwr-generic',
  // SMRs
  voygr:    'smr-integral',
  bwrx:     'bwr-generic',
  rrsmr:    'smr-integral',
  xe100:    'htgr-pebble',
  natrium:  'sfr-fast',
  ap300:    'smr-integral',
  smr300:   'smr-integral',
  aurora:   'microreactor-sealed',
}
for (const [alias, target] of Object.entries(ALIASES)) {
  REACTOR_MODELS[alias] = REACTOR_MODELS[target]
}

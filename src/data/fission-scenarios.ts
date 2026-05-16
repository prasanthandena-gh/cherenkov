/* =====================================================
   FISSION SCENARIOS — preset configurations for the sim.
   ===================================================== */

export type Scenario = 'reactor' | 'bomb' | 'scram' | 'breeder' | 'subcritical'

export interface ScenarioConfig {
  label: string
  baseK: number
  rodVisible: boolean
  rodInsertion: number
  fuelLabel: string
  tone: 'signal' | 'crit' | 'warn' | 'ok' | 'ghost'
  blurb: string
  /** Italic flourish — surfaces in the dossier & note card */
  snark?: string
}

export const SCENARIOS: Record<Scenario, ScenarioConfig> = {
  reactor: {
    label: 'REACTOR', baseK: 1.0, rodVisible: true, rodInsertion: 0.5,
    fuelLabel: 'LEU U-235', tone: 'signal',
    blurb: 'Steady-state. Rods at ~50%. Drag a rod up to push k-eff past 1 and watch the cascade.',
    snark: 'The most heavily-instrumented kettle in human history.',
  },
  bomb: {
    label: 'BOMB', baseK: 2.0, rodVisible: false, rodInsertion: 0,
    fuelLabel: 'PU-239 @ HEU', tone: 'crit',
    blurb: 'No rods. No mercy. Cascade unbounded.',
    snark: 'Demonstration only. Do not attempt at home, work, or country.',
  },
  scram: {
    label: 'SCRAM TEST', baseK: 1.05, rodVisible: true, rodInsertion: 0.2,
    fuelLabel: 'LEU U-235', tone: 'warn',
    blurb: 'Supercritical baseline. Hit SCRAM to slam all rods in.',
    snark: 'SCRAM allegedly stands for "Safety Control Rod Axe Man." Allegedly.',
  },
  breeder: {
    label: 'BREEDER', baseK: 1.0, rodVisible: true, rodInsertion: 0.3,
    fuelLabel: 'PU-239 / U-238', tone: 'ok',
    blurb: 'Fast-spectrum. Burns plutonium, breeds more from U-238.',
    snark: 'Cooled by molten sodium. Spectacular when it leaks.',
  },
  subcritical: {
    label: 'SUBCRITICAL', baseK: 0.85, rodVisible: true, rodInsertion: 0.8,
    fuelLabel: 'NAT U', tone: 'ghost',
    blurb: 'Cannot sustain. Each cascade dies out.',
    snark: 'Like trying to start a fire with two slightly damp matches.',
  },
}

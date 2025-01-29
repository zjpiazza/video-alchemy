export interface EffectDefinition {
  label: string;
  filterCommand: string;
}

export const effects: Record<string, EffectDefinition> = {
  none: {
    label: 'Original',
    filterCommand: ''
  },
  grayscale: {
    label: 'Grayscale',
    filterCommand: '-vf colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3'
  },
  sepia: {
    label: 'Sepia',
    filterCommand: '-vf colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131'
  },
  invert: {
    label: 'Invert Colors',
    filterCommand: '-vf negate'
  }
} as const

export type Effect = keyof typeof effects

export const getFFmpegFilterCommand = (effect: Effect): string => {
  return effects[effect].filterCommand
} 
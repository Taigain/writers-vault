export type Palette = { key: string; ru: string; en: string; colors: string[] }

export const PALETTES: Palette[] = [
  {
    key: 'warm',
    ru: 'Тёплая',
    en: 'Warm',
    colors: ['#8c3a2b', '#2f6d4f', '#3d6b8c', '#7a3b6e', '#20655d', '#8a5a2b', '#555555', '#33691e'],
  },
  {
    key: 'cb',
    ru: 'Дальтоник-безопасная',
    en: 'Color-blind safe',
    colors: ['#0072B2', '#E69F00', '#009E73', '#D55E00', '#999999', '#CC79A7', '#F0E442', '#56B4E9'],
  },
  {
    key: 'mono',
    ru: 'Моно-контрастная',
    en: 'Mono contrast',
    colors: ['#e8d9b0', '#c9b483', '#a98f5e', '#8a744c', '#6d5c3e', '#554832', '#3e3427', '#2a241b'],
  },
]

const LS_KEY = 'wv-palette'

export function getPalette(): Palette {
  try {
    const k = localStorage.getItem(LS_KEY)
    return PALETTES.find((p) => p.key === k) ?? PALETTES[0]
  } catch {
    return PALETTES[0]
  }
}

export function setPalette(key: string) {
  try {
    localStorage.setItem(LS_KEY, key)
  } catch {
    /* ignore */
  }
}
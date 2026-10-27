export type PremiumKey = 'cloudSync' | 'worldCalendar' | 'dictGroups' | 'seriesRelations' | 'inlineImages'

export const PREMIUM_LAUNCH = false

export const PREMIUM_CATALOG: Record<PremiumKey, { visible: 'hidden' | 'badge' }> = {
  cloudSync: { visible: 'hidden' },
  worldCalendar: { visible: 'hidden' },
  dictGroups: { visible: 'hidden' },
  seriesRelations: { visible: 'hidden' },
  inlineImages: { visible: 'hidden' },
}

export const premiumShown = (k: PremiumKey) => PREMIUM_CATALOG[k].visible === 'badge'
import type { Lang } from './i18n'

export const ROLES = [
  { key: 'protagonist', ru: 'Протагонист (главный герой)', en: 'Protagonist (main hero)' },
  { key: 'antagonist', ru: 'Антагонист (злодей / соперник)', en: 'Antagonist (villain / rival)' },
  { key: 'tritagonist', ru: 'Тритагонист (лучший друг / возлюбленная)', en: 'Tritagonist (best friend / love interest)' },
  { key: 'secondary', ru: 'Второстепенный персонаж', en: 'Secondary character' },
  { key: 'episodic', ru: 'Эпизодический персонаж', en: 'Episodic character' },
  { key: 'background', ru: 'Массовка', en: 'Background cast' },
] as const

export type RoleKey = (typeof ROLES)[number]['key']

export function roleLabel(key: string | null | undefined, lang: Lang = 'ru'): string {
  const r = ROLES.find((x) => x.key === key)
  if (!r) return lang === 'ru' ? 'Второстепенный персонаж' : 'Secondary character'
  return lang === 'ru' ? r.ru : r.en
}
import { cookies } from 'next/headers'
import type { Lang } from './i18n'

export async function getLang(): Promise<Lang> {
  try {
    const store = await cookies()
    return store.get('wv-lang')?.value === 'en' ? 'en' : 'ru'
  } catch {
    return 'ru'
  }
}
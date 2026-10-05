export type DashStyle = 'en' | 'em'

export const DASH_CHAR: Record<DashStyle, string> = { en: '–', em: '—' }

const LS = 'wv-dash'

export function getDashStyle(): DashStyle {
  try {
    return localStorage.getItem(LS) === 'em' ? 'em' : 'en'
  } catch {
    return 'en'
  }
}

export function setDashStyle(s: DashStyle) {
  try {
    localStorage.setItem(LS, s)
  } catch {
    /* ignore */
  }
}

export const replaceDashes = (t: string, style: DashStyle) => t.replace(/--/g, DASH_CHAR[style])
'use client'

import { useEffect, useState } from 'react'
import { Sun, Type, FolderOpen, Trash2, Languages, Feather, Heart } from 'lucide-react'
import { saveDirHandle, getSavedDirName, clearSavedDir } from '@/lib/fsAccess'
import { useLang, setLangEverywhere } from '@/lib/useLang'
import type { Lang, StrKey } from '@/lib/i18n'
import { APP_NAME, APP_VERSION, APP_AUTHOR, APP_YEAR, DONATE_LINKS } from '@/lib/appinfo'
import AutosaveSetting from '@/components/AutosaveSetting'
import CheckUpdatesButton from '@/components/CheckUpdatesButton'
import ContactForm from '@/components/ContactForm'

const UI_FONTS: { key: string; labelKey: StrKey; stack: string }[] = [
  { key: 'system', labelKey: 'fontSystem', stack: '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif' },
  { key: 'georgia-ui', labelKey: 'fontGeorgiaUi', stack: 'Georgia, "Times New Roman", serif' },
  { key: 'verdana', labelKey: 'fontVerdana', stack: 'Verdana, Geneva, sans-serif' },
  { key: 'courier', labelKey: 'fontCourier', stack: '"Courier New", monospace' },
]

const WRITE_FONTS: { key: string; labelKey: StrKey; stack: string }[] = [
  { key: 'georgia', labelKey: 'fontGeorgia', stack: 'Georgia, "Times New Roman", serif' },
  { key: 'times', labelKey: 'fontTimes', stack: '"Times New Roman", Times, serif' },
  { key: 'pt-serif', labelKey: 'fontPtSerif', stack: '"PT Serif", Georgia, serif' },
  { key: 'courier', labelKey: 'fontCourier', stack: '"Courier New", monospace' },
  { key: 'verdana', labelKey: 'fontVerdana', stack: 'Verdana, Geneva, sans-serif' },
]

export default function SettingsPage() {
  const { lang, t } = useLang()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [uiFont, setUiFont] = useState('system')
  const [writeFont, setWriteFont] = useState('georgia')
  const [dirName, setDirName] = useState<string | null>(null)

  useEffect(() => {
    setTheme((localStorage.getItem('wv-theme') as 'light' | 'dark') ?? 'light')
    setUiFont(localStorage.getItem('wv-font-ui-key') ?? 'system')
    setWriteFont(localStorage.getItem('wv-font-write-key') ?? 'georgia')
    setDirName(getSavedDirName())
  }, [])

  const switchLang = (next: Lang) => {
    setLangEverywhere(next)
    window.location.reload()
  }

  const applyTheme = (v: 'light' | 'dark') => {
    setTheme(v)
    localStorage.setItem('wv-theme', v)
    document.documentElement.dataset.theme = v
  }

  const applyUiFont = (key: string) => {
    const f = UI_FONTS.find((x) => x.key === key) ?? UI_FONTS[0]
    setUiFont(key)
    localStorage.setItem('wv-font-ui-key', key)
    localStorage.setItem('wv-font-ui', f.stack)
    document.documentElement.style.setProperty('--font-ui', f.stack)
  }

  const applyWriteFont = (key: string) => {
    const f = WRITE_FONTS.find((x) => x.key === key) ?? WRITE_FONTS[0]
    setWriteFont(key)
    localStorage.setItem('wv-font-write-key', key)
    localStorage.setItem('wv-font-write', f.stack)
    document.documentElement.style.setProperty('--font-write', f.stack)
  }

  const pickFolder = async () => {
    const w = window as unknown as {
      showDirectoryPicker?: (o: { mode: string }) => Promise<FileSystemDirectoryHandle>
    }
    if (!w.showDirectoryPicker) {
      alert(t('setFolderUnsupported'))
      return
    }
    try {
      const handle = await w.showDirectoryPicker({ mode: 'readwrite' })
      await saveDirHandle(handle)
      setDirName(handle.name)
    } catch {
      /* отменено */
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 anim-fade">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t('setTitle')}</h1>

      <section className="card p-5 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Languages size={16} /> {t('setLang')}
        </h2>
        <div className="tabs-bar">
          <button type="button" className={`tab ${lang === 'ru' ? 'tab-active' : ''}`} onClick={() => switchLang('ru')}>
            Русский
          </button>
          <button type="button" className={`tab ${lang === 'en' ? 'tab-active' : ''}`} onClick={() => switchLang('en')}>
            English
          </button>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--soft)' }}>{t('setLangHint')}</p>
      </section>

      <section className="card p-5 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sun size={16} /> {t('setTheme')}
        </h2>
        <div className="tabs-bar">
          <button type="button" className={`tab ${theme === 'light' ? 'tab-active' : ''}`} onClick={() => applyTheme('light')}>
            {t('setLight')}
          </button>
          <button type="button" className={`tab ${theme === 'dark' ? 'tab-active' : ''}`} onClick={() => applyTheme('dark')}>
            {t('setDark')}
          </button>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--soft)' }}>{t('setThemeHint')}</p>
      </section>

      <section className="card p-5 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Type size={16} /> {t('setFonts')}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">{t('setFontUi')}</label>
            <select className="input" value={uiFont} onChange={(e) => applyUiFont(e.target.value)}>
              {UI_FONTS.map((f) => (
                <option key={f.key} value={f.key}>{t(f.labelKey)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">{t('setFontWrite')}</label>
            <select className="input" value={writeFont} onChange={(e) => applyWriteFont(e.target.value)}>
              {WRITE_FONTS.map((f) => (
                <option key={f.key} value={f.key}>{t(f.labelKey)}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FolderOpen size={16} /> {t('setFolder')}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary btn-sm" onClick={pickFolder}>
            <FolderOpen size={14} /> {t('setFolderPick')}
          </button>
          {dirName && (
            <>
              <span className="chip">{dirName}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  await clearSavedDir()
                  setDirName(null)
                }}
              >
                <Trash2 size={13} /> {t('setFolderReset')}
              </button>
            </>
          )}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--soft)' }}>{t('setFolderHint')}</p>
      </section>

      <section className="card p-5">
        <div className="text-sm font-bold mb-2">{t('setEditor')}</div>
        <AutosaveSetting />
      </section>
      
      <section className="card p-5 mt-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Feather size={16} /> {t('aboutTitle')}
        </h2>
        <div className="space-y-1 text-sm" style={{ color: 'var(--soft)' }}>
          <CheckUpdatesButton />
          <div>{APP_NAME} · {t('aboutVersion')} {APP_VERSION}</div>
          <div>{t('aboutAuthor')}: {APP_AUTHOR}</div>
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-sm font-bold mb-2">{t('ctTitle')}</div>
          <ContactForm />
        </div>
          <div>© {APP_YEAR} {APP_AUTHOR}. {t('aboutRights')}</div>
        </div>
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--soft)' }}>{t('aboutThanksHint')}</div>
          <div className="flex flex-wrap gap-2">
            {DONATE_LINKS.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <Heart size={13} /> {l.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
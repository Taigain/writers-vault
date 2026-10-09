'use client'

import { useEffect, useState } from 'react'
import {
  Sun,
  Type,
  FolderOpen,
  Trash2,
  Languages,
  Feather,
  Heart,
  History,
  PanelLeftClose,
} from 'lucide-react'
import { saveDirHandle, getSavedDirName, clearSavedDir } from '@/lib/fsAccess'
import { useLang, setLangEverywhere } from '@/lib/useLang'
import type { Lang, StrKey } from '@/lib/i18n'
import { APP_NAME, APP_VERSION, APP_AUTHOR, APP_YEAR, DONATE_LINKS } from '@/lib/appinfo'
import AutosaveSetting from '@/components/AutosaveSetting'
import CheckUpdatesButton from '@/components/CheckUpdatesButton'
import ContactForm from '@/components/ContactForm'
import ChangelogButton from '@/components/ChangelogButton'
import QuoteStyleSetting from '@/components/QuoteStyleSetting'
import PaletteSetting from '@/components/PaletteSetting'
import DashSetting from '@/components/DashSetting'
import FontPicker from '@/components/FontPicker'

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
  const [sbAuto, setSbAutoState] = useState('1')
  useEffect(() => {
    setSbAutoState(localStorage.getItem('wv-sb-auto') ?? '1')
  }, [])
  const setSbAuto = (v: '1' | '0') => {
    setSbAutoState(v)
    localStorage.setItem('wv-sb-auto', v)
  }

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
    <div className="page-wrap mx-auto px-8 py-10 anim-fade">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('setTitle')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--soft)' }}>{t('setSub')}</p>
      </header>

      <div className="set-label">{t('setGroupLook')}</div>
      <div className="card set-card mb-6">
        <div className="set-row">
          <Languages size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{t('setLang')}</div>
            <div className="set-h">{t('setLangHint')}</div>
          </div>
          <div className="set-ctl">
            <button
              type="button"
              className={`chip-btn ${lang === 'ru' ? 'chip-btn-active' : ''}`}
              onClick={() => switchLang('ru')}
            >
              Русский
            </button>
            <button
              type="button"
              className={`chip-btn ${lang === 'en' ? 'chip-btn-active' : ''}`}
              onClick={() => switchLang('en')}
            >
              English
            </button>
          </div>
        </div>
        <div className="set-row">
          <Sun size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{t('setTheme')}</div>
            <div className="set-h">{t('setThemeHint')}</div>
          </div>
          <div className="set-ctl">
            <button
              type="button"
              className={`chip-btn ${theme === 'light' ? 'chip-btn-active' : ''}`}
              onClick={() => applyTheme('light')}
            >
              {t('setLight')}
            </button>
            <button
              type="button"
              className={`chip-btn ${theme === 'dark' ? 'chip-btn-active' : ''}`}
              onClick={() => applyTheme('dark')}
            >
              {t('setDark')}
            </button>
          </div>
        </div>
        <div className="set-row">
          <PanelLeftClose size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{t('setSbAuto')}</div>
            <div className="set-h">{t('setSbAutoHint')}</div>
          </div>
          <div className="set-ctl">
            <button
              type="button"
              className={`chip-btn ${sbAuto === '1' ? 'chip-btn-active' : ''}`}
              onClick={() => setSbAuto('1')}
            >
              {t('setOn')}
            </button>
            <button
              type="button"
              className={`chip-btn ${sbAuto === '0' ? 'chip-btn-active' : ''}`}
              onClick={() => setSbAuto('0')}
            >
              {t('setOff')}
            </button>
          </div>
        </div>
        <div className="set-row">
          <Type size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{t('setFontUi')}</div>
          </div>
          <div className="set-ctl">
         <FontPicker
           value={uiFont}
           options={UI_FONTS.map((f) => ({ key: f.key, label: t(f.labelKey), stack: f.stack }))}
           onChange={applyUiFont}
         />
          </div>
        </div>
        <div className="set-row">
          <Feather size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{t('setFontWrite')}</div>
          </div>
          <div className="set-ctl">
            <FontPicker
              value={writeFont}
              options={WRITE_FONTS.map((f) => ({ key: f.key, label: t(f.labelKey), stack: f.stack }))}
              onChange={applyWriteFont}
            />
          </div>
        </div>
      </div>

      <div className="set-label">{t('setGroupWork')}</div>
      <div className="card set-card mb-6">
        <div className="set-row">
          <FolderOpen size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{t('setFolder')}</div>
            <div className="set-h">{t('setFolderHint')}</div>
          </div>
          <div className="set-ctl">
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
            <button type="button" className="btn btn-primary btn-sm" onClick={pickFolder}>
              <FolderOpen size={14} /> {t('setFolderPick')}
            </button>
          </div>
        </div>
      </div>

      <div className="set-label">{t('setGroupEditor')}</div>
      <div className="card set-card mb-6">
        <div className="set-block"><AutosaveSetting /></div>
        <div className="set-block"><QuoteStyleSetting /></div>
        <div className="set-block"><DashSetting /></div>
        <div className="set-block"><PaletteSetting /></div>
      </div>

      <div className="set-label">{t('setGroupAbout')}</div>
      <div className="card set-card mb-6">
        <div className="set-row">
          <Feather size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{APP_NAME}</div>
            <div className="set-h">© {APP_YEAR} {APP_AUTHOR}. {t('aboutRights')}</div>
          </div>
          <div className="set-ctl">
            <span className="chip">{t('aboutVersion')} {APP_VERSION}</span>
          </div>
        </div>
        <div className="set-row">
          <History size={16} className="set-ico" />
          <div className="min-w-0">
            <div className="set-t">{t('setUpdatesRow')}</div>
            <div className="set-h">{t('aboutAuthor')}: {APP_AUTHOR}</div>
          </div>
          <div className="set-ctl">
            <CheckUpdatesButton />
            <ChangelogButton />
          </div>
        </div>
        <div className="set-block">
          <div className="set-t mb-2">{t('ctTitle')}</div>
          <ContactForm />
        </div>
        <div className="set-block">
          <div className="set-h mb-2">{t('aboutThanksHint')}</div>
          <div className="flex flex-wrap gap-2">
            {DONATE_LINKS.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <Heart size={13} /> {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
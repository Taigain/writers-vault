'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Archive,
  Image as ImageIcon,
  LayoutGrid,
  Library,
  Lightbulb,
  PenLine,
  Plus,
  X,
} from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'
import ImportDocxButton from './ImportDocxButton'

export type ShelfBook = {
  id: string
  title: string
  status: string
  series: string | null
  sheets: number
  words: number
  genre: string
  spineColor: string
  spineStyle: string
  createdAt: number
}

type SeriesOpt = { id: string; name: string }

const STATUS_COLOR: Record<string, string> = {
  idea: '#6b6257',
  active: '#8c3a2b',
  archive: '#4a4438',
}

const GENRES = [
  'sfic',
  'fant',
  'thriller',
  'det',
  'romance',
  'litrpg',
  'pop',
  'horror',
  'adventure',
  'historical',
  'drama',
  'prose',
  'poetry',
  'other',
]

const SWATCHES: { key: string; hex: string }[] = [
  { key: 'cLeather', hex: '#8B4513' },
  { key: 'cMidnight', hex: '#22384A' },
  { key: 'cForest', hex: '#2F5D46' },
  { key: 'cBordeaux', hex: '#7A2733' },
  { key: 'cParchment', hex: '#E8DCC0' },
  { key: 'cGrimoire', hex: '#33302B' },
  { key: 'cRoyal', hex: '#5B2A63' },
  { key: 'cDesert', hex: '#B98A3E' },
]

const isDark = (hex: string) => {
  const m = hex.replace('#', '')
  if (m.length < 6) return true
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b < 140
}

const StatusIcon = ({ status, size }: { status: string; size: number }) =>
  status === 'active' ? (
    <PenLine size={size} />
  ) : status === 'archive' ? (
    <Archive size={size} />
  ) : (
    <Lightbulb size={size} />
  )

function SpineDeco({ st, fg }: { st: string; fg: string }) {
  if (st === 'plain') return null
  const inner =
    st === 'tome' ? (
      <g>
        <line x1="6" y1="3" x2="34" y2="3" stroke="currentColor" strokeWidth="1" />
        <line x1="6" y1="13" x2="34" y2="13" stroke="currentColor" strokeWidth="1" />
        <path d="M20 5.5 L23.2 8 L20 10.5 L16.8 8 Z" fill="currentColor" />
      </g>
    ) : (
      <g>
        <line x1="6" y1="5" x2="34" y2="5" stroke="currentColor" strokeWidth="1" />
        <line x1="6" y1="11" x2="34" y2="11" stroke="currentColor" strokeWidth="1" />
      </g>
    )
  return (
    <>
      <svg
        className="spine-deco spine-deco-top"
        viewBox="0 0 40 16"
        preserveAspectRatio="none"
        style={{ color: fg }}
        aria-hidden="true"
      >
        {inner}
      </svg>
      <svg
        className="spine-deco spine-deco-bottom"
        viewBox="0 0 40 16"
        preserveAspectRatio="none"
        style={{ color: fg }}
        aria-hidden="true"
      >
        {inner}
      </svg>
    </>
  )
}

export default function HomeView({
  books,
  tiles,
  createAction,
  onImport,
  series,
}: {
  books: ShelfBook[]
  tiles: React.ReactNode
  createAction: (fd: FormData) => Promise<unknown>
  onImport: React.ComponentProps<typeof ImportDocxButton>['onFile']
  series: SeriesOpt[]
}) {
  const { t } = useLang()
  const router = useRouter()
  const [view, setView] = useState<'shelf' | 'tiles'>('tiles')
  const [sort, setSort] = useState<'status' | 'genre' | 'series' | 'date'>('status')
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('wv-home-view')
      if (v === 'shelf' || v === 'tiles') setView(v)
    } catch {
      /* ignore */
    }
  }, [])

  const switchView = (v: 'shelf' | 'tiles') => {
    setView(v)
    try {
      localStorage.setItem('wv-home-view', v)
    } catch {
      /* ignore */
    }
  }

  const sorted = useMemo(() => {
    const arr = books.slice()
    if (sort === 'genre') {
      arr.sort(
        (a, b) => (a.genre || 'zzz').localeCompare(b.genre || 'zzz') || a.title.localeCompare(b.title),
      )
    } else if (sort === 'series') {
      arr.sort(
        (a, b) => (a.series || 'zzz').localeCompare(b.series || 'zzz') || a.title.localeCompare(b.title),
      )
    } else if (sort === 'date') {
      arr.sort((a, b) => a.createdAt - b.createdAt)
    }
    return arr
  }, [books, sort])

  const genreLabel = (g: string) => (g ? t(('g_' + g) as StrKey) : '')

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2">
        <select
          className="input w-auto"
          style={{ height: 28, fontSize: 12 }}
          value={sort}
          title={t('cbSort')}
          onChange={(e) => setSort(e.target.value as 'status' | 'genre' | 'series' | 'date')}
        >
          <option value="status">{t('cbSortStatus')}</option>
          <option value="genre">{t('cbSortGenre')}</option>
          <option value="series">{t('cbSortSeries')}</option>
          <option value="date">{t('cbSortDate')}</option>
        </select>
        <button
          type="button"
          className={`mini-btn ${view === 'shelf' ? 'chip-btn-active' : ''}`}
          title={t('hvShelf')}
          onClick={() => switchView('shelf')}
        >
          <Library size={15} />
        </button>
        <button
          type="button"
          className={`mini-btn ${view === 'tiles' ? 'chip-btn-active' : ''}`}
          title={t('hvTiles')}
          onClick={() => switchView('tiles')}
        >
          <LayoutGrid size={15} />
        </button>
      </div>

      {view === 'tiles' ? (
        tiles
      ) : (
        <div className="shelf-wrap">
          <div className="shelf">
            {sorted.map((b, i) => {
              const w = Math.max(55, Math.min(172, 55 + Math.round(b.sheets * 18)))
              const tilt = ((i % 3) - 1) * 0.7
              const bg = b.spineColor || STATUS_COLOR[b.status] || '#6b6257'
              const fg = isDark(bg) ? '#f3ede4' : '#201c17'
              const tip =
                b.title +
                (genreLabel(b.genre) ? ' · ' + genreLabel(b.genre) : '') +
                ` · ${t('hvSheets', { n: b.sheets.toFixed(1) })} · ${b.words.toLocaleString('ru-RU')} ${t('bsWords')}`
              return (
                <button
                  key={b.id}
                  type="button"
                  className="spine"
                  style={
                    {
                      width: w,
                      background: bg,
                      '--tilt': `${tilt}deg`,
                    } as React.CSSProperties
                  }
                  title={tip}
                  onClick={() => router.push(`/book/${b.id}`)}
                >
                  <SpineDeco st={b.spineStyle || 'tome'} fg={fg} />
                  <span className="spine-mark" style={{ color: fg, borderColor: fg }}>
                    <StatusIcon status={b.status} size={15} />
                  </span>
                  <span className="spine-title" style={{ color: fg }}>
                    {b.title}
                  </span>
                </button>
              )
            })}
            <button
              type="button"
              className="spine-add"
              title={t('hvAdd')}
              onClick={() => setAddOpen(true)}
            >
              <Plus size={22} />
            </button>
          </div>
          <div className="shelf-board" />
        </div>
      )}

      {addOpen && (
        <CreateBookModal
          series={series}
          createAction={createAction}
          onImport={onImport}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  )
}

function CreateBookModal({
  series,
  createAction,
  onImport,
  onClose,
}: {
  series: SeriesOpt[]
  createAction: (fd: FormData) => Promise<unknown>
  onImport: React.ComponentProps<typeof ImportDocxButton>['onFile']
  onClose: () => void
}) {
  const { t } = useLang()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [color, setColor] = useState(SWATCHES[0].hex)
  const [spineStyle, setSpineStyle] = useState<'tome' | 'classic' | 'plain'>('tome')
  const [seriesId, setSeriesId] = useState('')
  const [newMode, setNewMode] = useState(false)
  const [seriesNew, setSeriesNew] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [tab, setTab] = useState<'spine' | 'cover'>('spine')
  const fg = isDark(color) ? '#f3ede4' : '#201c17'

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(20, 17, 14, 0.45)', zIndex: 200 }}
      onClick={onClose}
    >
      <div className="card p-5 w-full max-w-3xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">{t('hvAdd')}</span>
          <button type="button" className="mini-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <form
          className="create-win"
          action={async (fd) => {
            await createAction(fd)
            onClose()
            router.refresh()
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-center gap-1">
              <button
                type="button"
                className={`chip-btn ${tab === 'spine' ? 'chip-btn-active' : ''}`}
                onClick={() => setTab('spine')}
              >
                {t('cbPreviewSpine')}
              </button>
              <button
                type="button"
                className={`chip-btn ${tab === 'cover' ? 'chip-btn-active' : ''}`}
                onClick={() => setTab('cover')}
              >
                {t('cbPreviewCover')}
              </button>
            </div>
            <div className="flex justify-center" style={{ minHeight: 320 }}>
              {tab === 'spine' ? (
                <div className="spine spine-preview" style={{ background: color, width: 74 }}>
                  <SpineDeco st={spineStyle} fg={fg} />
                  <span className="spine-mark" style={{ color: fg, borderColor: fg }}>
                    <Lightbulb size={15} />
                  </span>
                  <span className="spine-title" style={{ color: fg }}>
                    {title || t('cbUntitled')}
                  </span>
                </div>
              ) : coverUrl ? (
                <img
                  src={coverUrl}
                  alt=""
                  className="rounded"
                  style={{ width: 220, height: 300, objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded flex items-center justify-center text-4xl font-write"
                  style={{ width: 220, height: 300, background: 'var(--soft-bg)', color: 'var(--soft)' }}
                >
                  {(title || ' ').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="btn btn-ghost btn-sm cursor-pointer mx-auto flex">
              <ImageIcon size={14} /> {t('homeCover')}
              <input
                type="file"
                name="cover"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setCoverUrl(URL.createObjectURL(f))
                }}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <div className="field-label">{t('homeTitleField')}</div>
              <input
                name="title"
                required
                autoFocus
                className="input"
                placeholder={t('homePh')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <div className="field-label">{t('cbGenre')}</div>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`chip-btn ${genre === g ? 'chip-btn-active' : ''}`}
                    onClick={() => setGenre(genre === g ? '' : g)}
                  >
                    {t(('g_' + g) as StrKey)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="field-label">{t('cbSeries')}</div>
              <select
                className="input"
                value={newMode ? '__new' : seriesId}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '__new') {
                    setNewMode(true)
                  } else {
                    setNewMode(false)
                    setSeriesId(v)
                  }
                }}
              >
                <option value="">{t('cbSeriesNone')}</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="__new">{t('cbSeriesNew')}</option>
              </select>
              {newMode && (
                <input
                  className="input mt-2"
                  placeholder={t('cbSeriesNewPh')}
                  value={seriesNew}
                  onChange={(e) => setSeriesNew(e.target.value)}
                />
              )}
            </div>
            <div>
              <div className="field-label">{t('cbColor')}</div>
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((s) => (
                  <button
                    key={s.hex}
                    type="button"
                    className={`swatch ${color === s.hex ? 'swatch-active' : ''}`}
                    style={{ background: s.hex }}
                    title={t(s.key as StrKey)}
                    onClick={() => setColor(s.hex)}
                  />
                ))}
                <label className="swatch swatch-custom" title={t('cbCustom')}>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </label>
              </div>
            </div>
            <div>
              <div className="field-label">{t('cbStyle')}</div>
              <div className="flex gap-2">
                {(['tome', 'classic', 'plain'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`style-pick ${spineStyle === st ? 'style-pick-active' : ''}`}
                    onClick={() => setSpineStyle(st)}
                  >
                    <span className="style-mini" style={{ background: color }}>
                      <SpineDeco st={st} fg={fg} />
                    </span>
                    <span className="text-xs">{t(('st_' + st) as StrKey)}</span>
                  </button>
                ))}
              </div>
            </div>
            <input type="hidden" name="genre" value={genre} />
            <input type="hidden" name="spineColor" value={color} />
            <input type="hidden" name="spineStyle" value={spineStyle} />
            <input type="hidden" name="seriesId" value={newMode ? '' : seriesId} />
            <input type="hidden" name="seriesNew" value={newMode ? seriesNew : ''} />
            <div className="flex flex-wrap gap-2 justify-end">
              <ImportDocxButton label={t('homeImportDocx')} onFile={onImport} />
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} /> {t('homeCreate')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
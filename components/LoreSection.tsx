'use client'

import { useMemo, useState } from 'react'
import { Hash, Plus, Save, Trash2, ChevronRight } from 'lucide-react'
import { deleteLoreEntry, saveLoreEntryFull } from '@/lib/actions'
import ImageAttach from './ImageAttach'
import { useLang } from '@/lib/useLang'
import ZoomImage from './ZoomImage'

export type LoreEntryData = {
  id: string
  text: string
  tags: string[]
  createdAt: string
  imageBase64: string | null
}

export default function LoreSection({
  bookId,
  entries,
}: {
  bookId: string
  entries: LoreEntryData[]
}) {
  const { t } = useLang()
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const tagStats = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) for (const tg of e.tags) map.set(tg, (map.get(tg) ?? 0) + 1)
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
  }, [entries])

  const visible = useMemo(() => {
    const list = activeTag ? entries.filter((e) => e.tags.includes(activeTag)) : entries
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [entries, activeTag])

  return (
    <div className="space-y-6">
      <form
        action={async (fd: FormData) => {
          await saveLoreEntryFull(fd)
        }}
        className="card p-5 space-y-3"
      >
        <input type="hidden" name="bookId" value={bookId} />
        <div className="field-label">{t('loreNew')}</div>
        <textarea
          name="text"
          required
          rows={3}
          className="textarea text-sm"
          placeholder={t('lorePh')}
        />
        <ImageAttach
          name="image"
          value={null}
          maxDim={1200}
          labelAttach={t('loreImgAttach')}
          labelReplace={t('loreImgReplace')}
          labelRemove={t('loreImgRemove')}
        />
        <div className="flex flex-wrap gap-2">
          <input
            name="tags"
            required
            className="input flex-1 min-w-[220px]"
            placeholder={t('loreTagsPh')}
          />
          <button className="btn btn-primary btn-sm">
            <Plus size={14} /> {t('loreAdd')}
          </button>
        </div>
      </form>

      {tagStats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--soft)' }}>
            {t('loreSort')}
          </span>
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`chip-btn ${activeTag === null ? 'chip-btn-active' : ''}`}
          >
            {t('loreAll')} ({entries.length})
          </button>
          {tagStats.map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`chip-btn ${activeTag === tag ? 'chip-btn-active' : ''}`}
            >
              <Hash size={11} /> {tag.slice(1)} · {count}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {entries.length === 0 ? t('loreEmpty') : t('loreEmptyFilter')}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((e) => (
            <details key={e.id} className="acc">
              <summary className="acc-head">
                <ChevronRight size={18} className="acc-chev" />
                <span className="acc-title">
                  {e.text.split(' ').slice(0, 8).join(' ')}{e.text.split(' ').length > 8 ? '…' : ''}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {e.tags.slice(0, 3).map((tg) => (
                    <span key={tg} className="chip chip-mention">{tg}</span>
                  ))}
                  {e.tags.length > 3 && <span className="chip">+{e.tags.length - 3}</span>}
                </div>
              </summary>
              <div className="acc-body">
                <div className="flex items-start justify-between gap-3 mb-3 pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {e.tags.map((tg) => (
                      <button
                        key={tg}
                        type="button"
                        onClick={() => setActiveTag(activeTag === tg ? null : tg)}
                        className="chip chip-mention cursor-pointer"
                      >
                        <Hash size={11} /> {tg.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    title={t('loreDeleteConfirm')}
                    onClick={async () => {
                      if (window.confirm(t('loreDeleteConfirm'))) await deleteLoreEntry(e.id)
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {e.imageBase64 && (
                  <div className="img-attach-preview mb-3" style={{ width: '10rem' }}>
                    <ZoomImage src={e.imageBase64} />
                  </div>
                )}

                <form
                  action={async (fd: FormData) => {
                    await saveLoreEntryFull(fd)
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="bookId" value={bookId} />
                  <textarea
                    name="text"
                    defaultValue={e.text}
                    rows={Math.max(2, e.text.split('\n').length)}
                    className="textarea text-sm"
                  />
                  <ImageAttach
                    name="image"
                    value={e.imageBase64}
                    maxDim={1200}
                    labelAttach={t('loreImgAttach')}
                    labelReplace={t('loreImgReplace')}
                    labelRemove={t('loreImgRemove')}
                  />
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      name="tags"
                      required
                      defaultValue={e.tags.join(' ')}
                      className="input flex-1 min-w-[220px] text-xs"
                    />
                    <button type="submit" className="btn btn-ghost btn-sm">
                      <Save size={13} /> {t('loreSave')}
                    </button>
                  </div>
                </form>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
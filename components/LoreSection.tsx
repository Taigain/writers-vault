'use client'

import { useMemo, useState, useEffect } from 'react'
import { ChevronRight, ArrowLeft, X } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { saveLoreEntryFull, deleteLoreEntry } from '@/lib/actions'
import ImageAttach from './ImageAttach'
import DeleteButton from './DeleteButton'
import { PALETTES, getPalette } from '@/lib/palettes'

type LoreEntry = {
  id: string
  text: string
  tags: string[]
  createdAt: string
  imageBase64: string | null
}

function LoreForm({
  bookId,
  entry,
  submitLabel,
  onDone,
}: {
  bookId: string
  entry?: LoreEntry
  submitLabel: string
  onDone?: () => void
}) {
  return (
    <form
      action={async (fd) => {
        await saveLoreEntryFull(fd)
        onDone?.()
      }}
      className="space-y-3"
    >
      <input type="hidden" name="bookId" value={bookId} />
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <textarea
        name="text"
        defaultValue={entry?.text ?? ''}
        rows={3}
        className="textarea text-sm"
        placeholder={useLang().t('wlTextPh')}
        required
      />
      <ImageAttach
        name="image"
        showPreview={false}
        value={entry?.imageBase64 ?? null}
        maxDim={1200}
        labelAttach={useLang().t('wlImgAttach')}
        labelReplace={useLang().t('wlImgReplace')}
        labelRemove={useLang().t('wlImgRemove')}
      />
      <input
        name="tags"
        defaultValue={entry?.tags.join(' ') ?? ''}
        className="input"
        placeholder={useLang().t('wlTagsPh')}
        required
      />
      <div className="flex justify-end gap-2">
        {entry && (
          <DeleteButton
            onConfirm={async () => {
              await deleteLoreEntry(entry.id)
              onDone?.()
            }}
            label={useLang().t('wlDelete')}
            confirmText={useLang().t('wlDeleteConfirm')}
          />
        )}
        <button type="submit" className="btn btn-primary btn-sm">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default function LoreSection({ bookId, entries }: { bookId: string; entries: LoreEntry[] }) {
  const { t } = useLang()
  const [mode, setMode] = useState<'list' | 'cloud'>('list')
  const [listTag, setListTag] = useState<string | null>(null)
  const [cloudTag, setCloudTag] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) for (const tg of e.tags) m.set(tg, (m.get(tg) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [entries])
  const counts = tagCounts.map(([, c]) => c)
  const minC = counts.length ? Math.min(...counts) : 0
  const maxC = counts.length ? Math.max(...counts) : 0
  //const fontSize = (c: number) => 13 + ((c - minC) / (maxC - minC || 1)) * 15

    const [palKey, setPalKey] = useState<string | null>(null)
  useEffect(() => {
    setPalKey(getPalette().key)
  }, [])
  const colors = (PALETTES.find((p) => p.key === palKey) ?? PALETTES[0]).colors
  const weight = (c: number) => (maxC === minC ? 0.6 : (c - minC) / (maxC - minC))

  const filtered = listTag ? entries.filter((e) => e.tags.includes(listTag)) : entries
  const cloudEntries = cloudTag ? entries.filter((e) => e.tags.includes(cloudTag)) : []
  const editEntry = editId ? entries.find((e) => e.id === editId) ?? null : null

  return (
    <div>
      <div className="card p-4 mb-6 space-y-3">
        <div className="field-label">{t('wlNew')}</div>
        <LoreForm bookId={bookId} submitLabel={t('wlAdd')} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold" style={{ color: 'var(--soft)' }}>{t('wlView')}</span>
        <button
          type="button"
          className={`chip-btn ${mode === 'list' ? 'chip-btn-active' : ''}`}
          onClick={() => setMode('list')}
        >
          {t('wlModeList')}
        </button>
        <button
          type="button"
          className={`chip-btn ${mode === 'cloud' ? 'chip-btn-active' : ''}`}
          onClick={() => {
            setMode('cloud')
            setCloudTag(null)
          }}
        >
          {t('wlModeCloud')}
        </button>
      </div>

      {mode === 'list' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs" style={{ color: 'var(--soft)' }}>{t('wlFilter')}</span>
            <button
              type="button"
              className={`chip-btn ${listTag === null ? 'chip-btn-active' : ''}`}
              onClick={() => setListTag(null)}
            >
              {t('wlAll')} ({entries.length})
            </button>
            {tagCounts.map(([tg, c]) => (
              <button
                key={tg}
                type="button"
                className={`chip-btn ${listTag === tg ? 'chip-btn-active' : ''}`}
                onClick={() => setListTag(listTag === tg ? null : tg)}
              >
                {tg} · {c}
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
              {t('wlEmpty')}
            </div>
          )}
          <div className="masonry">
            {filtered.map((e) => (
              <details key={e.id} className="acc">
                <summary className="acc-head">
                  <ChevronRight size={18} className="acc-chev" />
                  <span className="acc-title flex-1 truncate">
                    {e.text.length > 80 ? e.text.slice(0, 80) + '…' : e.text}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {e.tags.slice(0, 3).map((tg) => (
                      <span key={tg} className="chip chip-mention">{tg}</span>
                    ))}
                    {e.tags.length > 3 && <span className="chip">+{e.tags.length - 3}</span>}
                  </span>
                </summary>
                <div className="acc-body pt-3">
                  <LoreForm bookId={bookId} entry={e} submitLabel={t('wlSave')} />
                </div>
              </details>
            ))}
          </div>
        </>
      )}

       {mode === 'cloud' && !cloudTag && (
        <div
          className="card px-8 py-10 flex flex-wrap items-baseline justify-center"
          style={{ gap: '0.5rem 1.8rem', lineHeight: 2 }}
        >
          {tagCounts.length === 0 && (
            <div className="text-sm" style={{ color: 'var(--soft)' }}>{t('wlEmpty')}</div>
          )}
          {tagCounts.map(([tg, c], i) => {
            const w = weight(c)
            const base = 0.72 + w * 0.28
            return (
              <button
                key={tg}
                type="button"
                title={`${tg} · ${c}`}
                onClick={() => setCloudTag(tg)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 15 + w * 22,
                  fontWeight: 500 + Math.round(w * 300),
                  color: colors[i % colors.length],
                  opacity: base,
                  lineHeight: 1.25,
                  transition: 'transform .12s ease, opacity .12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.09)'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.opacity = String(base)
                }}
              >
                {tg.replace(/^#/, '')}
                <sup style={{ fontSize: '0.55em', opacity: 0.6, marginLeft: 2, fontWeight: 600 }}>
                  {c}
                </sup>
              </button>
            )
          })}
        </div>
      )}

      {mode === 'cloud' && cloudTag && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCloudTag(null)}>
              <ArrowLeft size={13} /> {t('wlBackCloud')}
            </button>
            <span className="text-sm font-bold">
              {t('wlNotesFor')} {cloudTag} · {cloudEntries.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {cloudEntries.map((e) => (
              <button
                key={e.id}
                type="button"
                className="card p-4 text-left space-y-2"
                onClick={() => setEditId(e.id)}
              >
                {e.imageBase64 && (
                  <img src={e.imageBase64} alt="" className="w-full h-28 object-cover rounded" />
                )}
                <div className="text-sm">
                  {e.text.length > 140 ? e.text.slice(0, 140) + '…' : e.text}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {e.tags.map((tg) => (
                    <span key={tg} className="chip chip-mention">{tg}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {editEntry && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,.45)' }}
          onClick={() => setEditId(null)}
        >
          <div
            className="card w-full max-w-2xl p-5 space-y-3"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{t('wlEditEntry')}</span>
              <button type="button" className="mini-btn" onClick={() => setEditId(null)}>
                <X size={15} />
              </button>
            </div>
            <LoreForm
              bookId={bookId}
              entry={editEntry}
              submitLabel={t('wlSave')}
              onDone={() => setEditId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
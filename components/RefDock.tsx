'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, GripVertical, Users, X } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'
import { getRefInfo, updateCharacterFields } from '@/lib/actions'

export type RefKey = { kind: 'char' | 'event'; key: string }

const keyOf = (r: RefKey) => r.kind + ':' + r.key

export default function RefDock({
  bookId,
  refs,
  onClose,
  onReorder,
}: {
  bookId: string
  refs: RefKey[]
  onClose: (r: RefKey) => void
  onReorder: (fromKey: string, toKey: string) => void
}) {
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [overKey, setOverKey] = useState<string | null>(null)
  if (refs.length === 0) return null
  return (
    <aside className="ref-dock space-y-3">
      {refs.map((r) => {
        const key = keyOf(r)
        return (
          <div
            key={key}
            draggable={dragKey === key}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', key)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e) => {
              if (!dragKey) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (overKey !== key) setOverKey(key)
            }}
            onDrop={(e) => {
              e.preventDefault()
              const from = e.dataTransfer.getData('text/plain') || dragKey
              if (from && from !== key) onReorder(from, key)
              setDragKey(null)
              setOverKey(null)
            }}
            onDragEnd={() => {
              setDragKey(null)
              setOverKey(null)
            }}
            style={{
              opacity: dragKey === key ? 0.5 : 1,
              outline: overKey === key && dragKey && dragKey !== key ? '2px dashed var(--gold)' : 'none',
              outlineOffset: 2,
              borderRadius: 8,
            }}
          >
            <RefCard
              bookId={bookId}
              refKey={r}
              onClose={() => onClose(r)}
              onGrab={(on) => setDragKey(on ? key : null)}
            />
          </div>
        )
      })}
    </aside>
  )
}

function RefCard({
  bookId,
  refKey,
  onClose,
  onGrab,
}: {
  bookId: string
  refKey: RefKey
  onClose: () => void
  onGrab: (on: boolean) => void
}) {
  const { t } = useLang()
  const router = useRouter()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    void (async () => {
      const d = await getRefInfo(bookId, refKey.kind, refKey.key)
      if (alive) {
        setData(d as Record<string, unknown> | null)
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [bookId, refKey.kind, refKey.key])

  const isChar = refKey.kind === 'char'
  const name = isChar ? String(data?.name ?? refKey.key) : String(data?.title ?? refKey.key)
  const portrait = isChar ? ((data?.portraitBase64 as string | null) ?? null) : null
  const role = isChar ? String(data?.role ?? '') : ''
  const aliases = isChar ? String(data?.aliases ?? '') : ''
  const charId = isChar ? String(data?.id ?? '') : ''
  const dateLine =
    !isChar && data
      ? data.dateType === 'calendar' && data.date
        ? String(data.date).slice(0, 10)
        : `${t('tlYear')}: ${String(data?.bookYear ?? '—')} · ${t('tlDay')}: ${String(data?.bookDay ?? '—')}`
      : ''
  const eventDesc = !isChar ? String(data?.desc ?? '') : ''

  const saveField = (field: 'bio' | 'decisions' | 'arc', value: string) => {
    const cur = String(data?.[field] ?? '')
    if (value === cur || !charId) return
    void updateCharacterFields(charId, { [field]: value })
    setData((d) => (d ? { ...d, [field]: value } : d))
  }

  const area = (field: 'bio' | 'decisions' | 'arc', label: string) => (
    <div>
      <div className="field-label">{label}</div>
      <textarea
        defaultValue={String(data?.[field] ?? '')}
        rows={3}
        className="textarea text-xs"
        onBlur={(e) => saveField(field, e.target.value)}
      />
    </div>
  )

  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="mini-btn"
          title={t('dockDrag')}
          style={{ cursor: 'grab' }}
          onPointerDown={() => onGrab(true)}
          onPointerUp={() => onGrab(false)}
        >
          <GripVertical size={13} />
        </button>
        {isChar ? <Users size={14} /> : <CalendarDays size={14} />}
        <span className="text-sm font-bold flex-1 truncate">{name}</span>
        <button type="button" className="mini-btn" title={t('dockClose')} onClick={onClose}>
          <X size={13} />
        </button>
      </div>
      {loading && (
        <div className="text-xs" style={{ color: 'var(--soft)' }}>…</div>
      )}
      {!loading && !data && (
        <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('dockNotFound')}</div>
      )}
      {!loading && data && (
        <div className="space-y-2">
          {portrait && (
            <img
              src={portrait}
              alt=""
              className="rounded"
              style={{ width: 56, height: 74, objectFit: 'cover' }}
            />
          )}
          {isChar && role && <div className="chip">{t(('role_' + role) as StrKey)}</div>}
          {isChar && aliases && (
            <div className="text-xs" style={{ color: 'var(--soft)' }}>{aliases}</div>
          )}
          {!isChar && dateLine && (
            <div className="text-xs" style={{ color: 'var(--soft)' }}>{dateLine}</div>
          )}
          {!isChar && eventDesc && (
            <p className="text-xs" style={{ color: 'var(--soft)' }}>{eventDesc}</p>
          )}
          {isChar && (
            <div className="space-y-2">
              {area('bio', t('ccBio'))}
              {area('decisions', t('ccDecisions'))}
              {area('arc', t('ccArc'))}
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              router.push(`/book/${bookId}?tab=${isChar ? 'characters' : 'timeline'}`)
            }
          >
            {t('dockOpen')}
          </button>
        </div>
      )}
    </div>
  )
}
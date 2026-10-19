'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, Copy, Check, X, Search, Globe2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'
import {
  createDictEntry,
  saveDictEntry,
  deleteDictEntry,
  getDictGroups,
  createDictGroup,
  renameDictGroup,
  deleteDictGroup,
  setDictEntryGroup,
} from '@/lib/actions'
import type { DictRow, DictGroupRow } from '@/lib/actions'
import { usePremium } from './LicenseProvider'

type Pair = { d: string; b: string }

function EntryCard({
  e,
  uses,
  unlocked,
  groups,
}: {
  e: DictRow
  uses: number
  unlocked: boolean
  groups: DictGroupRow[]
}) {
  const { t } = useLang()
  const router = useRouter()
  const [pairs, setPairs] = useState<Pair[]>(e.forms)
  const [nd, setNd] = useState('')
  const [nb, setNb] = useState('')
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText('[~' + e.key + ']')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  const addPair = () => {
    const d = nd.trim().toLowerCase()
    const b = nb.trim()
    if (!d || !b || d === e.key) return
    setPairs((p) => [...p.filter((x) => x.d !== d), { d, b }])
    setNd('')
    setNb('')
  }
  return (
    <div className="card p-4">
      <form
        className="space-y-3"
        onSubmit={async (ev) => {
          ev.preventDefault()
          const fd = new FormData(ev.currentTarget)
          fd.set('forms', JSON.stringify(pairs))
          await saveDictEntry(e.id, fd)
          router.refresh()
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <input name="word" defaultValue={e.word} className="input font-semibold" style={{ width: '12rem' }} />
          <button type="button" className="chip-btn" title={t('dcCopy')} onClick={copy}>
            {copied ? <Check size={12} /> : <Copy size={12} />} [~{e.key}]
          </button>
          {uses > 0 && <span className="chip">{t('dcUses', { n: uses })}</span>}
          <span className="flex-1" />
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={async () => {
              if (window.confirm(t('dcDeleteConfirm', { word: e.word }))) {
                await deleteDictEntry(e.id)
                router.refresh()
              }
            }}
          >
            <Trash2 size={13} /> {t('dcDelete')}
          </button>
        </div>
        <input name="meaning" defaultValue={e.meaning} className="input text-sm" placeholder={t('dcMeaningPh')} />
        <div>
          <div className="field-label">{t('dcFormsLabel')}</div>
          {pairs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {pairs.map((p) => (
                <span key={p.d} className="chip">
                  {p.d} → {p.b}
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => setPairs((cur) => cur.filter((x) => x.d !== p.d))}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              value={nd}
              onChange={(ev) => setNd(ev.target.value)}
              className="input"
              style={{ width: '10rem' }}
              placeholder={t('dcFormD')}
            />
            <input
              value={nb}
              onChange={(ev) => setNb(ev.target.value)}
              className="input"
              style={{ width: '10rem' }}
              placeholder={t('dcFormB')}
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={addPair}>
              <Plus size={13} /> {t('dcFormAdd')}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs" style={{ color: 'var(--soft)' }}>
            {t('dcHint', { key: e.key, word: e.word, meaning: e.meaning })} {t('dcCase')}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {unlocked && (
              <select
                className="input w-auto"
                defaultValue={e.groupId ?? ''}
                title={t('dgEntryGroup')}
                onChange={(ev) => void setDictEntryGroup(e.id, ev.target.value || null)}
              >
                <option value="">{t('dgCommon')}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={13} /> {t('dcSave')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const GROUP_COLORS = [
  '#3a7a4a',
  '#8c3a2b',
  '#b98a3e',
  '#a64563',
  '#2b5a8c',
  '#4c3d8f',
  '#0f766e',
  '#7c3aed',
  '#be185d',
  '#57534e',
]

function ColorSwatches({ name, initial }: { name: string; initial: string }) {
  const [cur, setCur] = useState(initial)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="hidden" name={name} value={cur} />
      {GROUP_COLORS.map((c) => {
        const active = cur === c
        return (
          <button
            key={c}
            type="button"
            title={c}
            aria-pressed={active}
            onClick={() => setCur(c)}
            className="dg-swatch"
            style={{
              background: c,
              boxShadow: active
                ? '0 0 0 2px var(--soft-bg), 0 0 0 4px var(--fg)'
                : '0 1px 3px rgba(0, 0, 0, 0.25)',
              transform: active ? 'scale(1.15)' : 'none',
            }}
          >
            {active && (
              <Check size={12} style={{ color: '#fff', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))' }} />
            )}
          </button>
        )
      })}
      <code className="text-xs" style={{ color: 'var(--soft)' }}>{cur}</code>
    </div>
  )
}

export default function DictSection({
  bookId,
  entries,
  usage,
}: {
  bookId: string
  entries: DictRow[]
  usage: Record<string, number>
}) {
  const { t } = useLang()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const { unlocked } = usePremium('dictGroups')
  const [groups, setGroups] = useState<DictGroupRow[]>([])
  const loadGroups = async () => setGroups(await getDictGroups(bookId))
  useEffect(() => {
    if (unlocked) void loadGroups()
  }, [bookId, unlocked])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return entries
    return entries.filter((e) =>
      [e.word, e.meaning, e.key, ...e.forms.map((p) => p.d + ' ' + p.b)]
        .join(' ')
        .toLowerCase()
        .includes(s),
    )
  }, [entries, q])
  return (
    <div>
      {unlocked && (
        <div className="card p-4 mb-5 space-y-2">
          <div className="field-label">{t('dgTitle')}</div>
          {groups.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center gap-2">
              <span className="cr-legend-dot" style={{ background: g.color || 'var(--gold)' }} />
              <input
                defaultValue={g.name}
                className="input flex-1 min-w-[160px]"
                onBlur={(e) => {
                  if (e.target.value.trim() !== g.name)
                    void renameDictGroup(g.id, e.target.value).then(loadGroups)
                }}
              />
              <code className="text-xs" style={{ color: 'var(--soft)' }}>[lang:{g.slug}]</code>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={async () => {
                  if (window.confirm(t('dgDeleteConfirm', { name: g.name }))) {
                    await deleteDictGroup(g.id)
                    await loadGroups()
                  }
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <form
            className="flex flex-wrap gap-2"
            action={async (fd) => {
              await createDictGroup(bookId, (fd.get('name') as string) ?? '', (fd.get('color') as string) ?? '')
              await loadGroups()
            }}
          >
            <input name="name" required className="input flex-1 min-w-[160px]" placeholder={t('dgName')} />
            <ColorSwatches name="color" initial={GROUP_COLORS[0]} />
            <button className="btn btn-primary btn-sm">
              <Plus size={13} /> {t('dgCreate')}
            </button>
          </form>
        </div>
      )}
      <div className="card p-4 mb-5 space-y-3">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            const form = e.currentTarget
            const fd = new FormData(form)
            const res = await createDictEntry(bookId, fd)
            if (!res.ok) {
              setErr(t(('dcErr_' + res.error) as StrKey))
              return
            }
            setErr(null)
            form.reset()
            router.refresh()
          }}
        >
          <input name="word" required className="input" style={{ width: '12rem' }} placeholder={t('dcWordPh')} />
          <input name="meaning" required className="input flex-1 min-w-[200px]" placeholder={t('dcMeaningPh')} />
          <button className="btn btn-primary btn-sm">
            <Plus size={14} /> {t('dcAdd')}
          </button>
        </form>
        {err && (
          <div className="text-xs" style={{ color: '#8c3a2b' }}>
            {err}
          </div>
        )}
        <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--soft)' }}>
          <Globe2 size={14} style={{ marginTop: 1 }} />
          <span>{t('dcZoneHint')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Search size={14} style={{ color: 'var(--soft)' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="input flex-1" placeholder={t('dcSearch')} />
      </div>
      {entries.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {t('dcEmpty')}
        </div>
      )}
      {entries.length > 0 && filtered.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {t('dcNotFound')}
        </div>
      )}
      <div className="space-y-3">
        {filtered.map((e) => (
          <EntryCard key={e.id} e={e} uses={usage[e.key] ?? 0} unlocked={unlocked} groups={groups} />
        ))}
      </div>
    </div>
  )
}
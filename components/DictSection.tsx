'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, Copy, Check, X, Search, Globe2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'
import { createDictEntry, saveDictEntry, deleteDictEntry } from '@/lib/actions'
import type { DictRow } from '@/lib/actions'

type Pair = { d: string; b: string }

function EntryCard({ e, uses }: { e: DictRow; uses: number }) {
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
          <button type="submit" className="btn btn-primary btn-sm">
            <Save size={13} /> {t('dcSave')}
          </button>
        </div>
      </form>
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
          <EntryCard key={e.id} e={e} uses={usage[e.key] ?? 0} />
        ))}
      </div>
    </div>
  )
}
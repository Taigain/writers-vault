'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, PencilLine } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { updateMentionNote } from '@/lib/actions'
import CharacterEgo, { type EgoData } from './CharacterEgo'

export type MentionRow = {
  id: string
  chapterId: string
  chapterTitle: string
  pos: number | null
  snippet: string
  note: string | null
}
export type SceneRowLite = { id: string; title: string; chapterId: string; chapterTitle: string }
export type HeatRow = {
  chapterId: string
  chapterTitle: string
  mentions: number
  scenesTotal: number
  scenesWithChar: number
}

export default function CharacterTabs({
  bookId,
  name,
  profile,
  relations,
  mentions,
  scenes,
  heat,
  chaptersTotal,
  chaptersWithMentions,
  totalScenes,
  withScenes,
  relationsCount,
  ego,
}: {
  bookId: string
  name: string
  profile: React.ReactNode
  relations: React.ReactNode
  mentions: MentionRow[]
  scenes: SceneRowLite[]
  heat: HeatRow[]
  chaptersTotal: number
  chaptersWithMentions: number
  totalScenes: number
  withScenes: number
  relationsCount: number
  ego: EgoData
}) {
  const { t } = useLang()
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'relations' | 'mentions' | 'scenes' | 'cloud'>('profile')
  const [openNote, setOpenNote] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const pctCh = chaptersTotal > 0 ? Math.round((chaptersWithMentions / chaptersTotal) * 100) : 0
  const pctSc = totalScenes > 0 ? Math.round((withScenes / totalScenes) * 100) : 0
  const visible = showAll ? mentions : mentions.slice(0, 15)

  const tabs = [
    { key: 'profile' as const, label: t('ccTabProfile'), count: null as number | null },
    { key: 'relations' as const, label: t('ccTabRelations'), count: relationsCount },
    { key: 'mentions' as const, label: t('ccTabMentions'), count: mentions.length },
    { key: 'scenes' as const, label: t('ccTabScenes'), count: scenes.length },
    { key: 'cloud' as const, label: t('ccTabCloud'), count: ego.nodes.length },
  ]

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            className={`chip-btn ${tab === tb.key ? 'chip-btn-active' : ''}`}
            onClick={() => setTab(tb.key)}
          >
            {tb.label}
            {tb.count !== null && <span style={{ opacity: 0.7 }}> · {tb.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'profile' && <div>{profile}</div>}
      {tab === 'relations' && <div>{relations}</div>}

      {tab === 'mentions' && (
        <div className="space-y-1">
          {mentions.length === 0 && (
            <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('caEmpty')}</div>
          )}
          {visible.map((m) => (
            <div key={m.id} className="card px-2 py-1.5 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  className="chip chip-mention shrink-0"
                  title={t('scJump')}
                  onClick={() =>
                    router.push(
                      `/book/${bookId}?tab=chapters&ch=${m.chapterId}&q=${encodeURIComponent('[@' + name + ']')}&pos=${m.pos ?? 0}`,
                    )
                  }
                >
                  {m.chapterTitle}
                </button>
                <span className="flex-1 truncate" style={{ color: 'var(--soft)' }} title={m.snippet}>
                  …{m.snippet}…
                </span>
                {m.note && (
                  <span className="chip shrink-0" title={m.note}>
                    <PencilLine size={11} />
                  </span>
                )}
                <button
                  type="button"
                  className="mini-btn shrink-0"
                  title={t('caNotePh')}
                  onClick={() => setOpenNote(openNote === m.id ? null : m.id)}
                >
                  {openNote === m.id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              </div>
              {openNote === m.id && (
                <input
                  defaultValue={m.note ?? ''}
                  placeholder={t('caNotePh')}
                  className="input text-xs"
                  onBlur={(e) => {
                    if ((e.target.value ?? '') !== (m.note ?? '')) void updateMentionNote(m.id, e.target.value)
                  }}
                />
              )}
            </div>
          ))}
          {mentions.length > 15 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? t('ccCollapse') : t('ccShowAll', { n: mentions.length })}
            </button>
          )}
        </div>
      )}

      {tab === 'scenes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {scenes.length === 0 && (
              <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('caEmpty')}</div>
            )}
            {scenes.map((s) => (
              <button
                key={s.id}
                type="button"
                className="chip chip-mention"
                onClick={() => router.push(`/book/${bookId}?tab=scenes&scene=${s.id}`)}
              >
                {s.chapterTitle} · {s.title || t('scUntitled')}
              </button>
            ))}
          </div>
          {heat.length > 0 && (
            <div>
              <div className="field-label">
                {t('caHeat')} · {t('caHeatCh')}: {chaptersWithMentions}/{chaptersTotal} ({pctCh}%) ·{' '}
                {t('caHeatSc')}: {withScenes}/{totalScenes} ({pctSc}%)
              </div>
              <div className="space-y-1 pt-1">
                {heat.map((h) => {
                  const p = h.scenesTotal > 0 ? Math.round((h.scenesWithChar / h.scenesTotal) * 100) : 0
                  return (
                    <div key={h.chapterId} className="flex items-center gap-2 text-xs">
                      <span className="w-40 truncate" style={{ color: 'var(--soft)' }}>{h.chapterTitle}</span>
                      <span className="flex-1 h-2 rounded" style={{ background: 'var(--soft-bg)' }}>
                        {h.scenesTotal > 0 && (
                          <span className="block h-2 rounded" style={{ width: `${p}%`, background: 'var(--gold)' }} />
                        )}
                      </span>
                      <span className="w-44 text-right">
                        {t('caMentionsShort')}: {h.mentions} ·{' '}
                        {h.scenesTotal > 0 ? `${h.scenesWithChar}/${h.scenesTotal}` : t('caNoScenes')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    {tab === 'cloud' && <CharacterEgo ego={ego} />}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'
import { getCharacterAnalytics, updateMentionNote } from '@/lib/actions'

type Data = Awaited<ReturnType<typeof getCharacterAnalytics>>

export default function CharacterAnalytics({
  bookId,
  characterId,
  name,
}: {
  bookId: string
  characterId: string
  name: string
}) {
  const { t } = useLang()
  const router = useRouter()
  const [data, setData] = useState<Data | null>(null)
  useEffect(() => {
    let alive = true
    void getCharacterAnalytics(characterId).then((d) => {
      if (alive) setData(d)
    })
    return () => {
      alive = false
    }
  }, [characterId])
  if (!data) return null
  const pctCh = data.chaptersTotal > 0 ? Math.round((data.chaptersWithMentions / data.chaptersTotal) * 100) : 0
  const pctSc = data.totalScenes > 0 ? Math.round((data.withScenes / data.totalScenes) * 100) : 0
  return (
    <div className="space-y-4 pt-3">
      <div>
        <div className="field-label">{t('caMentions')}</div>
        <div className="space-y-2 pt-1">
          {data.mentions.length === 0 && (
            <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('caEmpty')}</div>
          )}
          {data.mentions.map((m) => (
            <div key={m.id} className="card p-2 space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="chip chip-mention"
                  title={t('scJump')}
                  onClick={() =>
                    router.push(
                      `/book/${bookId}?tab=chapters&ch=${m.chapterId}&q=${encodeURIComponent('[@' + name + ']')}&pos=${m.pos ?? 0}`,
                    )
                  }
                >
                  {m.chapterTitle}
                </button>
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--soft)' }}>…{m.snippet}…</span>
              </div>
              <input
                defaultValue={m.note ?? ''}
                placeholder={t('caNotePh')}
                className="input text-sm"
                onBlur={(e) => {
                  if ((e.target.value ?? '') !== (m.note ?? '')) void updateMentionNote(m.id, e.target.value)
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {data.scenes.length > 0 && (
        <div>
          <div className="field-label">{t('caScenes')}</div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.scenes.map((s) => (
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
        </div>
      )}
      {data.heat.length > 0 && (
        <div>
          <div className="field-label">
            {t('caHeat')} · {t('caHeatCh')}: {data.chaptersWithMentions}/{data.chaptersTotal} ({pctCh}%) ·{' '}
            {t('caHeatSc')}: {data.withScenes}/{data.totalScenes} ({pctSc}%)
          </div>
          <div className="space-y-1 pt-1">
            {data.heat.map((h) => {
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
  )
}
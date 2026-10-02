'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clapperboard, Save, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { HL_COLORS } from '@/lib/scenes'
import { updateSceneText, setSceneCharacters, type SceneRow } from '@/lib/actions'
import RichPreview from './RichPreview'
import { applyDict, type DictMap } from '@/lib/dict'

function SceneCard({
  scene,
  characters,
  index,
  defaultOpen,
  bookId,
  dict,
}: {
  scene: SceneRow
  characters: { id: string; name: string }[]
  index: number
  defaultOpen: boolean
  bookId: string
  dict?: DictMap
}) {
  const { t } = useLang()
  const router = useRouter()
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const [text, setText] = useState(scene.text)
  const [on, setOn] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {}
    for (const c of scene.characters) m[c.id] = true
    return m
  })
  const wrapHl = (n: number) => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart ?? 0
    const e = ta.selectionEnd ?? 0
    const open = `[hl=${n}]`
    const close = '[/hl]'
    const sel = text.slice(s, e)
    const outerOk =
      s >= open.length &&
      e + close.length <= text.length &&
      text.slice(s - open.length, s) === open &&
      text.slice(e, e + close.length) === close
    const apply = (next: string, ns: number, ne: number) => {
      setText(next)
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(ns, ne)
      })
    }
    if (outerOk) {
      apply(text.slice(0, s - open.length) + sel + text.slice(e + close.length), s - open.length, e - open.length)
      return
    }
    const innerOk = sel.startsWith(open) && sel.endsWith(close) && sel.length >= open.length + close.length
    if (innerOk) {
      apply(
        text.slice(0, s) + sel.slice(open.length, sel.length - close.length) + text.slice(e),
        s,
        e - open.length - close.length,
      )
      return
    }
    apply(text.slice(0, s) + open + sel + close + text.slice(e), s + open.length, e + open.length)
  }
  return (
    <details className="acc" open={defaultOpen}>
      <summary className="acc-head">
        <Clapperboard size={15} style={{ color: 'var(--gold)' }} />
        <span className="acc-title">{scene.title || t('scAuto', { n: index + 1 })}</span>
        <span className="chip">{scene.chapterTitle}</span>
      </summary>
      <div className="acc-body space-y-3 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title={t('scJump')}
            onClick={() => router.push(`/book/${bookId}?tab=chapters&ch=${scene.chapterId}&pos=${scene.start}`)}
          >
            <ArrowRight size={13} /> {t('scJump')}
          </button>
          <span className="flex items-center gap-1">
            {HL_COLORS.map((hc, hi) => (
              <button
                key={hi}
                type="button"
                title={t('chTbHl')}
                style={{ width: 14, height: 14, borderRadius: 7, background: hc, border: '1px solid var(--line)' }}
                onClick={() => wrapHl(hi + 1)}
              />
            ))}
          </span>
        </div>
        <form
          action={async (fd) => {
            await updateSceneText(scene.id, String(fd.get('text') ?? ''))
          }}
        >
          <textarea
            ref={taRef}
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          rows={Math.min(18, Math.max(6, text.split('\n').length + 1))}
          className="textarea textarea-write"
        />
        <div>
          <div className="field-label">{t('scChars')}</div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {characters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className={`chip-btn ${on[ch.id] ? 'chip-btn-active' : ''}`}
                onClick={async () => {
                  const next = { ...on, [ch.id]: !on[ch.id] }
                  setOn(next)
                  await setSceneCharacters(
                    scene.id,
                    characters.filter((c) => next[c.id]).map((c) => c.id),
                  )
                }}
              >
                {ch.name}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--soft)' }}>
            {t('chPreviewTitle')}
          </div>
          <RichPreview text={applyDict(text, dict ?? {})} />
        </div>
          <div className="flex justify-end pt-3">
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={13} /> {t('scSave')}
            </button>
          </div>
        </form>
      </div>
    </details>
  )
}

export default function SceneSection({
  bookId,
  scenes,
  characters,
  focusScene,
  dict,
}: {
  bookId: string
  scenes: SceneRow[]
  characters: { id: string; name: string }[]
  focusScene: string | null
  dict?: DictMap
}) {
  const { t } = useLang()
  const byChapter = new Map<string, SceneRow[]>()
  for (const s of scenes) {
    const arr = byChapter.get(s.chapterId) ?? []
    arr.push(s)
    byChapter.set(s.chapterId, arr)
  }
  return (
    <div>
      {scenes.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {t('scEmpty')}
        </div>
      )}
      <div className="space-y-6">
        {[...byChapter.entries()].map(([chId, list]) => (
          <section key={chId}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--soft)' }}>
              {list[0].chapterTitle}
            </h3>
            <div className="space-y-3">
              {list.map((s, i) => (
                <SceneCard
                  key={s.id}
                  scene={s}
                  characters={characters}
                  index={i}
                  defaultOpen={focusScene === s.id}
                  bookId={bookId}
                  dict={dict}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
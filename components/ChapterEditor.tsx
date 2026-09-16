'use client'

import { useRef, useState } from 'react'
import { Save, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, ChevronRight, Eraser } from 'lucide-react'
import { saveChapter, deleteChapter } from '@/lib/actions'
import RichPreview from './RichPreview'
import { useLang } from '@/lib/useLang'

const wordsOf = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)
const SIZES = [14, 16, 18, 20, 24, 32]

export default function ChapterEditor({
  id,
  index,
  title,
  content,
}: {
  id: string
  index: number
  title: string
  content: string
}) {
  const { t } = useLang()
  const [chTitle, setChTitle] = useState(title)
  const [c, setC] = useState(content)
  const [open, setOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  const applyWrap = (start: number, end: number, before: string, after: string) => {
    const next = c.slice(0, start) + before + c.slice(start, end) + after + c.slice(end)
    setC(next)
    requestAnimationFrame(() => {
      const ta = taRef.current
      if (!ta) return
      ta.focus()
      ta.selectionStart = start + before.length
      ta.selectionEnd = end + before.length
    })
  }

  const starsBack = (pos: number) => {
    let k = 0
    while (pos - k - 1 >= 0 && c[pos - k - 1] === '*') k++
    return k
  }

  const starsFwd = (pos: number) => {
    let k = 0
    while (pos + k < c.length && c[pos + k] === '*') k++
    return k
  }

  const wrapSelection = (before: string, after: string) => {
    const ta = taRef.current
    if (!ta) return
    applyWrap(ta.selectionStart ?? c.length, ta.selectionEnd ?? c.length, before, after)
  }

  const toggleWrap = (before: string, after: string) => {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart ?? c.length
    const end = ta.selectionEnd ?? c.length
    const single = before === '*'

    const outerMatch =
      start >= before.length &&
      end + after.length <= c.length &&
      c.slice(start - before.length, start) === before &&
      c.slice(end, end + after.length) === after
    const outerOk =
      outerMatch &&
      (!single ||
        ((starsBack(start) === 1 || starsBack(start) >= 3) &&
          (starsFwd(end) === 1 || starsFwd(end) >= 3)))
    if (outerOk) {
      const next =
        c.slice(0, start - before.length) + c.slice(start, end) + c.slice(end + after.length)
      setC(next)
      requestAnimationFrame(() => {
        ta.focus()
        ta.selectionStart = start - before.length
        ta.selectionEnd = end - before.length
      })
      return
    }

    const innerMatch =
      end - start >= before.length + after.length &&
      c.slice(start, start + before.length) === before &&
      c.slice(end - after.length, end) === after
    const innerOk = innerMatch && (!single || (c[start + 1] !== '*' && c[end - 2] !== '*'))
    if (innerOk) {
      const next = c.slice(0, start) + c.slice(start + before.length, end - after.length) + c.slice(end)
      setC(next)
      requestAnimationFrame(() => {
        ta.focus()
        ta.selectionStart = start
        ta.selectionEnd = end - before.length - after.length
      })
      return
    }

    applyWrap(start, end, before, after)
  }

  const setSel = (s: number, e: number) => {
    requestAnimationFrame(() => {
      const ta = taRef.current
      if (!ta) return
      ta.focus()
      ta.selectionStart = s
      ta.selectionEnd = e
    })
  }

  const applySize = (size: number) => {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart ?? c.length
    const end = ta.selectionEnd ?? c.length
    const CLOSE = '[/size]'

    const beforePart = c.slice(0, start)
    const mOpen = beforePart.match(/\[size=(\d+)\]$/)
    const afterPart = c.slice(end)
    if (mOpen && afterPart.startsWith(CLOSE)) {
      const cur = parseInt(mOpen[1], 10)
      const openOld = mOpen[0].length
      if (cur === size) {
        const next =
          beforePart.slice(0, beforePart.length - openOld) +
          c.slice(start, end) +
          afterPart.slice(CLOSE.length)
        setC(next)
        setSel(start - openOld, end - openOld)
      } else {
        const next =
          beforePart.slice(0, beforePart.length - openOld) +
          `[size=${size}]` +
          c.slice(start, end) +
          afterPart
        const delta = -openOld + `[size=${size}]`.length
        setC(next)
        setSel(start + delta, end + delta)
      }
      return
    }

    const selText = c.slice(start, end)
    const mIn = selText.match(/^\[size=(\d+)\]([\s\S]*)\[\/size\]$/)
    if (mIn) {
      const cur = parseInt(mIn[1], 10)
      const inner = mIn[2]
      if (cur === size) {
        setC(c.slice(0, start) + inner + c.slice(end))
        setSel(start, start + inner.length)
      } else {
        setC(c.slice(0, start) + `[size=${size}]` + inner + CLOSE + c.slice(end))
        setSel(start + `[size=${size}]`.length, start + `[size=${size}]`.length + inner.length)
      }
      return
    }

    applyWrap(start, end, `[size=${size}]`, CLOSE)
  }

  const clearFormatting = () => {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart ?? c.length
    const end = ta.selectionEnd ?? c.length
    if (end <= start) return

    let sel = c.slice(start, end)
    const original = sel

    sel = sel.replace(/\[size=\d+\]/g, '').replace(/\[\/size\]/g, '')
    for (let i = 0; i < 5; i++) {
      const next = sel.replace(/\*\*([\s\S]+?)\*\*/g, '$1')
      if (next === sel) break
      sel = next
    }
    for (let i = 0; i < 5; i++) {
      const next = sel.replace(/\*([\s\S]+?)\*/g, '$1')
      if (next === sel) break
      sel = next
    }
    sel = sel.replace(/^(\s*)\[(left|center|right)\]\s*/gim, '$1')

    if (sel === original) return
    setC(c.slice(0, start) + sel + c.slice(end))
    setSel(start, start + sel.length)
  }

  const setAlign = (align: 'left' | 'center' | 'right') => {
    const ta = taRef.current
    const pos = ta ? ta.selectionStart : 0
    const before = c.slice(0, pos)
    const pIdx = before.lastIndexOf('\n\n')
    const start = pIdx === -1 ? 0 : pIdx + 2
    const rest = c.slice(start)
    const stripped = rest.replace(/^\[(left|center|right)\]\s*/i, '')
    const prefix = align === 'left' ? '' : `[${align}] `
    setC(c.slice(0, start) + prefix + stripped)
    requestAnimationFrame(() => ta?.focus())
  }

  return (
    <div className="acc">
      <button type="button" className="acc-head acc-head-btn" onClick={() => setOpen(!open)}>
        <ChevronRight size={18} className={`acc-chev ${open ? 'acc-chev-open' : ''}`} />
        <div className="ch-num">{index + 1}</div>
        <span className="acc-title">{chTitle || t('chUntitled')}</span>
        <span className="chip">
          {wordsOf(c).toLocaleString('ru-RU')} {t('chWords')}
        </span>
      </button>

      {open && (
        <div className="acc-body">
          <form
            className="space-y-4 pt-4"
            onSubmit={async (e) => {
              e.preventDefault()
              await saveChapter(id, chTitle, c)
            }}
          >
            <input
              value={chTitle}
              onChange={(e) => setChTitle(e.target.value)}
              className="input font-semibold"
              placeholder={t('chTitlePh')}
            />

            <div className="tb">
              <button type="button" title={t('chTbBold')} onClick={() => toggleWrap('**', '**')}>
                <Bold size={15} />
              </button>
              <button type="button" title={t('chTbItalic')} onClick={() => toggleWrap('*', '*')}>
                <Italic size={15} />
              </button>
              <span className="tb-sep" />
              <button type="button" title={t('chTbLeft')} onClick={() => setAlign('left')}>
                <AlignLeft size={15} />
              </button>
              <button type="button" title={t('chTbCenter')} onClick={() => setAlign('center')}>
                <AlignCenter size={15} />
              </button>
              <button type="button" title={t('chTbRight')} onClick={() => setAlign('right')}>
                <AlignRight size={15} />
              </button>
              <span className="tb-sep" />
              <select
                title={t('chTbSize')}
                defaultValue=""
                onChange={(e) => {
                  const v = e.target.value
                  if (v) applySize(parseInt(v, 10))
                  e.target.value = ''
                }}
              >
                <option value="" disabled>{t('chTbSizePh')}</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="tb-sep" />
              <button type="button" title={t('chTbClear')} onClick={clearFormatting}>
                <Eraser size={15} />
              </button>
              <span className="tb-sep" />
              <button
                type="button"
                title={showPreview ? t('chTbPreviewHide') : t('chTbPreviewShow')}
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <textarea
              ref={taRef}
              value={c}
              onChange={(e) => setC(e.target.value)}
              className="textarea textarea-write"
              placeholder={t('chTaPh')}
            />

            {showPreview && c.trim() !== '' && (
              <div className="pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
                <RichPreview text={c} />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs" style={{ color: 'var(--soft)' }}>
                {t('chCounters', { w: wordsOf(c).toLocaleString('ru-RU'), c: c.length.toLocaleString('ru-RU') })}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={async () => {
                    if (window.confirm(t('chDeleteConfirm', { title: chTitle }))) {
                      await deleteChapter(id)
                    }
                  }}
                >
                  <Trash2 size={13} /> {t('chDelete')}
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Save size={14} /> {t('chSave')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Save,
  Trash2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  ChevronRight,
  Eraser,
  ArrowUp,
  ArrowDown,
  Check,
  Plus,
  AtSign,
  Hash,
  Expand,
  Minimize,
  Languages,
  SpellCheck,
  Quote,
  X,
  Clapperboard,
} from 'lucide-react'
import RichPreview from './RichPreview'
import ExportButton from './ExportButton'
import { useLang } from '@/lib/useLang'
import { checkPunctuation, type PunctIssue } from '@/lib/punct'
import { checkGrammar } from '@/lib/grammar'
import { getQuoteStyle, normalizeQuotes } from '@/lib/quotes'
import type { StrKey } from '@/lib/i18n'
import {
  saveChapter,
  deleteChapter,
  moveChapter,
  moveBlock,
  setChapterAct,
  checkChapterExists,
  createEventFromMark,
} from '@/lib/actions'
import { registerEditor, setEditorDirty, unregisterEditor } from '@/lib/autosave'
import { applyDict, type DictMap } from '@/lib/dict'
import { HL_COLORS, scenesWouldNest } from '@/lib/scenes'
import WarnDialog from './WarnDialog'

const wordsOf = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)
const SIZES = [14, 16, 18, 20, 24, 32]

export default function ChapterEditor({
  id,
  title,
  content,
  autoOpen,
  actNames,
  actName,
  bookId,
  blockIndex,
  blockTotal,
  actIndex,
  actTotal,
  highlight,
  focusPos,
  dict,
}: {
  id: string
  title: string
  content: string
  autoOpen?: boolean
  actNames: string[]
  actName: string | null
  bookId: string
  blockIndex?: number
  blockTotal?: number
  actIndex?: number
  actTotal?: number
  highlight?: string
  focusPos?: number
  dict?: DictMap
}) {
  const { t, lang } = useLang()
  const [newActOpen, setNewActOpen] = useState(false)
  const inBlock = actName === null
  const upDisabled = inBlock ? (blockIndex ?? 0) <= 0 : (actIndex ?? 0) <= 0
  const downDisabled = inBlock
    ? (blockIndex ?? 0) >= (blockTotal ?? 1) - 1
    : (actIndex ?? 0) >= (actTotal ?? 1) - 1

  const [chTitle, setChTitle] = useState(title)
  const [c, setC] = useState(content)
  const [open, setOpen] = useState(Boolean(autoOpen))
  const [showPreview, setShowPreview] = useState(false)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const zenRef = useRef<HTMLDivElement | null>(null)

  const [isDirty, setIsDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const baseRef = useRef({ title, content })
  const liveRef = useRef({ dirty: false })
  const lastAutoRef = useRef(0)
  const saveRef = useRef<() => Promise<void>>(async () => {})
  const savingRef = useRef(false)
  const findRef = useRef<HTMLInputElement | null>(null)

  const [selInfo, setSelInfo] = useState<{ w: number; c: number } | null>(null)

  const updateSel = () => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart ?? 0
    const e = ta.selectionEnd ?? 0
    if (e <= s) {
      setSelInfo(null)
      return
    }
    const piece = ta.value.slice(s, e)
    setSelInfo({ w: wordsOf(piece), c: piece.length })
  }

  const saveNow = async () => {
    if (savingRef.current) return
    savingRef.current = true
    try {
      const exists = await checkChapterExists(id)
      if (!exists) {
        unregisterEditor(id)
        return
      }
      const res = await saveChapter(id, chTitle, c)
      setUnknownEvents(res?.unknownEvents ?? [])
      baseRef.current = { title: chTitle, content: c }
      lastAutoRef.current = Date.now()
      setIsDirty(false)
      setEditorDirty(id, false)
      setSavedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
    } finally {
      savingRef.current = false
    }
  }

  useEffect(() => {
    liveRef.current = { dirty: c !== baseRef.current.content || chTitle !== baseRef.current.title }
    saveRef.current = saveNow
  })

  useEffect(() => {
    const d = c !== baseRef.current.content || chTitle !== baseRef.current.title
    setIsDirty(d)
    setEditorDirty(id, d)
  }, [c, chTitle, id])

  useEffect(() => {
    registerEditor(id, () => saveRef.current())
    return () => unregisterEditor(id)
  }, [id])

  useEffect(() => {
    const iv = setInterval(() => {
      const sec = Number(localStorage.getItem('wv-autosave') ?? '60')
      if (!sec || sec <= 0) return
      if (!liveRef.current.dirty) return
      const now = Date.now()
      if (now - lastAutoRef.current < sec * 1000) return
      lastAutoRef.current = now
      void saveRef.current()
    }, 15000)
    return () => clearInterval(iv)
  }, [])

  const positions = useMemo(() => {
    const q = highlight?.trim() ?? ''
    if (q.length < 2) return [] as number[]
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const out: number[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(c)) !== null) {
      out.push(m.index)
      if (out.length > 200) break
    }
    return out
  }, [highlight, c])

  const [cur, setCur] = useState(0)

  const scrollToPos = (ta: HTMLTextAreaElement, pos: number) => {
    const mirror = document.createElement('div')
    const cs = getComputedStyle(ta)
    mirror.style.position = 'absolute'
    mirror.style.visibility = 'hidden'
    mirror.style.left = '-9999px'
    mirror.style.width = ta.clientWidth + 'px'
    mirror.style.font = cs.font
    mirror.style.lineHeight = cs.lineHeight
    mirror.style.padding = cs.padding
    mirror.style.border = cs.border
    mirror.style.boxSizing = cs.boxSizing
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.overflowWrap = 'break-word'
    mirror.textContent = ta.value.slice(0, pos)
    const marker = document.createElement('span')
    marker.textContent = ta.value.slice(pos, pos + 1)
    mirror.appendChild(marker)
    document.body.appendChild(mirror)
    const top = marker.offsetTop
    document.body.removeChild(mirror)
    ta.scrollTop = Math.max(0, top - ta.clientHeight / 2)
  }

  const jumpTo = (pos: number, len: number) => {
    const ta = taRef.current
    if (!ta) return
    ta.focus()
    ta.setSelectionRange(pos, pos + len)
    scrollToPos(ta, pos)
  }

  useEffect(() => {
    if (focusPos != null && focusPos >= 0) {
      const idx = positions.indexOf(focusPos)
      setCur(idx >= 0 ? idx : 0)
    }
  }, [focusPos, positions])

  useEffect(() => {
    if (autoOpen) {
      setOpen(true)
      setTimeout(() => {
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (focusPos != null && focusPos >= 0) jumpTo(focusPos, highlight?.length ?? 0)
      }, 80)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, focusPos])

  const go = (d: number) => {
    if (positions.length === 0) return
    const n = (cur + d + positions.length) % positions.length
    setCur(n)
    jumpTo(positions[n], highlight?.trim().length ?? 0)
  }

  const [zen, setZen] = useState(false)

  const enterZen = () => {
    setZen(true)
    zenRef.current?.requestFullscreen?.().catch(() => {})
  }

  const exitZen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        /* уже вне полноэкранного режима */
      }
    }
    setZen(false)
  }

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setZen(false)
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const [lq, setLq] = useState('')
  const [lcur, setLcur] = useState(0)

  const lpos = useMemo(() => {
    const q = lq.trim().toLowerCase()
    if (!q) return [] as number[]
    const out: number[] = []
    const low = c.toLowerCase()
    let i = low.indexOf(q)
    while (i !== -1 && out.length < 500) {
      out.push(i)
      i = low.indexOf(q, i + q.length)
    }
    return out
  }, [lq, c])

  useEffect(() => {
    setLcur(0)
  }, [lq])

  const step = (d: number) => {
    if (lpos.length === 0) return
    const n = (lcur + d + lpos.length) % lpos.length
    setLcur(n)
    jumpTo(lpos[n], lq.trim().length)
  }

  useEffect(() => {
    if (!zen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const el = e.target as HTMLElement | null
      if (el && el.dataset && el.dataset.ls === '1') return
      void exitZen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zen])

  const restore = (ta: HTMLTextAreaElement, s: number, e: number, scroll: number) => {
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = s
      ta.selectionEnd = e
      ta.scrollTop = scroll
    })
  }

  const applyWrap = (start: number, end: number, before: string, after: string) => {
    const ta = taRef.current
    const scroll = ta ? ta.scrollTop : 0
    const next = c.slice(0, start) + before + c.slice(start, end) + after + c.slice(end)
    setC(next)
    if (ta) restore(ta, start + before.length, end + before.length, scroll)
  }

  const starsBack = (pos: number) => {
    let k = 0
    while (pos - k - 1 >= 0 && c[pos - k - 1] === ' ') k++
    return k
  }

  const starsFwd = (pos: number) => {
    let k = 0
    while (pos + k < c.length && c[pos + k] === ' ') k++
    return k
  }

  const toggleWrap = (before: string, after: string) => {
    const ta = taRef.current
    if (!ta) return
    const scroll = ta.scrollTop
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
      restore(ta, start - before.length, end - before.length, scroll)
      return
    }
    const innerMatch =
      end - start >= before.length + after.length &&
      c.slice(start, start + before.length) === before &&
      c.slice(end - after.length, end) === after
    const innerOk = innerMatch && (!single || (c[start + 1] !== ' ' && c[end - 2] !== ' '))
    if (innerOk) {
      const next =
        c.slice(0, start) + c.slice(start + before.length, end - after.length) + c.slice(end)
      setC(next)
      restore(ta, start, end - before.length - after.length, scroll)
      return
    }
    applyWrap(start, end, before, after)
  }

  const setSel = (s: number, e: number, scroll: number) => {
    const ta = taRef.current
    if (ta) restore(ta, s, e, scroll)
  }

  const applySize = (size: number) => {
    const ta = taRef.current
    if (!ta) return
    const scroll = ta.scrollTop
    const start = ta.selectionStart ?? c.length
    const end = ta.selectionEnd ?? c.length
    const CLOSE = '[/size]'
    const beforePart = c.slice(0, start)
    const mOpen = beforePart.match(/\[size=(\d+)\]$/)
    const afterPart = c.slice(end)
    if (mOpen && afterPart.startsWith(CLOSE)) {
      const curSize = parseInt(mOpen[1], 10)
      const openOld = mOpen[0].length
      if (curSize === size) {
        const next =
          beforePart.slice(0, beforePart.length - openOld) +
          c.slice(start, end) +
          afterPart.slice(CLOSE.length)
        setC(next)
        setSel(start - openOld, end - openOld, scroll)
      } else {
        const next =
          beforePart.slice(0, beforePart.length - openOld) +
          `[size=${size}]` +
          c.slice(start, end) +
          afterPart
        const delta = -openOld + `[size=${size}]`.length
        setC(next)
        setSel(start + delta, end + delta, scroll)
      }
      return
    }
    const selText = c.slice(start, end)
    const mIn = selText.match(/^\[size=(\d+)\]([\s\S]*?)\[\/size\]$/)
    if (mIn) {
      const curSize = parseInt(mIn[1], 10)
      const inner = mIn[2]
      if (curSize === size) {
        setC(c.slice(0, start) + inner + c.slice(end))
        setSel(start, start + inner.length, scroll)
      } else {
        setC(c.slice(0, start) + `[size=${size}]` + inner + CLOSE + c.slice(end))
        setSel(
          start + `[size=${size}]`.length,
          start + `[size=${size}]`.length + inner.length,
          scroll,
        )
      }
      return
    }
    applyWrap(start, end, `[size=${size}]`, CLOSE)
  }

  const clearFormatting = () => {
    const ta = taRef.current
    if (!ta) return
    const scroll = ta.scrollTop
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
    setSel(start, start + sel.length, scroll)
  }

  const setAlign = (align: 'left' | 'center' | 'right') => {
    const ta = taRef.current
    const scroll = ta ? ta.scrollTop : 0
    const pos = ta ? ta.selectionStart : 0
    const before = c.slice(0, pos)
    const pIdx = before.lastIndexOf('\n\n')
    const start = pIdx === -1 ? 0 : pIdx + 2
    const rest = c.slice(start)
    const stripped = rest.replace(/^\[(left|center|right)\]\s*/i, '')
    const prefix = align === 'left' ? '' : `[${align}]`
    setC(c.slice(0, start) + prefix + stripped)
    const delta = prefix.length - (rest.length - stripped.length)
    requestAnimationFrame(() => {
      if (!ta) return
      ta.focus()
      const np = Math.max(start, pos + delta)
      ta.selectionStart = np
      ta.selectionEnd = np
      ta.scrollTop = scroll
    })
  }

  const words = wordsOf(chTitle) + wordsOf(c)
  const chars = chTitle.length + c.length

  const [punctOpen, setPunctOpen] = useState(false)
  const [warnText, setWarnText] = useState<string | null>(null)
  const [unknownEvents, setUnknownEvents] = useState<string[]>([])
  const punctIssues = useMemo(
    () => (punctOpen ? [...checkPunctuation(c), ...checkGrammar(c)] : []),
    [punctOpen, c],
  )
  const fixIssue = (iss: PunctIssue) => {
    setC((prev) => prev.slice(0, iss.pos) + iss.fix + prev.slice(iss.pos + iss.len))
  }
  const fixAllPunct = () => {
    setC((prev) => {
      let out = prev
      const list = [...checkPunctuation(out), ...checkGrammar(out)].sort((a, b) => b.pos - a.pos)
      for (const iss of list) out = out.slice(0, iss.pos) + iss.fix + out.slice(iss.pos + iss.len)
      return out
    })
  }
  const applyQuotes = () => {
    const ta = taRef.current
    const style = getQuoteStyle()
    const s = ta?.selectionStart ?? 0
    const e = ta?.selectionEnd ?? 0
    if (e > s && ta) {
      const next = c.slice(0, s) + normalizeQuotes(c.slice(s, e), style) + c.slice(e)
      setC(next)
      restore(ta, s, e, ta.scrollTop)
    } else {
      setC(normalizeQuotes(c, style))
    }
  }

    const wrapEvent = () => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart ?? 0
    const e = ta.selectionEnd ?? 0
    if (e > s) {
      const sel = c.slice(s, e)
      if (sel.startsWith('[#') && sel.endsWith(']')) {
        const next = c.slice(0, s) + sel.slice(2, -1) + c.slice(e)
        setC(next)
        restore(ta, s, e - 3, ta.scrollTop)
        return
      }
      if (s >= 2 && e + 1 <= c.length && c.slice(s - 2, e + 1).startsWith('[#') && c.slice(s - 2, e + 1).endsWith(']')) {
        const next = c.slice(0, s - 2) + sel + c.slice(e + 1)
        setC(next)
        restore(ta, s - 2, e - 2, ta.scrollTop)
        return
      }
      const normSel = sel.trim().replace(/\s+/g, '_')
      const next = c.slice(0, s) + '[#' + normSel + ']' + c.slice(e)
      setC(next)
      restore(ta, s + 2, s + 2 + normSel.length, ta.scrollTop)
      return
    }
    toggleWrap('[#', ']')
  }
  const wrapPair = (open: string, close: string) => {
    const ta = taRef.current
    if (!ta) return
    const s = ta.selectionStart ?? 0
    const e = ta.selectionEnd ?? 0
    const sel = c.slice(s, e)
    const outerOk =
      s >= open.length &&
      e + close.length <= c.length &&
      c.slice(s - open.length, s) === open &&
      c.slice(e, e + close.length) === close
    if (outerOk) {
      const next = c.slice(0, s - open.length) + sel + c.slice(e + close.length)
      setC(next)
      restore(ta, s - open.length, e - open.length, ta.scrollTop)
      return
    }
    const innerOk = sel.startsWith(open) && sel.endsWith(close) && sel.length >= open.length + close.length
    if (innerOk) {
      const next = c.slice(0, s) + sel.slice(open.length, sel.length - close.length) + c.slice(e)
      setC(next)
      restore(ta, s, e - open.length - close.length, ta.scrollTop)
      return
    }
    if (open === '[sc:]' && scenesWouldNest(c, s, e)) {
      setWarnText(t('scNestWarn'))
      return
    }
    const next = c.slice(0, s) + open + sel + close + c.slice(e)
    setC(next)
    restore(ta, s + open.length, e + open.length, ta.scrollTop)
  }

  return (
    <div className="acc" ref={rootRef}>
      <div
        role="button"
        tabIndex={0}
        className="acc-head acc-head-btn"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(!open)
          }
        }}
      >
        <ChevronRight size={18} className={`acc-chev ${open ? 'acc-chev-open' : ''}`} />
        <span className="acc-title">{chTitle || t('chUntitled')}</span>
        <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="mini-btn"
            title={t('chMoveUp')}
            disabled={upDisabled}
            onClick={async () => {
              if (inBlock) await moveBlock(bookId, 'c:' + id, -1)
              else await moveChapter(id, -1)
            }}
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            className="mini-btn"
            title={t('chMoveDown')}
            disabled={downDisabled}
            onClick={async () => {
              if (inBlock) await moveBlock(bookId, 'c:' + id, 1)
              else await moveChapter(id, 1)
            }}
          >
            <ArrowDown size={14} />
          </button>
          <select
            className="act-select"
            title={t('chAct')}
            defaultValue={actName ?? ''}
            onChange={async (e) => {
              await setChapterAct(id, e.target.value || null)
            }}
          >
            <option value="">{t('chNoAct')}</option>
            {actNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {newActOpen ? (
            <form
              className="flex items-center gap-1"
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const name = String(fd.get('newact') ?? '').trim()
                if (name) await setChapterAct(id, name)
                setNewActOpen(false)
              }}
            >
              <input name="newact" className="act-select" placeholder={t('chActNewPh')} autoFocus />
              <button type="submit" className="mini-btn" title={t('chActNew')}>
                <Check size={13} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="mini-btn"
              title={t('chActNew')}
              onClick={() => setNewActOpen(true)}
            >
              <Plus size={13} />
            </button>
          )}
        </span>
        <span className="chip">
          {words.toLocaleString('ru-RU')} {t('chWords')}
        </span>
      </div>
      {open && (
        <div className="acc-body">
          <form
            className="space-y-4 pt-4"
            onSubmit={async (e) => {
              e.preventDefault()
              await saveNow()
            }}
          >
            <input
              value={chTitle}
              onChange={(e) => setChTitle(e.target.value)}
              className="input font-semibold"
              placeholder={t('chTitlePh')}
            />
            {positions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="chip">{t('chMatchNav', { i: cur + 1, n: positions.length })}</span>
                <button type="button" className="mini-btn" title={t('chMoveUp')} onClick={() => go(-1)}>
                  <ArrowUp size={13} />
                </button>
                <button type="button" className="mini-btn" title={t('chMoveDown')} onClick={() => go(1)}>
                  <ArrowDown size={13} />
                </button>
              </div>
            )}
            <div
              ref={zenRef}
              style={
                zen
                  ? {
                      position: 'fixed',
                      inset: 0,
                      zIndex: 130,
                      background: '#ffffff',
                      color: '#201c17',
                      padding: '1.5rem 0',
                      overflow: 'auto',
                    }
                  : undefined
              }
            >
              <div
                style={
                  zen
                    ? {
                        width: '80%',
                        maxWidth: 'none',
                        margin: '0 auto',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '.75rem',
                      }
                    : undefined
                }
              >
                {zen && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="mini-btn"
                      title={t('chZenExit')}
                      onClick={() => {
                        void exitZen()
                      }}
                    >
                      <Minimize size={15} />
                    </button>
                    <input
                      value={chTitle}
                      onChange={(e) => setChTitle(e.target.value)}
                      className="input flex-1 font-semibold"
                    />
                    <span className="text-xs" style={{ color: 'var(--soft)' }}>
                      {isDirty ? t('chUnsaved') : savedAt ? t('chSavedAt', { time: savedAt }) : t('chSaved')}
                    </span>
                    <button
                      type="button"
                      className="mini-btn"
                      title={t('chSave')}
                      onClick={() => {
                        void saveNow()
                      }}
                      style={isDirty ? { color: 'var(--gold)' } : undefined}
                    >
                      <Save size={15} />
                    </button>
                  </div>
                )}
                <div className="tb">
                  <button type="button" title={t('chTbBold')} onClick={() => toggleWrap('**', '**')}>
                    <Bold size={15} />
                  </button>
                  <button type="button" title={t('chTbItalic')} onClick={() => toggleWrap('*', '*')}>
                    <Italic size={15} />
                  </button>
                  <span className="tb-sep" />
                  <button type="button" title={t('chTbMention')} onClick={() => toggleWrap('[@', ']')}>
                    <AtSign size={15} />
                  </button>
                  <button type="button" title={t('chTbEvent')} onClick={wrapEvent}>
                    <Hash size={15} />
                  </button>
                  <button type="button" title={t('chTbDict')} onClick={() => toggleWrap('[~', ']')}>
                    <Languages size={15} />
                  </button>
                  <button type="button" title={t('chTbPunct')} onClick={() => setPunctOpen(!punctOpen)}>
                    <SpellCheck size={15} />
                  </button>
                  <button type="button" title={t('chTbQuotes')} onClick={applyQuotes}>
                    <Quote size={15} />
                  </button>
                  <button type="button" title={t('chTbScene')} onClick={() => wrapPair('[sc:]', '[/sc]')}>
                    <Clapperboard size={15} />
                  </button>
                  <span className="flex items-center gap-1">
                    {HL_COLORS.map((hc, hi) => (
                      <button
                        key={hi}
                        type="button"
                        title={t('chTbHl')}
                        style={{ width: 14, height: 14, borderRadius: 7, background: hc, border: '1px solid var(--line)' }}
                        onClick={() => wrapPair(`[hl=${hi + 1}]`, '[/hl]')}
                      />
                    ))}
                  </span>
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
                  <input
                    ref={findRef}
                    data-ls="1"
                    value={lq}
                    onChange={(e) => setLq(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        step(e.shiftKey ? -1 : 1)
                      }
                      if (e.key === 'Escape') {
                        e.stopPropagation()
                        setLq('')
                      }
                    }}
                    className="tb-find"
                    placeholder={t('chFindPh')}
                  />
                  <span className="text-xs" style={{ color: 'var(--soft)', minWidth: '2.5rem', textAlign: 'center' }}>
                    {lq.trim() ? `${Math.min(lcur + 1, lpos.length || 0)}/${lpos.length}` : ''}
                  </span>
                  <button type="button" title={t('chFindPrev')} onClick={() => step(-1)}>
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" title={t('chFindNext')} onClick={() => step(1)}>
                    <ArrowDown size={14} />
                  </button>
                  <span className="tb-sep" />
                  <button
                    type="button"
                    title={showPreview ? t('chTbPreviewHide') : t('chTbPreviewShow')}
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <span className="tb-sep" />
                  <button
                    type="button"
                    title={t('chSave')}
                    onClick={() => {
                      void saveNow()
                    }}
                    style={isDirty ? { color: 'var(--gold)' } : undefined}
                  >
                    <Save size={15} />
                  </button>
                  <span className="tb-sep" />
                  <ExportButton bookId={bookId} baseName={chTitle || t('chUntitled')} chapterId={id} mini />
                  <span className="tb-sep" />
                  <button
                    type="button"
                    title={zen ? t('chZenExit') : t('chZen')}
                    onClick={() => {
                      if (zen) void exitZen()
                      else enterZen()
                    }}
                  >
                    {zen ? <Minimize size={15} /> : <Expand size={15} />}
                  </button>
                </div>
        {punctOpen && (
          <div className="card p-3 mt-2 space-y-2" style={{ background: 'var(--soft-bg)' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold">
                {t('chPunctTitle')} · {punctIssues.length}
              </span>
              <span className="flex gap-1">
                <button type="button" className="mini-btn" disabled={punctIssues.length === 0} onClick={fixAllPunct}>
                  {t('chPunctFixAll')}
                </button>
                <button type="button" className="mini-btn" onClick={() => setPunctOpen(false)}>
                  <X size={13} />
                </button>
              </span>
            </div>
            {punctIssues.length === 0 ? (
              <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('chPunctClean')}</div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {punctIssues.slice(0, 50).map((iss, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <code className="chip">{iss.bad || '·'}</code>
                    <span className="flex-1 truncate" style={{ color: 'var(--soft)' }}>
                      {t(iss.msgKey as StrKey)}
                    </span>
                    <button type="button" className="mini-btn" title={t('chPunctJump')} onClick={() => jumpTo(iss.pos, iss.len)}>
                      →
                    </button>
                    <button type="button" className="mini-btn" title={t('chPunctFix')} onClick={() => fixIssue(iss)}>
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

                {unknownEvents.length > 0 && (
          <div className="card p-3 mt-2 space-y-2" style={{ background: 'var(--soft-bg)' }}>
            <div className="text-xs font-semibold">{t('chEvUnknown')}</div>
            <div className="flex flex-wrap gap-2">
              {unknownEvents.map((name) => (
                <span key={name} className="chip">
                  {name.replace(/_/g, ' ')}
                  <button
                    type="button"
                    className="mini-btn"
                    title={t('chEvCreate')}
                    onClick={async () => {
                      const pos = c.indexOf('[#' + name + ']')
                      await createEventFromMark(bookId, name, id, pos >= 0 ? pos : null)
                      setUnknownEvents((cur) => cur.filter((x) => x !== name))
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
                <textarea
                  ref={taRef}
                  data-wv-editor="1"
                  value={c}
                  onChange={(e) => setC(e.target.value)}
                  onSelect={updateSel}
                  spellCheck={true}
                  lang={lang === 'ru' ? 'ru' : 'en'}
                  onKeyDown={(e) => {
                    if (e.key === 'F3') {
                      e.preventDefault()
                      step(e.shiftKey ? -1 : 1)
                    } else if (e.key === 'Escape' && !zen && lq.trim()) {
                      e.preventDefault()
                      findRef.current?.focus()
                    }
                  }}
                  className="textarea textarea-write"
                  style={
                    zen
                      ? {
                          flex: 1,
                          resize: 'none',
                          minHeight: 0,
                          border: 'none',
                          background: 'transparent',
                          boxShadow: 'none',
                          outline: 'none',
                          borderRadius: 0,
                          padding: 0,
                          color: 'inherit',
                          caretColor: '#201c17',
                        }
                      : undefined
                  }
                  placeholder={t('chTaPh')}
                />
                {zen && (
                  <div className="text-xs" style={{ color: 'var(--soft)' }}>
                    {t('chCounters', {
                      w: words.toLocaleString('ru-RU'),
                      c: chars.toLocaleString('ru-RU'),
                    })}
                    {selInfo && (
                      <>
                        {' · '}
                        {t('chSel', {
                          w: selInfo.w.toLocaleString('ru-RU'),
                          c: selInfo.c.toLocaleString('ru-RU'),
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {showPreview && !zen && c.trim() !== '' && (
              <div className="pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--soft)' }}>
                    {t('chPreviewTitle')}
                  </span>
                  <button
                    type="button"
                    className="mini-btn"
                    title={t('chTbPreviewHide')}
                    onClick={() => setShowPreview(false)}
                  >
                    <EyeOff size={14} />
                  </button>
                </div>
                <RichPreview text={applyDict(c, dict ?? {})} highlight={highlight} />
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs" style={{ color: 'var(--soft)' }}>
                {t('chCounters', { w: words.toLocaleString('ru-RU'), c: chars.toLocaleString('ru-RU') })}
                {selInfo && (
                  <>
                    {' · '}
                    {t('chSel', {
                      w: selInfo.w.toLocaleString('ru-RU'),
                      c: selInfo.c.toLocaleString('ru-RU'),
                    })}
                  </>
                )}
                {' · '}
                {isDirty ? t('chUnsaved') : savedAt ? t('chSavedAt', { time: savedAt }) : t('chSaved')}
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
      <WarnDialog text={warnText} onClose={() => setWarnText(null)} />
    </div>
  )
}
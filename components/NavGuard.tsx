'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'

type WinHooks = {
  __wvDirtyCount?: number
  __wvSaveAll?: () => Promise<void>
  wv?: unknown
}

const dirtyForms = (): HTMLFormElement[] =>
  Array.from(document.forms).filter((f) => f.dataset.wvDirty === '1')

export default function NavGuard() {
  const { t } = useLang()
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const [pending, setPending] = useState<string | null>(null)

  useEffect(() => {
    const onInput = (e: Event) => {
      const el = e.target as HTMLElement | null
      if (!el || !el.closest) return
      if (el.closest('[data-wv-editor]')) return
      const form = el.closest('form')
      if (form) form.dataset.wvDirty = '1'
    }
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement
      if (form.dataset.wvDirty) delete form.dataset.wvDirty
    }
    document.addEventListener('input', onInput, true)
    document.addEventListener('change', onInput, true)
    document.addEventListener('submit', onSubmit, true)
    return () => {
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('change', onInput, true)
      document.removeEventListener('submit', onSubmit, true)
    }
  }, [])

  const isDirty = () => {
    const w = window as unknown as WinHooks
    return (w.__wvDirtyCount ?? 0) > 0 || dirtyForms().length > 0
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const el = e.target as HTMLElement | null
      const a = el?.closest ? (el.closest('a[href]') as HTMLAnchorElement | null) : null
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      if (!href.startsWith('/') || href.startsWith('//')) return
      if (href.startsWith('/api/')) return
      if (a.target === '_blank') return
      if (!isDirty()) return
      e.preventDefault()
      setPending(href)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const isElectron = typeof (window as unknown as WinHooks).wv !== 'undefined'
    if (isElectron) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty()) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!pending) return null
  const go = async (save: boolean) => {
    const href = pending
    setPending(null)
    const w = window as unknown as WinHooks
    if (save) {
      try {
        await w.__wvSaveAll?.()
      } catch {
        /* ignore */
      }
      const forms = dirtyForms()
      for (const f of forms) {
        if (!f.reportValidity()) return
      }
      for (const f of forms) f.requestSubmit()
      if (forms.length > 0) await new Promise((r) => setTimeout(r, 900))
    }
    routerRef.current.push(href)
  }
  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,.45)' }}
    >
      <div className="card p-5 w-full max-w-md space-y-4">
        <div className="font-bold">{t('ngTitle')}</div>
        <p className="text-sm" style={{ color: 'var(--soft)' }}>{t('ngText')}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPending(null)}>
            {t('ngCancel')}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void go(false)}>
            {t('ngDiscard')}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void go(true)}>
            {t('ngSave')}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Mail, Copy, Check, Send } from 'lucide-react'
import { APP_SUPPORT_EMAIL, APP_VERSION } from '@/lib/appinfo'
import { useLang } from '@/lib/useLang'

export default function ContactForm() {
  const { t } = useLang()
  const [copied, setCopied] = useState<'addr' | 'msg' | null>(null)

  const copy = async (text: string, kind: 'addr' | 'msg') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* буфер обмена недоступен — молча игнорируем */
    }
  }

  const buildBody = (name: string, email: string, message: string) =>
    [
      message,
      '',
      '---',
      `${t('ctName')}: ${name || '—'}`,
      `${t('ctEmail')}: ${email || '—'}`,
      `${t('ctVersion')}: ${APP_VERSION}`,
      `OS: ${typeof navigator !== 'undefined' ? navigator.userAgent : '—'}`,
    ].join('\n')

  const readForm = (form: HTMLFormElement) => {
    const fd = new FormData(form)
    return {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Mail size={14} style={{ color: 'var(--soft)' }} />
        <span className="text-sm font-semibold">{APP_SUPPORT_EMAIL}</span>
        <button
          type="button"
          className="mini-btn"
          title={t('ctCopyAddr')}
          onClick={() => copy(APP_SUPPORT_EMAIL, 'addr')}
        >
          {copied === 'addr' ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          const { name, email, message } = readForm(e.currentTarget)
          if (!message) return
          const subject = encodeURIComponent(`${t('ctSubject')} · ${APP_VERSION}`)
          const body = encodeURIComponent(buildBody(name, email, message))
          window.open(`mailto:${APP_SUPPORT_EMAIL}?subject=${subject}&body=${body}`, '_blank')
        }}
      >
        <div className="grid md:grid-cols-2 gap-2">
          <input name="name" className="input" placeholder={t('ctNamePh')} />
          <input name="email" type="email" className="input" placeholder={t('ctEmailPh')} />
        </div>
        <textarea name="message" required rows={3} className="textarea text-sm" placeholder={t('ctMessagePh')} />
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary btn-sm">
            <Send size={13} /> {t('ctSend')}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              const form = (e.currentTarget as HTMLButtonElement).form
              if (!form) return
              const { name, email, message } = readForm(form)
              copy(buildBody(name, email, message), 'msg')
            }}
          >
            {copied === 'msg' ? <Check size={13} /> : <Copy size={13} />} {t('ctCopyMsg')}
          </button>
        </div>
      </form>
    </div>
  )
}
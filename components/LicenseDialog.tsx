'use client'

import { useState } from 'react'
import { Sparkles, KeyRound, X } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { useLicense } from './LicenseProvider'
import { activateTrial, activateKey, dropKey } from '@/lib/licenseActions'
import { APP_URL, DONATE_LINKS } from '@/lib/appinfo'

export default function LicenseDialog({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang()
  const { state, refresh } = useLicense()
  const [keyText, setKeyText] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const daysLeft = state.expiresAt
    ? Math.max(0, Math.ceil((new Date(state.expiresAt).getTime() - Date.now()) / 86400000))
    : 0
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(20, 17, 14, 0.45)', zIndex: 300 }}
      onClick={onClose}
    >
      <div className="card p-5 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg flex items-center gap-2">
            <Sparkles size={16} /> {t('licDialogTitle')}
          </span>
          <button type="button" className="mini-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="text-sm" style={{ color: 'var(--soft)' }}>
          {state.source === 'key'
            ? state.expiresAt
              ? t('licStatusProExp', {
                  date: new Date(state.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US'),
                })
              : t('licStatusPro')
            : state.source === 'trial'
              ? t('licStatusTrial', { d: daysLeft })
              : t('licStatusFree')}
        </div>
        {!state.isPro && state.trialAvailable && (
          <>
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={async () => {
                const res = await activateTrial()
                if (!res.ok) setErr(t('licTrialUsed'))
                else {
                  setErr(null)
                  await refresh()
                }
              }}
            >
              <Sparkles size={14} /> {t('licTrialBtn')}
            </button>
            <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('licTrialOffer')}</div>
          </>
        )}
        {!state.isPro && !state.trialAvailable && (
          <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('licTrialUsed')}</div>
        )}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder={t('licKeyPh')}
              value={keyText}
              onChange={(e) => setKeyText(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                const res = await activateKey(keyText)
                if (!res.ok) setErr(t('licKeyBad'))
                else {
                  setErr(null)
                  setKeyText('')
                  await refresh()
                }
              }}
            >
              <KeyRound size={13} /> {t('licKeyApply')}
            </button>
          </div>
          {err && <div className="text-xs" style={{ color: '#8c3a2b' }}>{err}</div>}
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="btn btn-primary btn-sm" href={APP_URL} target="_blank" rel="noopener noreferrer">
            {t('licBuy')}
          </a>
          {DONATE_LINKS.map((l) => (
            <a key={l.url} className="btn btn-ghost btn-sm" href={l.url} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
          {state.source === 'key' && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await dropKey()
                await refresh()
              }}
            >
              {t('licDropKey')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
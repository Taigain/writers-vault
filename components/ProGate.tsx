'use client'

import { Sparkles } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { usePremium } from './LicenseProvider'
import type { PremiumKey } from '@/lib/premium'

export default function ProGate({ feature, children }: { feature: PremiumKey; children: React.ReactNode }) {
  const { shown, unlocked, open } = usePremium(feature)
  const { t } = useLang()
  if (!shown) return null
  if (unlocked) return <>{children}</>
  return (
    <div className="card p-4 flex flex-wrap items-center gap-3">
      <span className="chip pro-chip">
        <Sparkles size={11} /> PRO
      </span>
      <span className="text-sm" style={{ color: 'var(--soft)' }}>{t('licProRequired')}</span>
      <button type="button" className="btn btn-primary btn-sm" onClick={open}>
        {t('licLearn')}
      </button>
    </div>
  )
}
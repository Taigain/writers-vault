'use client'

import { AlertTriangle } from 'lucide-react'
import { useLang } from '@/lib/useLang'

export default function WarnDialog({ text, onClose }: { text: string | null; onClose: () => void }) {
  const { t } = useLang()
  if (!text) return null
  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,.45)' }}
      onClick={onClose}
    >
      <div className="card p-5 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle size={16} style={{ color: '#8c3a2b' }} />
          {t('warnTitle')}
        </div>
        <p className="text-sm" style={{ color: 'var(--soft)' }}>{text}</p>
        <div className="flex justify-end">
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            {t('warnClose')}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLang } from '@/lib/useLang'

type Bridge = {
  checkForUpdates: () => Promise<{ ok: boolean; reason?: string; version?: string | null }>
  onUpdateStatus: (cb: (status: string) => void) => () => void
}

type Status = 'idle' | 'checking' | 'latest' | 'available' | 'downloaded' | 'error' | 'dev'

export default function CheckUpdatesButton() {
  const { t } = useLang()
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const bridge = (window as unknown as { wvBridge?: Bridge }).wvBridge
    if (!bridge) return
    return bridge.onUpdateStatus((s) => {
      if (s === 'available') setStatus('available')
      if (s === 'downloaded') setStatus('downloaded')
      if (s === 'not-available') setStatus('latest')
      if (s === 'error') setStatus('error')
    })
  }, [])

  const note =
    status === 'checking' ? t('updChecking')
    : status === 'latest' ? t('updLatest')
    : status === 'available' ? t('updAvailable')
    : status === 'downloaded' ? t('updDownloaded')
    : status === 'error' ? t('updError')
    : status === 'dev' ? t('updDev')
    : ''

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={status === 'checking'}
        onClick={async () => {
          const bridge = (window as unknown as { wvBridge?: Bridge }).wvBridge
          if (!bridge) {
            setStatus('dev')
            return
          }
          setStatus('checking')
          const res = await bridge.checkForUpdates()
          if (!res.ok && res.reason === 'dev') setStatus('dev')
          if (!res.ok && res.reason === 'error') setStatus('error')
        }}
      >
        <RefreshCw size={13} /> {t('updCheck')}
      </button>
      {status !== 'idle' && (
        <span className="text-xs" style={{ color: 'var(--soft)' }}>{note}</span>
      )}
    </div>
  )
}
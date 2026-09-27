'use client'

import { useEffect, useState } from 'react'
import ChangelogModal from './ChangelogModal'
import { CHANGELOG, entriesBetween } from '@/lib/changelog'
import { useLang } from '@/lib/useLang'

const KEY = 'wv-seen-version'

export default function WhatsNewModal({ current }: { current: string }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [prev, setPrev] = useState<string | null>(null)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(KEY)
      if (seen && seen !== current) {
        setPrev(seen)
        setOpen(true)
      }
      localStorage.setItem(KEY, current)
    } catch {
      /* ignore */
    }
  }, [current])

  if (!open || !prev) return null
  const delta = entriesBetween(prev, current)
  const entries = delta.length > 0 ? delta : CHANGELOG.filter((e) => e.version === current)
  return (
    <ChangelogModal
      open={open}
      onClose={() => setOpen(false)}
      title={t('wnTitle', { v: current })}
      entries={entries}
    />
  )
}
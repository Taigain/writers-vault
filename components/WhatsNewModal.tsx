'use client'

import { useEffect, useState } from 'react'
import ChangelogModal from './ChangelogModal'
import { CHANGELOG, entriesBetween } from '@/lib/changelog'
import { useLang } from '@/lib/useLang'

const KEY = 'wv-seen-version'

type WvBridge = {
  seenGet?: () => Promise<string | null>
  seenSet?: (v: string) => Promise<unknown>
}

const bridge = (): WvBridge => (window as unknown as { wv?: WvBridge }).wv ?? {}

async function readSeen(): Promise<string | null> {
  const w = bridge()
  if (w.seenGet) {
    try {
      const v = await w.seenGet()
      if (v) return v
    } catch {
      /* ignore */
    }
  }
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

async function writeSeen(v: string) {
  const w = bridge()
  if (w.seenSet) {
    try {
      await w.seenSet(v)
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.setItem(KEY, v)
  } catch {
    /* ignore */
  }
}

export default function WhatsNewModal({ current }: { current: string }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [prev, setPrev] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      const seen = await readSeen()
      if (!alive) return
      if (seen && seen !== current) {
        setPrev(seen)
        setOpen(true)
      }
      await writeSeen(current)
    })()
    return () => {
      alive = false
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
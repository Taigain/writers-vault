'use client'

import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import ChangelogModal from './ChangelogModal'
import { CHANGELOG } from '@/lib/changelog'
import { useLang } from '@/lib/useLang'

export default function ChangelogButton() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        <ScrollText size={14} /> {t('stChangelog')}
      </button>
      <ChangelogModal open={open} onClose={() => setOpen(false)} title={t('clTitle')} entries={CHANGELOG} />
    </>
  )
}
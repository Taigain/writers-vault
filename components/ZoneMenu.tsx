'use client'

import { useEffect, useRef } from 'react'
import { Check, Lock, Settings2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { DictGroupRow } from '@/lib/actions'
import type { ZoneKind } from '@/lib/zones'

export default function ZoneMenu({
  groups,
  unlocked,
  current,
  onPick,
  onManage,
  onClose,
}: {
  groups: DictGroupRow[]
  unlocked: boolean
  current: ZoneKind | null
  onPick: (p: ZoneKind) => void
  onManage: () => void
  onClose: () => void
}) {
  const { t } = useLang()
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [onClose])
  const same = (p: ZoneKind) =>
    current !== null &&
    ((p.type === 'common' && current.type === 'common') ||
      (p.type === 'named' && current.type === 'named' && p.slug === current.slug))
  return (
    <div ref={ref} className="zm-menu card p-2">
      <button type="button" className="zm-item" onClick={() => onPick({ type: 'common' })}>
        <span className="zm-dot" style={{ background: 'var(--soft)' }} />
        <span className="flex-1 text-left">{t('zmCommon')}</span>
        {same({ type: 'common' }) && <Check size={13} />}
      </button>
      {groups.map((g) =>
        unlocked ? (
          <button
            key={g.id}
            type="button"
            className="zm-item"
            onClick={() => onPick({ type: 'named', slug: g.slug })}
          >
            <span className="zm-dot" style={{ background: g.color || 'var(--gold)' }} />
            <span className="flex-1 text-left">{g.name}</span>
            {same({ type: 'named', slug: g.slug }) && <Check size={13} />}
          </button>
        ) : (
          <div key={g.id} className="zm-item" style={{ opacity: 0.5, cursor: 'default' }}>
            <span className="zm-dot" style={{ background: g.color || 'var(--gold)' }} />
            <span className="flex-1 text-left">{g.name}</span>
            <Lock size={12} />
          </div>
        ),
      )}
      {!unlocked && groups.length === 0 && (
        <div className="zm-item" style={{ opacity: 0.6, cursor: 'default' }}>
          <Lock size={12} />
          <span className="flex-1 text-left">{t('zmLocked')}</span>
        </div>
      )}
      <div className="zm-sep" />
      <button type="button" className="zm-item" onClick={onManage}>
        <Settings2 size={13} />
        <span className="flex-1 text-left">{t('zmManage')}</span>
      </button>
    </div>
  )
}
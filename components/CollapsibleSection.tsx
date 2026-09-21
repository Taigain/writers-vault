'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export default function CollapsibleSection({
  id,
  title,
  count,
  icon,
  actions,
  defaultOpen = true,
  children,
}: {
  id: string
  title: string
  count?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    const v = localStorage.getItem('wv-fold-' + id)
    if (v !== null) setOpen(v === '1')
  }, [id])

  const toggle = () => {
    setOpen((o) => {
      localStorage.setItem('wv-fold-' + id, o ? '0' : '1')
      return !o
    })
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <button type="button" className="fold-head flex items-center gap-2" onClick={toggle}>
          <ChevronRight size={16} className={`acc-chev ${open ? 'acc-chev-open' : ''}`} />
          {icon}
          <span className="text-lg font-bold">{title}</span>
          {count !== undefined && <span className="chip">{count}</span>}
        </button>
        <div className="flex-1" />
        {actions}
      </div>
      {open && <div>{children}</div>}
    </section>
  )
}
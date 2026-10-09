'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FontOption = { key: string; label: string; stack: string }

export default function FontPicker({
  value,
  options,
  onChange,
}: {
  value: string
  options: FontOption[]
  onChange: (key: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const current = options.find((o) => o.key === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="font-picker">
      <button
        type="button"
        className="font-picker-btn"
        style={{ fontFamily: current.stack }}
        onClick={() => setOpen(!open)}
      >
        <span className="font-picker-label">{current.label}</span>
        <ChevronDown size={14} className={open ? 'font-picker-chev-open' : ''} />
      </button>
      {open && (
        <div className="font-picker-list">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`font-picker-opt ${o.key === value ? 'font-picker-opt-active' : ''}`}
              style={{ fontFamily: o.stack }}
              onClick={() => {
                onChange(o.key)
                setOpen(false)
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
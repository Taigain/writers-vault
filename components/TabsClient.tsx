'use client'

import { useEffect, useState } from 'react'

export type TabSection = {
  id: string
  label: string
  content: React.ReactNode
}

export default function TabsClient({
  sections,
  initial,
}: {
  sections: TabSection[]
  initial?: string
}) {
  const fallback = sections[0]?.id ?? ''
  const target = sections.some((s) => s.id === initial) ? (initial as string) : fallback
  const [active, setActive] = useState(target)

  useEffect(() => {
    setActive(target)
  }, [target])

  return (
    <div>
      <div className="tabs-bar">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={`tab ${active === s.id ? 'tab-active' : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {sections.map((s) => (
          <div key={s.id} hidden={active !== s.id} className="anim-fade">
            {s.content}
          </div>
        ))}
      </div>
    </div>
  )
}
import { ChevronRight } from 'lucide-react'
import { getLang } from '@/lib/lang-server'
import { tr } from '@/lib/i18n'
import { FAQ } from '@/lib/faq'

export default async function HelpPage() {
  const lang = await getLang()
  const items = FAQ[lang]

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 anim-fade">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{tr(lang, 'helpTitle')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--soft)' }}>{tr(lang, 'helpSub')}</p>

      <div className="space-y-3">
        {items.map((it, i) => (
          <details key={i} className="acc">
            <summary className="acc-head">
              <ChevronRight size={18} className="acc-chev" />
              <span className="acc-title">{it.q}</span>
            </summary>
            <div className="acc-body">
              <p className="text-sm pt-3 whitespace-pre-line" style={{ color: 'var(--soft)' }}>
                {it.a}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
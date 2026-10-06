import type { Metadata } from 'next'
import { Suspense } from 'react'
import SidebarNav, { type SidebarBook } from '@/components/SidebarNav'
import { getBooksWithSeries } from '@/lib/actions'
import './globals.css'
import WhatsNewModal from '@/components/WhatsNewModal'
import { APP_VERSION } from '@/lib/appinfo'
import NavGuard from '@/components/NavGuard'

export const metadata: Metadata = { title: "Writer's Vault" }

const BOOTSTRAP = `(function(){try{var t=localStorage.getItem('wv-theme');if(t){document.documentElement.dataset.theme=t}var u=localStorage.getItem('wv-font-ui');if(u){document.documentElement.style.setProperty('--font-ui',u)}var w=localStorage.getItem('wv-font-write');if(w){document.documentElement.style.setProperty('--font-write',w)}var l=localStorage.getItem('wv-lang');if(l){document.documentElement.lang=l}}catch(e){}})();`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const booksRaw = await getBooksWithSeries()
  const books: SidebarBook[] = booksRaw.map((b) => ({
    id: b.id,
    title: b.title,
    status: b.status,
    series: b.series ? { id: b.series.id, name: b.series.name } : null,
  }))

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
      </head>
      <body className="min-h-screen">
        <NavGuard />
        <div className="flex h-screen overflow-hidden">
          <aside className="sb-aside shrink-0 bg-[#211d19] flex flex-col">
            <Suspense fallback={<div className="p-4 text-xs text-white/40">…</div>}>
              <SidebarNav books={books} />
            </Suspense>
          </aside>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
        <WhatsNewModal current={APP_VERSION} />
      </body>
    </html>
  )
}
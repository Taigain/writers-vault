import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import SidebarNav from '@/components/SidebarNav'
import { getBooksWithChapters } from '@/lib/actions'
import './globals.css'

export const metadata: Metadata = { title: "Writer's Vault" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const books = await getBooksWithChapters()

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen">
        <Script id="wv-bootstrap" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('wv-theme');if(t){document.documentElement.dataset.theme=t}var u=localStorage.getItem('wv-font-ui');if(u){document.documentElement.style.setProperty('--font-ui',u)}var w=localStorage.getItem('wv-font-write');if(w){document.documentElement.style.setProperty('--font-write',w)}var l=localStorage.getItem('wv-lang');if(l){document.documentElement.lang=l}}catch(e){}})();`}
        </Script>
        <div className="flex h-screen overflow-hidden">
          <aside className="w-64 shrink-0 bg-[#211d19] flex flex-col">
            <Suspense fallback={<div className="p-4 text-xs text-white/40">…</div>}>
              <SidebarNav books={books} />
            </Suspense>
          </aside>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
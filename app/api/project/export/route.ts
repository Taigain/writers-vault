import { NextResponse } from 'next/server'
import { packBook } from '@/lib/projectPack'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const bookId = url.searchParams.get('bookId') ?? ''
  const name = url.searchParams.get('name') || 'project'
  try {
    const buf = await packBook(bookId)
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}.wvproj"`,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
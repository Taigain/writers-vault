import { NextResponse } from 'next/server'
import { unpackBook } from '@/lib/projectPack'

export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const file = fd.get('file')
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'empty file' }, { status: 400 })
    const buf = Buffer.from(await file.arrayBuffer())
    const res = await unpackBook(buf)
    return NextResponse.json({ ok: true, bookId: res.bookId, title: res.title })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
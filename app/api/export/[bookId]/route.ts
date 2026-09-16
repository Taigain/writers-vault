import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { prisma } from '@/lib/prisma'
import { parseRichText } from '@/lib/richtext'


const ALIGN_MAP = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
} as const

const cleanPlain = (t: string) => t.replace(/\[@(.*?)\]/g, '$1').replace(/\[#(.*?)\]/g, '$1')

export async function GET(_req: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { chapters: { orderBy: { order: 'asc' } } },
  })
  if (!book) {
    return NextResponse.json({ error: 'Книга не найдена' }, { status: 404 })
  }

  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      text: cleanPlain(book.title),
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
  )
  if (book.annotation.trim()) {
    children.push(
      new Paragraph({
        text: cleanPlain(book.annotation),
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    )
  }

  book.chapters.forEach((ch, idx) => {
    children.push(
      new Paragraph({
        text: cleanPlain(ch.title),
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: idx > 0,
        spacing: { before: 240, after: 240 },
      }),
    )

    for (const block of parseRichText(ch.content)) {
      const runs: TextRun[] = []
      block.lines.forEach((line, li) => {
        line.forEach((r, ri) => {
          runs.push(
            new TextRun({
              text: r.text,
              bold: r.mention ? false : r.bold,
              italics: r.italic,
              size: r.size ? Math.round(r.size * 1.5) : undefined,
              break: li > 0 && ri === 0 ? 1 : 0,
            }),
          )
        })
      })
      if (runs.length === 0) runs.push(new TextRun({ text: '' }))
      children.push(
        new Paragraph({
          alignment: ALIGN_MAP[block.align],
          children: runs,
          spacing: { after: 120 },
        }),
      )
    }
  })

  const doc = new Document({ sections: [{ properties: {}, children }] })
  const buffer = await Packer.toBuffer(doc)

  const safeName = book.title.replace(/[\\/:*?"<>|]/g, '_') || 'book'
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition':
        `attachment; filename="book.docx"; filename*=UTF-8''${encodeURIComponent(safeName + '.docx')}`,
    },
  })
}
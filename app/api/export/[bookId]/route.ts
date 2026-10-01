import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LineRuleType } from 'docx'
import { prisma, schemaReady } from '@/lib/prisma'
import { parseRichText } from '@/lib/richtext'
import { getBookBlocks } from '@/lib/actions'
import { buildDictMap, parseForms } from '@/lib/dict'

const ALIGN_MAP = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
} as const

const BODY_SPACING = { after: 160, line: 259, lineRule: LineRuleType.AUTO } as const

const prepMarkers = (s: string) =>
  s
    .replace(/\[#(.*?)\]/g, (_m, g: string) => '[#' + g.replace(/_/g, ' ') + ']')
    .replace(/\[sc:[^\]]*\]/g, '')
    .replace(/\[\/sc\]/g, '')
    .replace(/\[hl=\d+\]/g, '')
    .replace(/\[\/hl\]/g, '')

const cleanPlain = (t: string) =>
  t
    .replace(/\[@(.*?)\]/g, '$1')
    .replace(/\[#(.*?)\]/g, (_m, g: string) => g.replace(/_/g, ' '))

export async function GET(_req: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  await schemaReady

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, title: true, annotation: true, exportMeta: true },
  })
  if (!book) {
    return NextResponse.json({ error: 'Книга не найдена' }, { status: 404 })
  }

  const blocks = await getBookBlocks(bookId)
  const children: Paragraph[] = []

  if (book.exportMeta) {
    children.push(
      new Paragraph({
        text: cleanPlain(book.title),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: BODY_SPACING,
      }),
    )
    if (book.annotation.trim()) {
      children.push(
        new Paragraph({
          text: cleanPlain(book.annotation),
          alignment: AlignmentType.CENTER,
          spacing: BODY_SPACING,
        }),
      )
    }
  }

  const pushChapter = (
    ch: { id: string; title: string; content: string },
    heading: (typeof HeadingLevel)[keyof typeof HeadingLevel],
  ) => {
    children.push(
      new Paragraph({
        text: cleanPlain(ch.title),
        heading,
        spacing: BODY_SPACING,
      }),
    )

    for (const block of parseRichText(prepMarkers(ch.content))) {
      for (const line of block.lines) {
        if (line.every((r) => !r.text.trim())) continue
        const runs: TextRun[] = line.map(
          (r) =>
            new TextRun({
              text: r.text,
              bold: r.mention ? false : r.bold,
              italics: r.italic,
              size: r.size ? Math.round(r.size * 1.5) : undefined,
            }),
        )
        if (runs.length === 0) runs.push(new TextRun({ text: '' }))
        children.push(
          new Paragraph({
            alignment: ALIGN_MAP[block.align],
            children: runs,
            spacing: BODY_SPACING,
          }),
        )
      }
    }
  }

  for (const b of blocks) {
    if (b.kind === 'act') {
      children.push(
        new Paragraph({
          text: cleanPlain(b.name),
          heading: HeadingLevel.HEADING_1,
          spacing: BODY_SPACING,
        }),
      )
      for (const ch of b.chs) pushChapter(ch, HeadingLevel.HEADING_2)
    } else {
      pushChapter(b.ch, HeadingLevel.HEADING_1)
    }
  }

  const dictRows = await prisma.dictEntry.findMany({ where: { bookId }, select: { key: true, word: true, forms: true } })
  const dictMap = buildDictMap(dictRows.map((r) => ({ key: r.key, word: r.word, forms: parseForms(r.forms) })))

  const doc = new Document({
    creator: 'Taiga Develop',
    lastModifiedBy: 'Taiga Develop',
    title: cleanPlain(book.title),
    description: cleanPlain(book.annotation),
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 22 },
          paragraph: {
            spacing: { after: 160, line: 259, lineRule: LineRuleType.AUTO },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Title',
          name: 'Title',
          basedOn: 'Normal',
          run: { font: 'Times New Roman', size: 48, bold: true },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 } },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: 'Times New Roman', size: 32, bold: true },
          paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: 'Times New Roman', size: 26, bold: true },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [{ properties: {}, children }],
  })
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
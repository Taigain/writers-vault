import { prisma, schemaReady } from '@/lib/prisma'
import { getBookBlocks, getDict, getDictGroups } from '@/lib/actions'
import { mdSlug, mdQuote, richToMarkdown } from '@/lib/markdown'

export async function GET(req: Request, ctx: { params: Promise<{ bookId: string }> }) {
  await schemaReady
  const { bookId } = await ctx.params
  const dash = new URL(req.url).searchParams.get('dash') === 'en' ? '–' : '—'
  const book = await prisma.book.findUnique({ where: { id: bookId } })
  if (!book) return new Response('Not found', { status: 404 })
  const [blocks, dict, groups] = await Promise.all([
    getBookBlocks(book.id),
    getDict(book.id),
    getDictGroups(book.id),
  ])
  const out: string[] = []
  const fm: string[] = []
  if (book.exportTitle) fm.push('title: ' + mdQuote(book.title))
  if (book.exportAuthor && book.authorName) fm.push('author: ' + mdQuote(book.authorName))
  if (book.exportAnnotation && book.annotation.trim()) fm.push('annotation: ' + mdQuote(book.annotation))
  if (book.exportSynopsis && book.synopsis.trim()) fm.push('synopsis: ' + mdQuote(book.synopsis))
  if (fm.length > 0) out.push('---\n' + fm.join('\n') + '\n---')
  for (const b of blocks) {
    if (b.kind === 'act') {
      out.push('# ' + b.name)
      for (const ch of b.chs) {
        out.push('## ' + ch.title + '\n\n' + richToMarkdown(ch.content, dict, groups, dash).trim())
      }
    } else {
      out.push('## ' + b.ch.title + '\n\n' + richToMarkdown(b.ch.content, dict, groups, dash).trim())
    }
  }
  const md = out.join('\n\n') + '\n'
  const slug = mdSlug(book.title)
  const utf8Name = encodeURIComponent(slug + '.md')
  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // filename="book.md" — fallback для очень старых клиентов (ASCII)
      // filename*=UTF-8''... — стандарт RFC 5987 для кириллицы и спецсимволов
      'Content-Disposition': `attachment; filename="book.md"; filename*=UTF-8''${utf8Name}`,
    },
  })
}
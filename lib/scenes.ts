export const HL_COLORS = ['#e4b11b', '#7aa25c', '#5b8bd0', '#b0699a', '#d0703c', '#4cb5a9']

export type ParsedScene = {
  title: string
  inner: string
  start: number
  end: number
}

export function parseScenes(content: string): ParsedScene[] {
  const out: ParsedScene[] = []
  const re = /\[sc:([^\]]*)\]([\s\S]*?)\[\/sc\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    const openLen = m[0].indexOf(']') + 1
    out.push({
      title: m[1],
      inner: m[2],
      start: m.index,
      end: m.index + m[0].length,
    })
    void openLen
  }
  return out
}

export const cleanSceneMarkers = (t: string) =>
  t
    .replace(/\[sc:[^\]]*\]/g, '')
    .replace(/\[\/sc\]/g, '')
    .replace(/\[hl=\d+\]/g, '')
    .replace(/\[\/hl\]/g, '')

export type SceneSpan = { start: number; end: number }

export function sceneSpans(content: string): SceneSpan[] {
  return parseScenes(content).map((p) => ({ start: p.start, end: p.end }))
}

export function scenesWouldNest(content: string, s: number, e: number): boolean {
  return sceneSpans(content).some((sp) => s < sp.end && e > sp.start)
}
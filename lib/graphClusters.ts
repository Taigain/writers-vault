export type ClusterResult = {
  byNode: Map<string, number>
  members: string[][]
}

export function clusterGraph(
  nodeIds: string[],
  edges: { a: string; b: string; w: number }[],
): ClusterResult {
  const index = new Map(nodeIds.map((id, i) => [id, i]))
  const label = nodeIds.map((_, i) => i)
  const neigh = nodeIds.map(() => [] as { j: number; w: number }[])
  for (const e of edges) {
    const a = index.get(e.a)
    const b = index.get(e.b)
    if (a == null || b == null) continue
    neigh[a].push({ j: b, w: e.w })
    neigh[b].push({ j: a, w: e.w })
  }
  for (let it = 0; it < 24; it++) {
    let changed = false
    for (let i = 0; i < nodeIds.length; i++) {
      if (neigh[i].length === 0) continue
      const scores = new Map<number, number>()
      for (const { j, w } of neigh[i]) {
        scores.set(label[j], (scores.get(label[j]) ?? 0) + w)
      }
      scores.set(label[i], (scores.get(label[i]) ?? 0) + 0.5)
      let best = label[i]
      let bestScore = -1
      for (const [lab, sc] of scores) {
        if (sc > bestScore || (sc === bestScore && lab < best)) {
          best = lab
          bestScore = sc
        }
      }
      if (best !== label[i]) {
        label[i] = best
        changed = true
      }
    }
    if (!changed) break
  }
  const groups = new Map<number, string[]>()
  nodeIds.forEach((id, i) => {
    const arr = groups.get(label[i]) ?? []
    arr.push(id)
    groups.set(label[i], arr)
  })
  let members = [...groups.values()].sort(
    (a, b) => b.length - a.length || (a[0] < b[0] ? -1 : 1),
  )
  if (members.length > 8) {
    const head = members.slice(0, 7)
    const tail = members.slice(7).flat()
    members = [...head, tail]
  }
  const byNode = new Map<string, number>()
  members.forEach((arr, ci) => arr.forEach((id) => byNode.set(id, ci)))
  return { byNode, members }
}
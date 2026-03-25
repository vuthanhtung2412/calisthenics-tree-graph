import dagre from 'dagre'
import { Position, type Edge, type Node } from '@xyflow/react'

import { SkillGraph, TOP_SKILLS } from '@/graph'
import type { Muscle, Skill } from '@/type'

export const NODE_W = 200
export const NODE_H = 40

export const topNames = new Set(TOP_SKILLS.map((s) => s.name))

export const SKILL_NAMES = Object.keys(SkillGraph).sort((a, b) =>
  a.localeCompare(b)
)

/** The goal skill and every direct or indirect prerequisite. */
export function prerequisiteClosure(skill: Skill): Set<string> {
  const names = new Set<string>()
  function visit(s: Skill) {
    if (names.has(s.name)) return
    names.add(s.name)
    for (const p of s.prerequisites) {
      visit(p)
    }
  }
  visit(skill)
  return names
}

export function filterElements(
  nodes: Node[],
  edges: Edge[],
  allowed: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: nodes.filter((n) => allowed.has(n.id)),
    edges: edges.filter(
      (e) => allowed.has(e.source) && allowed.has(e.target)
    ),
  }
}

/** Skill names that activate at least one of the selected muscles. Null if nothing selected = no muscle filter. */
export function namesMatchingMuscleFilter(
  graph: Record<string, Skill>,
  muscles: ReadonlySet<Muscle>
): Set<string> | null {
  if (muscles.size === 0) return null
  const names = new Set<string>()
  for (const s of Object.values(graph)) {
    if (s.activated_muscles.some((m) => muscles.has(m))) {
      names.add(s.name)
    }
  }
  return names
}

export function graphToElements(graph: Record<string, Skill>): {
  nodes: Node[]
  edges: Edge[]
} {
  const skills = Object.values(graph)
  const nodes: Node[] = skills.map((s) => ({
    id: s.name,
    position: { x: 0, y: 0 },
    data: { label: s.name },
    style: topNames.has(s.name)
      ? {
          fontWeight: 600,
          borderWidth: 2,
          borderColor: 'rgb(167 139 250 / 0.65)',
        }
      : undefined,
  }))

  const seen = new Set<string>()
  const edges: Edge[] = []
  for (const s of skills) {
    for (const p of s.prerequisites) {
      const id = `${p.name}→${s.name}`
      if (seen.has(id)) continue
      seen.add(id)
      edges.push({
        id,
        source: p.name,
        target: s.name,
        type: 'smoothstep',
      })
    }
  }
  return { nodes, edges }
}

export function layoutDagre(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    nodesep: 40,
    ranksep: 64,
    marginx: 20,
    marginy: 20,
  })

  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_W, height: NODE_H })
  }
  for (const e of edges) {
    g.setEdge(e.source, e.target)
  }
  dagre.layout(g)

  const horizontal = direction === 'LR'
  const nextNodes: Node[] = nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      targetPosition: horizontal ? Position.Left : Position.Top,
      sourcePosition: horizontal ? Position.Right : Position.Bottom,
      position: {
        x: pos.x - NODE_W / 2,
        y: pos.y - NODE_H / 2,
      },
    }
  })

  return { nodes: nextNodes, edges }
}

import dagre from 'dagre'
import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { SkillGraph, TOP_SKILLS } from './tree'
import type { Skill } from './type'

const NODE_W = 200
const NODE_H = 40

const topNames = new Set(TOP_SKILLS.map((s) => s.name))

function graphToElements(graph: Record<string, Skill>): {
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

function layoutDagre(
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

function SkillGraphCanvas() {
  const { nodes, edges } = useMemo(() => {
    const raw = graphToElements(SkillGraph)
    return layoutDagre(raw.nodes, raw.edges, 'TB')
  }, [])

  return (
    <ReactFlow
      colorMode="dark"
      defaultNodes={nodes}
      defaultEdges={edges}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.04}
      maxZoom={1.25}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      defaultEdgeOptions={{ type: 'smoothstep' }}
      proOptions={{ hideAttribution: true }}
      className="bg-zinc-950"
      style={{ width: '100%', height: '100%' }}
    >
      <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
      <Controls showInteractive={false} />
      <MiniMap
        zoomable
        pannable
        maskColor="rgba(0,0,0,0.35)"
        className="!bg-zinc-900"
      />
    </ReactFlow>
  )
}

export function SkillGraphView() {
  return (
    <div className="h-full min-h-0 w-full">
      <ReactFlowProvider>
        <div className="h-full w-full">
          <SkillGraphCanvas />
        </div>
      </ReactFlowProvider>
    </div>
  )
}

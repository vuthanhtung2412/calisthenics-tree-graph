import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { SkillGraph } from '@/graph'
import {
  filterElements,
  graphToElements,
  layoutDagre,
  namesMatchingMuscleFilter,
  prerequisiteClosure,
} from '@/graphModel'
import type { Muscle } from '@/type'

export function SkillGraphCanvas({
  focusSkill,
  muscleFilter,
  onSkillSelect,
}: {
  focusSkill: string | null
  muscleFilter: ReadonlySet<Muscle>
  onSkillSelect?: (skillName: string) => void
}) {
  const flowKey = useMemo(
    () =>
      `${focusSkill ?? 'all'}::${[...muscleFilter].sort().join('|')}`,
    [focusSkill, muscleFilter]
  )

  const { nodes, edges } = useMemo(() => {
    const raw = graphToElements(SkillGraph)
    const muscleNames = namesMatchingMuscleFilter(SkillGraph, muscleFilter)

    let allowed: Set<string>
    if (focusSkill && SkillGraph[focusSkill]) {
      allowed = prerequisiteClosure(SkillGraph[focusSkill])
    } else {
      allowed = new Set(Object.keys(SkillGraph))
    }

    if (muscleNames !== null) {
      allowed = new Set([...allowed].filter((n) => muscleNames.has(n)))
    }

    const subset = filterElements(raw.nodes, raw.edges, allowed)
    if (subset.nodes.length === 0) {
      return { nodes: [] as Node[], edges: [] as Edge[] }
    }
    return layoutDagre(subset.nodes, subset.edges, 'TB')
  }, [focusSkill, muscleFilter])

  if (nodes.length === 0) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-zinc-950 px-4 text-center text-sm text-zinc-500"
        style={{ width: '100%', height: '100%' }}
      >
        <p className="max-w-sm">
          No skills match the current filters. Clear the skill goal or muscle
          filters and try again.
        </p>
      </div>
    )
  }

  return (
    <ReactFlow
      key={flowKey}
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
      onNodeClick={(_, node) => {
        onSkillSelect?.(node.id)
      }}
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
        className="bg-zinc-900"
      />
    </ReactFlow>
  )
}

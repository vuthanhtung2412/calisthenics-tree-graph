import dagre from 'dagre'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

import { SkillGraph, TOP_SKILLS } from '@/graph'
import { MUSCLE_GROUPS } from '@/type'
import type { Muscle, Skill } from '@/type'

const NODE_W = 200
const NODE_H = 40

const topNames = new Set(TOP_SKILLS.map((s) => s.name))

const SKILL_NAMES = Object.keys(SkillGraph).sort((a, b) =>
  a.localeCompare(b)
)

function skillOptionId(name: string): string {
  return `skill-option-${name.replace(/\s+/g, '-')}`
}

/** Keep the active option visible inside the listbox without scrolling the page. */
function scrollOptionIntoListbox(
  list: HTMLUListElement,
  option: HTMLElement,
  padding = 6
) {
  const listRect = list.getBoundingClientRect()
  const optRect = option.getBoundingClientRect()

  if (optRect.top < listRect.top + padding) {
    list.scrollTop -= listRect.top + padding - optRect.top
  } else if (optRect.bottom > listRect.bottom - padding) {
    list.scrollTop += optRect.bottom - listRect.bottom + padding
  }
}

/** The goal skill and every direct or indirect prerequisite. */
function prerequisiteClosure(skill: Skill): Set<string> {
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

function filterElements(
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
function namesMatchingMuscleFilter(
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

function SkillGraphCanvas({
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

export function SkillGraphView() {
  const [query, setQuery] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [appliedFocus, setAppliedFocus] = useState<string | null>(null)
  const [muscleFilter, setMuscleFilter] = useState<Set<Muscle>>(() => new Set())

  const toggleMuscle = useCallback((m: Muscle) => {
    setMuscleFilter((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }, [])

  const comboboxRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const filteredNames = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SKILL_NAMES
    return SKILL_NAMES.filter((name) => name.toLowerCase().includes(q))
  }, [query])

  const pickSkill = useCallback((name: string) => {
    setAppliedFocus(name)
    setQuery(name)
    setListOpen(false)
  }, [])

  useLayoutEffect(() => {
    if (!listOpen || filteredNames.length === 0) return
    const name = filteredNames[highlight]
    if (!name) return
    const list = listboxRef.current
    const el = document.getElementById(skillOptionId(name))
    if (!list || !el || !list.contains(el)) return

    scrollOptionIntoListbox(list, el)
  }, [highlight, listOpen, filteredNames])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target
      if (
        comboboxRef.current &&
        t instanceof globalThis.Node &&
        !comboboxRef.current.contains(t)
      ) {
        setListOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  useEffect(() => {
    if (!listOpen) return
    function onEscape(e: KeyboardEvent) {
      if (e.key !== 'Escape' && e.code !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      setListOpen(false)
    }
    document.addEventListener('keydown', onEscape, true)
    return () => document.removeEventListener('keydown', onEscape, true)
  }, [listOpen])

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-800 bg-zinc-950 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-end gap-2">
          <div
            ref={comboboxRef}
            className="relative flex min-w-[min(100%,16rem)] flex-1 flex-col gap-1 text-left"
          >
            <label
              htmlFor="skill-search"
              className="text-xs text-zinc-500"
            >
              Skill to train
            </label>
            <input
              id="skill-search"
              type="text"
              role="combobox"
              aria-expanded={listOpen}
              aria-controls="skill-search-list"
              aria-activedescendant={
                listOpen && filteredNames[highlight]
                  ? skillOptionId(filteredNames[highlight]!)
                  : undefined
              }
              autoComplete="off"
              placeholder="Search skills..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setHighlight(0)
                setListOpen(true)
              }}
              onFocus={() => setListOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' || e.code === 'Escape') {
                  if (listOpen) {
                    e.preventDefault()
                    e.stopPropagation()
                    setListOpen(false)
                  }
                  return
                }
                if (!listOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                  setListOpen(true)
                  return
                }
                if (!listOpen) return
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setHighlight((i) =>
                    filteredNames.length === 0
                      ? 0
                      : (i + 1) % filteredNames.length
                  )
                  return
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setHighlight((i) =>
                    filteredNames.length === 0
                      ? 0
                      : (i - 1 + filteredNames.length) % filteredNames.length
                  )
                  return
                }
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const name = filteredNames[highlight]
                  if (name) pickSkill(name)
                  return
                }
              }}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40"
            />
            {listOpen ? (
              <ul
                ref={listboxRef}
                id="skill-search-list"
                role="listbox"
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto overflow-x-hidden rounded-md border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
              >
                {filteredNames.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-zinc-500">
                    No matching skills
                  </li>
                ) : (
                  filteredNames.map((name, i) => (
                    <li key={name} role="presentation">
                      <button
                        type="button"
                        role="option"
                        id={skillOptionId(name)}
                        aria-selected={i === highlight}
                        className={`flex w-full cursor-pointer px-3 py-2 text-left text-sm ${
                          i === highlight
                            ? 'bg-violet-600/25 text-zinc-100'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                        onMouseEnter={() => setHighlight(i)}
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => pickSkill(name)}
                      >
                        {name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
          <button
            type="button"
            disabled={appliedFocus === null}
            onClick={() => {
              setAppliedFocus(null)
              setQuery('')
              setListOpen(false)
            }}
            className="rounded-md border border-zinc-600 bg-transparent px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear filter
          </button>
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs font-medium text-zinc-400">
              Muscle groups
            </span>
            <span className="text-xs text-zinc-600">
              Show skills that use any selected muscle
            </span>
            {muscleFilter.size > 0 ? (
              <button
                type="button"
                onClick={() => setMuscleFilter(new Set())}
                className="text-xs text-violet-400 underline-offset-2 hover:underline"
              >
                Clear muscles
              </button>
            ) : null}
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter by muscle group"
          >
            {MUSCLE_GROUPS.map((m) => {
              const on = muscleFilter.has(m)
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleMuscle(m)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    on
                      ? 'border-violet-500/60 bg-violet-600/25 text-violet-200'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ReactFlowProvider>
          <div className="h-full w-full">
            <SkillGraphCanvas
              focusSkill={appliedFocus}
              muscleFilter={muscleFilter}
              onSkillSelect={pickSkill}
            />
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'

import { SkillGraph } from '@/graph'
import { MuscleFilterBar } from '@/MuscleFilterBar'
import { SkillDetailPanel } from '@/SkillDetailPanel'
import { SkillGraphCanvas } from '@/SkillGraphCanvas'
import { SkillSearchCombobox } from '@/SkillSearchCombobox'
import type { Muscle } from '@/type'

function App() {
  const [query, setQuery] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [appliedFocus, setAppliedFocus] = useState<string | null>(null)
  const [detailSkill, setDetailSkill] = useState<string | null>(null)
  const [detailExiting, setDetailExiting] = useState(false)
  const [muscleFilter, setMuscleFilter] = useState<Set<Muscle>>(() => new Set())

  const toggleMuscle = useCallback((m: Muscle) => {
    setMuscleFilter((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }, [])

  const pickSkill = useCallback((name: string) => {
    setAppliedFocus(name)
    setQuery(name)
    setListOpen(false)
    setDetailSkill(name)
    setDetailExiting(false)
  }, [])

  const clearSkillFilter = useCallback(() => {
    setAppliedFocus(null)
    setQuery('')
    setListOpen(false)
    if (detailSkill) {
      setDetailExiting(true)
    } else {
      setDetailSkill(null)
    }
  }, [detailSkill])

  const requestCloseDetailPanel = useCallback(() => {
    setDetailExiting(true)
  }, [])

  const completeDetailPanelExit = useCallback(() => {
    setDetailSkill(null)
    setDetailExiting(false)
  }, [])

  const clearMuscles = useCallback(() => {
    setMuscleFilter(new Set())
  }, [])

  return (
    <div className="flex h-svh min-h-0 w-full flex-col bg-zinc-950 text-zinc-400">
      <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-800 bg-zinc-950 px-3 py-3 sm:px-4">
        <SkillSearchCombobox
          query={query}
          setQuery={setQuery}
          listOpen={listOpen}
          setListOpen={setListOpen}
          highlight={highlight}
          setHighlight={setHighlight}
          appliedFocus={appliedFocus}
          onPickSkill={pickSkill}
          onClearFilter={clearSkillFilter}
        />
        <MuscleFilterBar
          muscleFilter={muscleFilter}
          onToggleMuscle={toggleMuscle}
          onClearMuscles={clearMuscles}
        />
      </div>
      <div className="relative min-h-0 flex-1">
        <ReactFlowProvider>
          <div className="h-full w-full">
            <SkillGraphCanvas
              focusSkill={appliedFocus}
              muscleFilter={muscleFilter}
              onSkillSelect={pickSkill}
            />
          </div>
        </ReactFlowProvider>
        <SkillDetailPanel
          skill={
            detailSkill && SkillGraph[detailSkill]
              ? SkillGraph[detailSkill]!
              : null
          }
          exiting={detailExiting}
          onExitComplete={completeDetailPanelExit}
          onRequestClose={requestCloseDetailPanel}
          onSelectSkill={pickSkill}
        />
      </div>
    </div>
  )
}

export default App

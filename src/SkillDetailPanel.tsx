import { useCallback, useEffect } from 'react'

import { SkillGraph } from '@/graph'
import { directDependents, topNames } from '@/graphModel'
import type { Skill } from '@/type'

export function SkillDetailPanel({
  skill,
  exiting,
  onExitComplete,
  onRequestClose,
  onSelectSkill,
}: {
  skill: Skill | null
  exiting: boolean
  onExitComplete: () => void
  onRequestClose: () => void
  onSelectSkill: (name: string) => void
}) {
  useEffect(() => {
    if (!skill || exiting) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault()
        onRequestClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [skill, exiting, onRequestClose])

  const onAsideTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return
      if (e.propertyName !== 'transform') return
      if (!exiting) return
      onExitComplete()
    },
    [exiting, onExitComplete]
  )

  if (!skill) return null

  const prereqNames = skill.prerequisites.map((p) => p.name).sort((a, b) =>
    a.localeCompare(b)
  )
  const unlocks = directDependents(SkillGraph, skill.name)
  const isTop = topNames.has(skill.name)

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex justify-end">
      <aside
        key={skill.name}
        role="complementary"
        aria-label="Skill details"
        aria-labelledby="skill-detail-title"
        aria-hidden={exiting}
        onTransitionEnd={onAsideTransitionEnd}
        className={`pointer-events-auto flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950/95 shadow-[-12px_0_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-sm motion-reduce:transition-none ${
          exiting
            ? 'translate-x-full transition-transform duration-300 ease-out motion-reduce:translate-x-full motion-reduce:duration-0'
            : 'translate-x-0 skill-panel-slide-in'
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-800 px-4 py-4">
          <div className="min-w-0 flex-1">
            <h2
              id="skill-detail-title"
              className="text-lg font-semibold leading-snug text-zinc-100"
            >
              {skill.name}
            </h2>
            {isTop ? (
              <p className="mt-1 text-xs font-medium text-violet-400/90">
                Milestone skill
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRequestClose}
            className="shrink-0 rounded-md border border-zinc-700 px-2.5 py-1 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {skill.ref_url ? (
            <p className="mb-4 text-sm">
              <a
                href={skill.ref_url}
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 underline-offset-2 hover:underline"
              >
                Reference
              </a>
            </p>
          ) : null}

          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Muscles
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {skill.activated_muscles.map((m) => (
                <li
                  key={m}
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-300"
                >
                  {m}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Prerequisites
            </h3>
            {prereqNames.length === 0 ? (
              <p className="text-sm text-zinc-600">None listed</p>
            ) : (
              <ul className="space-y-1">
                {prereqNames.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => onSelectSkill(name)}
                      className="text-left text-sm text-violet-400/90 underline-offset-2 hover:underline"
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Unlocks next
            </h3>
            {unlocks.length === 0 ? (
              <p className="text-sm text-zinc-600">
                No further skills in this graph — end of this branch.
              </p>
            ) : (
              <ul className="space-y-1">
                {unlocks.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => onSelectSkill(name)}
                      className="text-left text-sm text-violet-400/90 underline-offset-2 hover:underline"
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  )
}

import { MUSCLE_GROUPS, type Muscle } from '@/type'

export function MuscleFilterBar({
  muscleFilter,
  onToggleMuscle,
  onClearMuscles,
}: {
  muscleFilter: ReadonlySet<Muscle>
  onToggleMuscle: (m: Muscle) => void
  onClearMuscles: () => void
}) {
  return (
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
            onClick={onClearMuscles}
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
              onClick={() => onToggleMuscle(m)}
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
  )
}

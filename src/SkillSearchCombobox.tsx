import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'

import { SKILL_NAMES } from '@/graphModel'

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

export function SkillSearchCombobox({
  query,
  setQuery,
  listOpen,
  setListOpen,
  highlight,
  setHighlight,
  appliedFocus,
  onPickSkill,
  onClearFilter,
}: {
  query: string
  setQuery: (q: string) => void
  listOpen: boolean
  setListOpen: (open: boolean) => void
  highlight: number
  setHighlight: Dispatch<SetStateAction<number>>
  appliedFocus: string | null
  onPickSkill: (name: string) => void
  onClearFilter: () => void
}) {
  const comboboxRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const filteredNames = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SKILL_NAMES
    return SKILL_NAMES.filter((name) => name.toLowerCase().includes(q))
  }, [query])

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
  }, [setListOpen])

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
  }, [listOpen, setListOpen])

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div
        ref={comboboxRef}
        className="relative flex min-w-[min(100%,16rem)] flex-1 flex-col gap-1 text-left"
      >
        <label htmlFor="skill-search" className="text-xs text-zinc-500">
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
              if (name) onPickSkill(name)
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
                    onClick={() => onPickSkill(name)}
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
        onClick={onClearFilter}
        className="rounded-md border border-zinc-600 bg-transparent px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Clear filter
      </button>
    </div>
  )
}

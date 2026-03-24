import { SkillGraphView } from './SkillGraphView'

function App() {
  return (
    <div className="flex h-svh min-h-0 w-full flex-col bg-zinc-950 text-zinc-400 antialiased [color-scheme:dark]">
      <header className="shrink-0 border-b border-zinc-800 px-4 py-4 text-left sm:px-6">
        <h1 className="text-2xl font-medium tracking-tight text-zinc-100 sm:text-3xl">
          Calisthenics skill graph
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
          Each node is a skill. Arrows go from prerequisite to the skill that
          builds on it. Highlighted nodes are top-level goals from{' '}
          <code className="rounded-md bg-zinc-900 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-200">
            TOP_SKILLS
          </code>
          .
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden border-b border-zinc-800">
        <SkillGraphView />
      </main>
    </div>
  )
}

export default App

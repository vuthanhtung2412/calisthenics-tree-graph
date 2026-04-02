export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Triceps',
  'Biceps',
  'Forearms',
  'Abs',
  'Obliques',
  'Lower Back',
  'Quads',
  'Hamstrings/Glutes',
] as const

export type Muscle = (typeof MUSCLE_GROUPS)[number]

export type Skill = {
  name: string
  ref_url?: string
  /** Markdown: form / execution cues for the skill */
  formNotes: string
  activated_muscles: Muscle[]
  prerequisites: Skill[]
}

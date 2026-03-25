export type Skill = {
  name: string
  ref_url?: string 
  activated_muscles: Muscle[]
  prerequisites: Skill[]
}

const ALL_MUSCLE = [
  "Chest",
  "Back",
  "Shoulders",
  "Triceps",
  "Biceps",
  "Forearms",
  "Abs",
  "Obliques",
  "Lower Back",
  "Quads",
  "Hamstrings/Glutes"
] as const

export type Muscle = typeof ALL_MUSCLE[number]



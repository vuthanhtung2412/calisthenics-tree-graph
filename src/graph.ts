import type { Muscle, Skill } from '@/type'

function register(
  store: Map<string, Skill>,
  name: string,
  muscles: Muscle[],
  prereqNames: string[] = []
): Skill {
  const prerequisites = prereqNames.map((n) => {
    const p = store.get(n);
    if (!p) throw new Error(`Unknown prerequisite "${n}" for "${name}"`);
    return p;
  });
  const s: Skill = { name, activated_muscles: muscles, prerequisites };
  store.set(name, s);
  return s;
}

function buildSkillGraph(): Record<string, Skill> {
  const m = new Map<string, Skill>();

  // --- Absolute beginner: posture, core, and squat pattern ---
  register(m, "hollow body hold", ["Abs"]);
  register(m, "arch body hold", ["Back", "Shoulders", "Lower Back"]);
  register(m, "assisted squat", ["Quads", "Hamstrings/Glutes", "Lower Back"]);
  register(m, "bodyweight squat", ["Quads", "Hamstrings/Glutes", "Lower Back"], [
    "assisted squat",
  ]);
  register(m, "compression sit", ["Abs", "Shoulders"]);
  register(m, "side plank", ["Obliques", "Shoulders", "Abs"]);

  // --- Hanging basics → vertical pull pattern ---
  register(m, "dead hang", ["Back", "Forearms"]);
  register(m, "active hang", ["Back", "Shoulders", "Biceps", "Forearms"], [
    "dead hang",
  ]);
  register(m, "scapular pull-up", ["Back", "Shoulders", "Biceps"], [
    "active hang",
  ]);
  register(m, "inverted row", ["Back", "Biceps", "Shoulders"], [
    "scapular pull-up",
  ]);
  register(m, "negative pull-up", ["Back", "Biceps", "Forearms"], [
    "inverted row",
  ]);
  register(m, "chin-up", ["Back", "Biceps", "Forearms"], ["negative pull-up"]);
  register(m, "pull-up", ["Back", "Biceps", "Forearms"], ["chin-up"]);

  // --- Push progressions (angled → full) ---
  register(m, "incline push-up", ["Chest", "Shoulders", "Triceps"]);
  register(m, "knee push-up", ["Chest", "Shoulders", "Triceps", "Abs"], [
    "incline push-up",
  ]);
  register(m, "push-up", ["Chest", "Shoulders", "Triceps", "Abs"], [
    "knee push-up",
    "hollow body hold",
  ]);
  register(m, "diamond push-up", ["Chest", "Triceps", "Shoulders"], ["push-up"]);
  register(m, "bench dip", ["Chest", "Shoulders", "Triceps"], [
    "incline push-up",
  ]);
  register(m, "parallel bar support", ["Shoulders", "Triceps", "Chest"], [
    "push-up",
    "bench dip",
  ]);
  register(m, "dip", ["Chest", "Shoulders", "Triceps"], [
    "parallel bar support",
  ]);

  // --- Hanging core ---
  register(m, "hanging knee raise", ["Abs", "Forearms"], ["dead hang"]);
  register(m, "hanging leg raise", ["Abs", "Forearms"], [
    "hanging knee raise",
  ]);
  register(m, "side leg raise", ["Abs", "Obliques", "Forearms"], [
    "hanging leg raise",
    "side plank",
  ]);
  register(m, "around the world hanging leg raise", [
    "Abs",
    "Obliques",
    "Forearms",
  ], ["side leg raise"]);

  // --- Handstand line ---
  register(m, "chest-to-wall handstand", ["Shoulders", "Triceps", "Abs"], [
    "push-up",
  ]);
  register(m, "freestanding handstand", ["Shoulders", "Triceps", "Abs"], [
    "chest-to-wall handstand",
  ]);

  // --- Shoulder extension / rings-bar prep ---
  register(m, "German hang", ["Shoulders", "Chest", "Biceps"], ["dead hang"]);
  register(m, "skin the cat", ["Shoulders", "Back", "Abs"], [
    "German hang",
    "parallel bar support",
  ]);
  register(m, "inverted hang", ["Back", "Shoulders", "Biceps"], [
    "skin the cat",
  ]);

  // --- Pull strength progressions ---
  register(m, "chest-to-bar pull-up", ["Back", "Biceps", "Forearms"], [
    "pull-up",
  ]);
  register(m, "explosive pull-up", ["Back", "Biceps", "Forearms"], [
    "chest-to-bar pull-up",
  ]);
  register(m, "archer pull-up", ["Back", "Biceps", "Forearms", "Obliques"], [
    "pull-up",
  ]);
  register(m, "typewriter pull-up", ["Back", "Biceps", "Forearms"], [
    "archer pull-up",
  ]);
  register(m, "weighted pull-up", ["Back", "Biceps", "Forearms"], [
    "pull-up",
  ]);

  // --- False grip & bar-specific ---
  register(m, "false grip hang", ["Forearms", "Biceps", "Back"], [
    "active hang",
  ]);
  register(m, "straight bar dip", ["Chest", "Shoulders", "Triceps"], ["dip"]);

  // --- Front lever chain ---
  register(m, "tuck front lever", ["Back", "Abs", "Shoulders", "Biceps"], [
    "hollow body hold",
    "dead hang",
    "scapular pull-up",
  ]);
  register(m, "advanced tuck front lever", ["Back", "Abs", "Shoulders"], [
    "tuck front lever",
  ]);
  register(m, "one-leg front lever", ["Back", "Abs", "Shoulders"], [
    "advanced tuck front lever",
  ]);
  register(m, "straddle front lever", ["Back", "Abs", "Shoulders"], [
    "one-leg front lever",
  ]);
  register(m, "front lever", ["Back", "Abs", "Shoulders", "Biceps"], [
    "straddle front lever",
  ]);

  // --- Back lever chain ---
  register(m, "tuck back lever", ["Back", "Shoulders", "Triceps", "Biceps"], [
    "skin the cat",
    "inverted hang",
  ]);
  register(m, "straddle back lever", ["Back", "Shoulders", "Triceps"], [
    "tuck back lever",
  ]);
  register(m, "back lever", ["Back", "Shoulders", "Triceps", "Biceps"], [
    "straddle back lever",
  ]);

  // --- Planche chain ---
  register(m, "pseudo planche lean", ["Chest", "Shoulders", "Triceps"], [
    "push-up",
  ]);
  register(m, "tuck planche", ["Chest", "Shoulders", "Triceps", "Abs"], [
    "pseudo planche lean",
    "hollow body hold",
  ]);
  register(m, "advanced tuck planche", ["Chest", "Shoulders", "Triceps"], [
    "tuck planche",
  ]);
  register(m, "straddle planche", ["Chest", "Shoulders", "Triceps", "Abs"], [
    "advanced tuck planche",
  ]);
  register(m, "planche", ["Chest", "Shoulders", "Triceps", "Abs"], [
    "straddle planche",
  ]);

  // --- L-sit ---
  register(m, "foot-supported L-sit", ["Abs", "Shoulders", "Triceps"], [
    "parallel bar support",
    "compression sit",
  ]);
  register(m, "tuck L-sit", ["Abs", "Shoulders", "Triceps"], [
    "foot-supported L-sit",
  ]);
  register(m, "L sit", ["Abs", "Shoulders", "Triceps", "Forearms"], [
    "tuck L-sit",
  ]);

  // --- Handstand push-up ---
  register(m, "pike push-up", ["Shoulders", "Triceps", "Chest"], ["push-up"]);
  register(m, "elevated pike push-up", ["Shoulders", "Triceps", "Chest"], [
    "pike push-up",
  ]);
  register(m, "handstand push-up", ["Shoulders", "Triceps", "Abs"], [
    "elevated pike push-up",
    "freestanding handstand",
  ]);

  // --- Dragon flag ---
  register(m, "dragon flag negative", ["Abs", "Lower Back"], [
    "hanging leg raise",
    "hollow body hold",
  ]);
  register(m, "dragon flag", ["Abs", "Lower Back", "Shoulders"], [
    "dragon flag negative",
  ]);

  // --- Human flag ---
  register(m, "human flag prep (vertical hang)", ["Obliques", "Back", "Forearms"], [
    "side plank",
    "pull-up",
  ]);
  register(m, "human flag", ["Obliques", "Shoulders", "Back", "Abs"], [
    "human flag prep (vertical hang)",
    "straddle front lever",
  ]);

  // --- Muscle-up ---
  register(m, "muscle-up", ["Back", "Biceps", "Chest", "Shoulders", "Triceps"], [
    "explosive pull-up",
    "straight bar dip",
    "false grip hang",
  ]);

  // --- One-arm chin-up ---
  register(m, "one-arm chin-up", ["Back", "Biceps", "Forearms", "Shoulders"], [
    "weighted pull-up",
    "typewriter pull-up",
  ]);

  // --- Single-leg strength (pistol) ---
  register(m, "assisted pistol squat", ["Quads", "Hamstrings/Glutes"], [
    "bodyweight squat",
  ]);
  register(m, "pistol squat", [
    "Quads",
    "Hamstrings/Glutes",
    "Lower Back",
    "Abs",
  ], ["assisted pistol squat"]);

  return Object.fromEntries(m);
}

export const SkillGraph = buildSkillGraph();

export const TOP_SKILLS: Skill[] = [
  SkillGraph["back lever"]!,
  SkillGraph["one-arm chin-up"]!,
  SkillGraph["front lever"]!,
  SkillGraph["dragon flag"]!,
  SkillGraph["muscle-up"]!,
  SkillGraph["planche"]!,
  SkillGraph["human flag"]!,
  SkillGraph["L sit"]!,
  SkillGraph["handstand push-up"]!,
  SkillGraph["pistol squat"]!,
];

import type { Muscle, Skill } from '@/type'

function register(
  store: Map<string, Skill>,
  name: string,
  muscles: Muscle[],
  prereqNames: string[] = [],
  refUrl?: string,
  formNotes?: string
): Skill {
  const prerequisites = prereqNames.map((n) => {
    const p = store.get(n);
    if (!p) throw new Error(`Unknown prerequisite "${n}" for "${name}"`);
    return p;
  });
  const s: Skill = {
    name,
    activated_muscles: muscles,
    prerequisites,
    formNotes: formNotes ?? '',
    ...(refUrl ? { ref_url: refUrl } : {}),
  };
  store.set(name, s);
  return s;
}

function buildSkillGraph(): Record<string, Skill> {
  const m = new Map<string, Skill>();

  // --- Absolute beginner: posture, core, and squat pattern ---
  register(m, "hollow body hold", ["Abs"], [],
    "https://www.youtube.com/watch?v=uZqTUwq96iU");
  register(m, "arch body hold", ["Back", "Shoulders", "Lower Back"]);
  register(m, "assisted squat", ["Quads", "Hamstrings/Glutes", "Lower Back"]);
  register(m, "bodyweight squat", ["Quads", "Hamstrings/Glutes", "Lower Back"], ["assisted squat"]);
  register(m, "compression sit", ["Abs", "Shoulders"]);
  register(m, "side plank", ["Obliques", "Shoulders", "Abs"]);

  // --- Posterior chain / lower back ---
  register(m, "superman hold", ["Lower Back", "Back", "Hamstrings/Glutes"], ["arch body hold"]);
  register(m, "reverse hyperextension", ["Lower Back", "Back", "Hamstrings/Glutes"], ["superman hold"]);

  // --- Hanging basics → vertical pull pattern ---
  register(m, "dead hang", ["Back", "Forearms"]);
  register(m, "active hang", ["Back", "Shoulders", "Biceps", "Forearms"], ["dead hang"],
    "https://www.youtube.com/watch?v=mcwBX6AK62U");
  register(m, "scapular pull-up", ["Back", "Shoulders", "Biceps"], ["active hang"]);
  register(m, "australian pull-up", ["Back", "Biceps", "Shoulders"], ["scapular pull-up"], "https://youtu.be/bHO0A4ZF_Zg?si=yswKpZEuVoElFk6O", `
  + **DO NOT** bend your back forward, hold it straight and engage your abs

  + Make sure your *scapular* is touching, when pull
  `);
  register(m, "inverted row", ["Back", "Biceps", "Shoulders"], ["australian pull-up"]);
  register(m, "negative pull-up", ["Back", "Biceps", "Forearms"], ["inverted row"]);
  register(m, "chin-up", ["Back", "Biceps", "Forearms"], ["negative pull-up"]);
  register(m, "pull-up", ["Back", "Biceps", "Forearms"], ["chin-up"]);

  // --- Push progressions ---
  register(m, "incline push-up", ["Chest", "Shoulders", "Triceps"]);
  register(m, "knee push-up", ["Chest", "Shoulders", "Triceps", "Abs"], ["incline push-up"]);
  register(m, "push-up", ["Chest", "Shoulders", "Triceps", "Abs"], ["knee push-up", "hollow body hold"]);
  register(m, "diamond push-up", ["Chest", "Triceps", "Shoulders"], ["push-up"]);
  register(m, "bench dip", ["Chest", "Shoulders", "Triceps"], ["incline push-up"]);
  register(m, "parallel bar support", ["Shoulders", "Triceps", "Chest"], ["push-up", "bench dip"]);
  register(m, "dip", ["Chest", "Shoulders", "Triceps"], ["parallel bar support"]);

  // --- Hanging core ---
  register(m, "hanging knee raise", ["Abs", "Forearms"], ["dead hang"]);
  register(m, "hanging leg raise", ["Abs", "Forearms"], ["hanging knee raise"]);
  register(m, "side leg raise", ["Abs", "Obliques", "Forearms"], ["hanging leg raise", "side plank"]);
  register(m, "around the world hanging leg raise", ["Abs", "Obliques", "Forearms"], ["side leg raise"], "https://www.youtube.com/watch?v=GPO2esSImjk");

  // --- Handstand line ---
  register(m, "foot-elevated handstand", ["Shoulders", "Triceps", "Abs"], ["push-up"]);
  register(m, "wall walk-up", ["Shoulders", "Triceps", "Abs"], ["foot-elevated handstand"]); // NEW BRIDGE
  register(m, "chest-to-wall handstand", ["Shoulders", "Triceps", "Abs"], ["wall walk-up"]);
  register(m, "freestanding handstand", ["Shoulders", "Triceps", "Abs"], ["chest-to-wall handstand"]);

  // --- Shoulder extension / German Hang ---
  register(m, "supported German hang", ["Shoulders", "Chest", "Biceps", "Forearms"], ["active hang"]);
  register(m, "German hang negative", ["Shoulders", "Chest", "Biceps", "Back"], ["supported German hang", "scapular pull-up"]);
  register(m, "German hang", ["Shoulders", "Chest", "Biceps"], ["German hang negative"]);
  register(m, "skin the cat", ["Shoulders", "Back", "Abs"], ["German hang", "parallel bar support"],
    "https://www.youtube.com/watch?v=zk78i3Nk0Mg");
  register(m, "inverted hang", ["Back", "Shoulders", "Biceps"], ["skin the cat"]);

  // --- Pull strength progressions ---
  register(m, "chest-to-bar pull-up", ["Back", "Biceps", "Forearms"], ["pull-up"]);
  register(m, "explosive pull-up", ["Back", "Biceps", "Forearms"], ["chest-to-bar pull-up"]);
  register(m, "archer pull-up", ["Back", "Biceps", "Forearms", "Obliques"], ["pull-up"]);
  register(m, "typewriter pull-up", ["Back", "Biceps", "Forearms"], ["archer pull-up"]);
  register(m, "weighted pull-up", ["Back", "Biceps", "Forearms"], ["pull-up"]);

  // --- False grip & bar-specific ---
  register(m, "false grip hang", ["Forearms", "Biceps", "Back"], ["active hang"]);
  register(m, "straight bar dip", ["Chest", "Shoulders", "Triceps"], ["dip"]);

  // --- Front lever chain ---
  register(m, "tuck front lever", ["Back", "Abs", "Shoulders", "Biceps"], ["hollow body hold", "dead hang", "scapular pull-up"], "https://www.youtube.com/watch?v=AGhb8V8M758");
  register(m, "advanced tuck front lever", ["Back", "Abs", "Shoulders"], ["tuck front lever"]);
  register(m, "one-leg front lever", ["Back", "Abs", "Shoulders"], ["advanced tuck front lever"]);
  register(m, "straddle front lever", ["Back", "Abs", "Shoulders"], ["one-leg front lever"]);
  register(m, "front lever", ["Back", "Abs", "Shoulders", "Biceps"], ["straddle front lever"]);

  // --- Back lever chain ---
  register(m, "tuck back lever", ["Back", "Shoulders", "Triceps", "Biceps"], ["skin the cat", "inverted hang", "reverse hyperextension"], "https://www.youtube.com/watch?v=HXaG8mJmSnU");
  register(m, "straddle back lever", ["Back", "Shoulders", "Triceps"], ["tuck back lever"]);
  register(m, "back lever", ["Back", "Shoulders", "Triceps", "Biceps"], ["straddle back lever"]);

  // --- Planche chain ---
  register(m, "pseudo planche lean", ["Chest", "Shoulders", "Triceps"], ["push-up"], "https://www.youtube.com/watch?v=bn-HZm7bpy0");
  register(m, "planche lean push-up", ["Chest", "Shoulders", "Triceps"], ["pseudo planche lean"]); // NEW BRIDGE
  register(m, "tuck planche", ["Chest", "Shoulders", "Triceps", "Abs"], ["planche lean push-up", "hollow body hold", "reverse hyperextension"]);
  register(m, "advanced tuck planche", ["Chest", "Shoulders", "Triceps"], ["tuck planche"]);
  register(m, "straddle planche", ["Chest", "Shoulders", "Triceps", "Abs"], ["advanced tuck planche"]);
  register(m, "planche", ["Chest", "Shoulders", "Triceps", "Abs"], ["straddle planche"]);

  // --- L-sit ---
  register(m, "foot-supported L-sit", ["Abs", "Shoulders", "Triceps"], ["parallel bar support", "compression sit"]);
  register(m, "tuck L-sit", ["Abs", "Shoulders", "Triceps"], ["foot-supported L-sit"]);
  register(m, "L sit", ["Abs", "Shoulders", "Triceps", "Forearms"], ["tuck L-sit"],
    "https://www.youtube.com/watch?v=11B3alBjq-U");

  // --- Handstand push-up ---
  register(m, "pike push-up", ["Shoulders", "Triceps", "Chest"], ["push-up"]);
  register(m, "elevated pike push-up", ["Shoulders", "Triceps", "Chest"], ["pike push-up"]);
  register(m, "handstand push-up", ["Shoulders", "Triceps", "Abs"], ["elevated pike push-up", "freestanding handstand"], "https://www.youtube.com/watch?v=PDKmh0OJ6Ic");

  // --- Dragon flag ---
  register(m, "dragon flag negative", ["Abs", "Lower Back"], ["hanging leg raise", "hollow body hold"]);
  register(m, "tuck dragon flag", ["Abs", "Lower Back", "Shoulders"], ["dragon flag negative"]);
  register(m, "dragon flag", ["Abs", "Lower Back", "Shoulders"], ["tuck dragon flag"], "https://www.youtube.com/watch?v=3FuwY3Z4ux8");

  // --- Human flag ---
  register(m, "human flag prep (vertical hang)", ["Obliques", "Back", "Forearms"], ["side plank", "pull-up"], "https://www.youtube.com/watch?v=zKIrM55AAtk");
  register(m, "human flag", ["Obliques", "Shoulders", "Back", "Abs"], ["human flag prep (vertical hang)", "straddle front lever"]);

  // --- Muscle-up ---
  register(m, "muscle-up", ["Back", "Biceps", "Chest", "Shoulders", "Triceps"], ["explosive pull-up", "straight bar dip", "false grip hang"], "https://www.youtube.com/watch?v=4QzEzo14zo4");

  // --- One-arm chin-up ---
  register(m, "one-arm chin-up", ["Back", "Biceps", "Forearms", "Shoulders"], ["weighted pull-up", "typewriter pull-up"],
    "https://www.youtube.com/watch?v=mTJHClMQPM8");

  // --- Single-leg strength ---
  register(m, "assisted pistol squat", ["Quads", "Hamstrings/Glutes"], ["bodyweight squat"]);
  register(m, "pistol squat", ["Quads", "Hamstrings/Glutes", "Lower Back", "Abs"], ["assisted pistol squat"], "https://www.youtube.com/watch?v=R1mxpLzYgxM");
  register(m, "romanian lunges", ["Hamstrings/Glutes", "Lower Back", "Quads"], ["bodyweight squat"]);
  register(m, "dragon squat", ["Quads", "Hamstrings/Glutes", "Lower Back", "Abs"], ["pistol squat"], "https://framerusercontent.com/images/XLot0hZcaEDCOdpjiWPfYcddA.png");

  return Object.fromEntries(m);
}

export const SkillGraph = buildSkillGraph();

export const TOP_SKILLS: Skill[] = [
  SkillGraph["back lever"],
  SkillGraph["one-arm chin-up"],
  SkillGraph["front lever"],
  SkillGraph["dragon flag"],
  SkillGraph["muscle-up"],
  SkillGraph["planche"],
  SkillGraph["human flag"],
  SkillGraph["L sit"],
  SkillGraph["handstand push-up"],
  SkillGraph["dragon squat"],
];

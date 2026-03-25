import { SkillGraph } from '@/graph'
import type { Skill } from '@/type'

function escapeMermaidNodeLabel(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "#quot;")
    .replace(/\n/g, " ");
}

/**
 * Returns markdown with a single fenced `mermaid` block: one node per skill (label = skill name)
 * and edges prerequisite → skill.
 */
export function skillGraphToMermaidMarkdown(
  graph: Record<string, Skill> = SkillGraph,
  options?: { direction?: "TD" | "LR" | "BT" | "RL" }
): string {
  const direction = options?.direction ?? "TD";
  const skills = Object.values(graph).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const idByName = new Map<string, string>();
  skills.forEach((s, i) => idByName.set(s.name, `n${i}`));

  const lines: string[] = [`flowchart ${direction}`];
  for (const s of skills) {
    const id = idByName.get(s.name)!;
    lines.push(`  ${id}["${escapeMermaidNodeLabel(s.name)}"]`);
  }

  const seen = new Set<string>();
  for (const s of skills) {
    const to = idByName.get(s.name)!;
    for (const p of s.prerequisites) {
      const from = idByName.get(p.name);
      if (!from) continue;
      const key = `${from}--${to}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`  ${from} --> ${to}`);
    }
  }

  return ["```mermaid", ...lines, "```"].join("\n");
}

console.log(skillGraphToMermaidMarkdown())

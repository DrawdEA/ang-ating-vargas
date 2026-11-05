// The museum's flat color fields. Each page and each stop takes one.
export const COLORS = ["mustard", "mint", "pink", "cobalt"] as const;
export type Color = (typeof COLORS)[number];

// A stable color for a page, picked from its id or name.
export function colorFor(seed: string): Color {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

// Stop 1 is mustard, stop 2 mint, stop 3 pink, stop 4 cobalt.
export const stopColor = (index: number): Color => COLORS[index % COLORS.length];

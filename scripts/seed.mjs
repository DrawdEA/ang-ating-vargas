// Writes migrations-free seed SQL: a dozen sample pages so the wall isn't empty before the first visitor.
// Usage: node scripts/seed.mjs > /tmp/seed.sql && npx wrangler d1 execute vargas --file /tmp/seed.sql [--local|--remote]
const STOPS = [
  ["icon-gold", "icon-saint", "icon-metal", "lacquer"],
  ["poly-halo", "poly-hands", "zais", "glass"],
  ["oath", "pec", "clan", "sukarno"],
  ["medal", "salakot", "cane", "scrap"],
];
const NAMES = ["Bea", "Migs", "Lia", "Paolo", "Kat", "Josh", "Ria", "Enzo", "Nina", "Carlo", "Ysa", "Gab"];
const NOTES = ["Parang si Lola.", "Who owns this now?", "The gold hand got me.", "Dapat dito lang ito.", "He kept everything.", "Tahimik pero malakas.", "Ang ganda ng ilaw.", "Bakit siya ang chairman?", "I want this on my wall.", "Looks like our old album."];

let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const esc = (s) => s.replace(/'/g, "''");

const now = Date.now();
const rows = NAMES.map((name, i) => {
  const picks = STOPS.map((ids, stop) => ({ stop, artworkId: pick(ids), r: Math.round(rand() * 8 - 4) })).filter(() => rand() > 0.12);
  if (!picks.length) picks.push({ stop: 0, artworkId: "icon-gold", r: 1 });
  if (rand() > 0.25) picks[Math.floor(rand() * picks.length)].note = pick(NOTES);
  const id = `seed${String(i).padStart(2, "0")}`;
  const created = now - (NAMES.length - i) * 7 * 60_000;
  return `('${id}', '${esc(name)}', '${esc(JSON.stringify(picks))}', 1, 0, ${created})`;
});

console.log(`INSERT OR REPLACE INTO collections (id, name, picks, on_wall, hidden, created_at) VALUES\n${rows.join(",\n")};`);

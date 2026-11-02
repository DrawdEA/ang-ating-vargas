// Notes and names go on a public wall, so anything matching these lists is rejected before saving.
// Short words match whole words only, so "reputation" or "titingnan" are not caught by mistake.
const PREFIXES = ["fuck", "shit", "nigg", "putang", "tangina", "pakyu", "pakshet", "kantot", "tarantado"];
const WORDS = new Set([
  "bitch", "cunt", "dick", "pussy", "fag", "slut", "whore", "puta", "gago", "ulol", "bobo",
  "tanga", "kupal", "leche", "titi", "puke", "pokpok",
]);

export function isClean(text: string): boolean {
  const t = text.toLowerCase().replace(/[^a-z\s]/g, " ");
  if (t.replace(/\s+/g, "").includes("tangina")) return false;
  return !t.split(/\s+/).some((w) => WORDS.has(w) || PREFIXES.some((p) => w.startsWith(p)));
}

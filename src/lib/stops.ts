// The four prompted stops on the 3rd floor and the pieces each one points to.
// To use a real photo of a piece, put it in public/art/ and set its `image` (e.g. image: "/art/oath.jpg").
// Pieces without an image show a drawn placeholder.

export type Theme = "K" | "Ka" | "Kn"; // Kawilihan, Kasaysayan, Kasanayan
export type Motif = "halo" | "box" | "hands" | "land" | "glass" | "portrait" | "group" | "medal" | "hat" | "cane" | "page";

export type Artwork = { id: string; title: string; motif: Motif; color: string; theme: Theme; image?: string };
export type Stop = { zone: string; where: string; prompt: string; artworks: Artwork[] };

export const STOPS: Stop[] = [
  {
    zone: "Objects of Study",
    where: "Russian icon gallery",
    prompt: "Photograph the icon you would keep in the Philippines.",
    artworks: [
      { id: "icon-gold", title: "Gold-leaf Madonna", motif: "halo", color: "#B8892B", theme: "K" },
      { id: "icon-saint", title: "Saint with a book", motif: "halo", color: "#7A2E22", theme: "Ka" },
      { id: "icon-metal", title: "Icon in a metal cover", motif: "halo", color: "#8E8C82", theme: "Kn" },
      { id: "lacquer", title: "Painted lacquer box", motif: "box", color: "#1E1A18", theme: "K" },
    ],
  },
  {
    zone: "Objects of Study",
    where: "Polyptych, Zais, glass paintings",
    prompt: "Photograph the detail that caught your eye.",
    artworks: [
      { id: "poly-halo", title: "The polyptych’s gold halo", motif: "halo", color: "#C9A14A", theme: "K" },
      { id: "poly-hands", title: "Painted folded hands", motif: "hands", color: "#5C3A24", theme: "Kn" },
      { id: "zais", title: "Zais’s tiny figures", motif: "land", color: "#9FB7B0", theme: "Ka" },
      { id: "glass", title: "A glass-painted village", motif: "glass", color: "#E8B23A", theme: "K" },
    ],
  },
  {
    zone: "A Collecting Life",
    where: "Portraits and commissioned paintings",
    prompt: "Photograph the painting that tells you the most about Vargas.",
    artworks: [
      { id: "oath", title: "Oath Taking, 1941", motif: "portrait", color: "#3E3A2E", theme: "Ka" },
      { id: "pec", title: "As Chairman of the PEC", motif: "portrait", color: "#5A2F25", theme: "Ka" },
      { id: "clan", title: "Kawilihan Clan I, 1950", motif: "group", color: "#6B7A4A", theme: "K" },
      { id: "sukarno", title: "Vargas and Sukarno, 1962", motif: "group", color: "#3D5568", theme: "Ka" },
    ],
  },
  {
    zone: "A Collecting Life",
    where: "Medals, canes, scrapbook table",
    prompt: "If you were Vargas, what would you keep? Photograph it.",
    artworks: [
      { id: "medal", title: "A medal", motif: "medal", color: "#2B2420", theme: "Kn" },
      { id: "salakot", title: "The salakot", motif: "hat", color: "#D9CBA8", theme: "K" },
      { id: "cane", title: "His cane", motif: "cane", color: "#E8DFCC", theme: "Kn" },
      { id: "scrap", title: "A scrapbook page", motif: "page", color: "#EFE3C8", theme: "Ka" },
    ],
  },
];

export const ARTWORKS: Record<string, Artwork> = Object.fromEntries(
  STOPS.flatMap((s) => s.artworks).map((a) => [a.id, a]),
);

export const COLLECTOR_TYPES: Record<Theme, { name: string; blurb: string }> = {
  K: { name: "Ang Mausisa", blurb: "The curious one. You went for what fascinated you: kawilihan." },
  Ka: { name: "Ang Historyador", blurb: "The historian. You picked what carries a story: kasaysayan." },
  Kn: { name: "Ang Masinop", blurb: "The meticulous one. You noticed craft and care: kasanayan." },
};

export function collectorType(artworkIds: string[]) {
  const tally: Record<Theme, number> = { K: 0, Ka: 0, Kn: 0 };
  for (const id of artworkIds) tally[ARTWORKS[id].theme]++;
  const top = (Object.entries(tally) as [Theme, number][]).sort((a, b) => b[1] - a[1])[0][0];
  return COLLECTOR_TYPES[top];
}

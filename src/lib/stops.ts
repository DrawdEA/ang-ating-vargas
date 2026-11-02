// The four prompted stops on the 3rd floor.
// `images` are optional photos of the pieces (put them in public/art/), shown on the /tour slides during a demo.
export type Stop = { zone: string; prompt: string; images?: string[] };

export const STOPS: Stop[] = [
  { zone: "Objects of Study", prompt: "The icon you would keep in the Philippines" },
  { zone: "Objects of Study", prompt: "The detail that caught your eye" },
  { zone: "A Collecting Life", prompt: "The painting that tells you the most about Vargas" },
  { zone: "A Collecting Life", prompt: "What you would keep if you were Vargas" },
];

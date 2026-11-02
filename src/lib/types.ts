export type Pick = {
  stop: number;
  artworkId: string;
  note?: string;
  photoId?: string; // absent for seeded pages and sample shots, which draw the piece instead
  r?: number; // tilt of the polaroid, in degrees
};

export type Collection = {
  id: string;
  name: string;
  picks: Pick[];
  createdAt: number;
};

export type Feed = {
  items: Collection[];
  total: number;
  counts: Record<string, number>; // how many collections photographed each artwork
};

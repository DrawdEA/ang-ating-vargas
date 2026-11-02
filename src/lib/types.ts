export type Pick = {
  stop: number;
  photoId: string;
  note?: string;
  r?: number; // tilt of the polaroid, in degrees
};

export type Collection = {
  id: string;
  name: string;
  picks: Pick[];
  createdAt: number;
};

export type Feed = { items: Collection[]; total: number };

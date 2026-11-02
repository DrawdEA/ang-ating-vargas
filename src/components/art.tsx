import { artSvg, sampleShotSvg } from "@/lib/art";
import { ARTWORKS } from "@/lib/stops";
import type { Pick } from "@/lib/types";

// Reference image of a piece: its real photo if one is set in stops.ts, otherwise the drawn stand-in.
export function Art({ id }: { id: string }) {
  const a = ARTWORKS[id];
  if (a.image) {
    return <img className="fill" src={a.image} alt={a.title} />;
  }
  return <span className="fill" dangerouslySetInnerHTML={{ __html: artSvg(a) }} />;
}

// A visitor's photo of a piece. Seeded pages and sample shots have no photo, so they show a drawn shot instead.
export function Shot({ pick, src }: { pick: Pick; src?: string }) {
  const url = src ?? (pick.photoId ? `/api/photo/${pick.photoId}` : null);
  if (url) {
    return <img className="fill" src={url} alt={ARTWORKS[pick.artworkId].title} />;
  }
  return <span className="fill" dangerouslySetInnerHTML={{ __html: sampleShotSvg(ARTWORKS[pick.artworkId], pick.r ?? 0) }} />;
}

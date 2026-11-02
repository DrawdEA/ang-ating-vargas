import type { Pick } from "@/lib/types";

// A visitor's photo: from the server once sent, or a local preview URL before sending.
export function Shot({ pick, src, alt = "" }: { pick?: Pick; src?: string; alt?: string }) {
  const url = src ?? (pick ? `/api/photo/${pick.photoId}` : undefined);
  return url ? <img className="fill" src={url} alt={alt} /> : <span className="fill" />;
}

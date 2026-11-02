import { Shot } from "./shot";
import type { Pick } from "@/lib/types";

const ROT = [-6, 4, -3, 5];
const W = 21; // polaroid width, % of page

function stamp(ts: number) {
  return new Date(ts).toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

// One visitor's collection as a scrapbook page. Sized in em, so the parent's font-size scales the whole page.
export function ScrapbookPage({ name, picks, createdAt, srcs }: { name: string; picks: Pick[]; createdAt: number; srcs?: (string | undefined)[] }) {
  const shown = picks.slice(0, 4);
  const gap = (90 - shown.length * W) / (shown.length + 1);
  const note = picks.find((p) => p.note)?.note;
  return (
    <div className="page">
      <div className="pt">Vargas ni {name}</div>
      <div className="pd">{stamp(createdAt)}</div>
      {shown.map((p, i) => (
        <div key={p.stop} className="pol" style={{ left: `${5 + gap + i * (W + gap)}%`, top: `${24 + (i % 2) * 4}%`, transform: `rotate(${ROT[i]}deg)` }}>
          <span className="pol-img"><Shot pick={p} src={srcs?.[i]} /></span>
          <span className="tape" />
        </div>
      ))}
      {note && (
        <div className="pn">
          &ldquo;{note}&rdquo; <small>&mdash; {name}</small>
        </div>
      )}
    </div>
  );
}

import { Shot } from "./shot";
import { colorFor } from "@/lib/palette";
import type { Pick } from "@/lib/types";

function stamp(ts: number) {
  return new Date(ts).toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric" });
}

// One visitor's collection as a page in the museum's poster style: a flat color field, a row of photos,
// and a caption. Sized in em, so the parent's font-size scales the whole page.
export function ScrapbookPage({ id, name, picks, createdAt, srcs }: { id?: string; name: string; picks: Pick[]; createdAt: number; srcs?: (string | undefined)[] }) {
  const shown = picks.slice(0, 4);
  const note = picks.find((p) => p.note)?.note;
  return (
    <div className={`page c-${colorFor(id ?? name)}`}>
      <div className="pt">Vargas ni {name}</div>
      <div className="pd">{stamp(createdAt)}</div>
      <div className="photos-row" style={{ gridTemplateColumns: `repeat(${Math.max(shown.length, 1)}, 1fr)` }}>
        {shown.map((p, i) => (
          <span key={p.stop} className="ph">
            <Shot pick={p} src={srcs?.[i]} />
          </span>
        ))}
      </div>
      <div className="pn">{note ? `"${note}" ${name}.` : `${shown.length} of 4 photos. UP Vargas Museum.`}</div>
    </div>
  );
}

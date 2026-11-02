"use client";

import { useEffect, useState } from "react";
import { ScrapbookPage } from "@/components/scrapbook-page";
import { useFeed } from "@/lib/use-feed";
import { ARTWORKS } from "@/lib/stops";
import type { Collection } from "@/lib/types";

// Screen 1 (projector): newest page front and center, older pages pushed back and sepia.
const SLOTS = [
  { x: 50, y: 52, s: 1.35 },
  { x: 16, y: 30, s: 0.8 },
  { x: 84, y: 30, s: 0.76 },
  { x: 13, y: 76, s: 0.66 },
  { x: 87, y: 76, s: 0.64 },
  { x: 36, y: 15, s: 0.5 },
  { x: 64, y: 14, s: 0.48 },
  { x: 33, y: 90, s: 0.44 },
  { x: 67, y: 90, s: 0.42 },
];
const FRESH_MS = 60_000;

const shares = (a: Collection, b: Collection) => a.picks.some((p) => b.picks.some((q) => q.artworkId === p.artworkId));

export default function Wall() {
  const feed = useFeed(SLOTS.length);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const items = feed?.items ?? [];
  const front = items[0];
  const topPick = front?.picks[0];
  const others = topPick ? Math.max(0, (feed?.counts[topPick.artworkId] ?? 1) - 1) : 0;

  return (
    <main className="screen" aria-label="Ang Ating Vargas wall">
      <svg className="threads" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true">
        {items.flatMap((a, i) =>
          items.slice(i + 1).map((b, j) => {
            if (!shares(a, b)) return null;
            const A = SLOTS[i];
            const B = SLOTS[i + 1 + j];
            return (
              <path
                key={`${a.id}-${b.id}`}
                d={`M${A.x * 1.6} ${A.y * 0.9} Q${(A.x + B.x) * 0.8} ${Math.max(A.y, B.y) * 0.9 + 6} ${B.x * 1.6} ${B.y * 0.9}`}
                fill="none"
                stroke="#C2412D"
                strokeWidth={i === 0 ? 0.5 : 0.22}
                opacity={i === 0 ? 0.9 : 0.35}
              />
            );
          }),
        )}
      </svg>

      {items.map((c, i) => (
        <WallPage key={c.id} c={c} slot={i} fresh={i === 0 && now - c.createdAt < FRESH_MS} />
      ))}

      {feed && !items.length && <div className="empty">The wall is waiting for its first collection.</div>}

      <div className="hud title">
        Ang Ating Vargas
        <small>Our own Vargas · visitor collections</small>
      </div>
      {feed && <div className="hud count">{feed.total} collections so far</div>}
      {front && <div className="hud now">Newest · {front.name}</div>}
      {topPick && (
        <div className="hud shared">
          {others} other{others === 1 ? "" : "s"} also photographed &ldquo;{ARTWORKS[topPick.artworkId].title}&rdquo;
        </div>
      )}
    </main>
  );
}

// Enters from below the screen, then CSS transitions carry it to its slot as newer pages arrive.
function WallPage({ c, slot, fresh }: { c: Collection; slot: number; fresh: boolean }) {
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPlaced(true)));
    return () => cancelAnimationFrame(raf);
  }, []);
  const s = SLOTS[slot];
  const style = placed
    ? {
        left: `${s.x}%`,
        top: `${s.y}%`,
        zIndex: 40 - slot,
        opacity: slot ? Math.max(0.45, 1 - slot * 0.07) : 1,
        transform: `translate(-50%,-50%) scale(${s.s}) rotate(${slot ? (slot % 2 ? -3 : 3) : 0}deg)`,
        filter: slot ? `sepia(${Math.min(0.85, slot * 0.12)}) brightness(${1 - slot * 0.06})` : "none",
      }
    : { left: "50%", top: "120%", zIndex: 40 - slot, transform: "translate(-50%,-50%) scale(1.8)" };
  return (
    <div className={`wp${fresh ? " fresh" : ""}`} style={style}>
      <ScrapbookPage name={c.name} picks={c.picks} createdAt={c.createdAt} />
    </div>
  );
}

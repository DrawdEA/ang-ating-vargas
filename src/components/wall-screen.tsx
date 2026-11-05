"use client";

import { useEffect, useState } from "react";
import { ScrapbookPage } from "@/components/scrapbook-page";
import { useFeed } from "@/lib/use-feed";
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

export function WallScreen() {
  const feed = useFeed(SLOTS.length);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const items = feed?.items ?? [];

  return (
    <main className="screen" aria-label="Ang Ating Vargas wall">
      {items.length > 0 && <div className="front-ellipse" aria-hidden="true" />}
      {/* A dotted thread from each page to the one that arrived before it. */}
      <svg className="threads" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true">
        {items.slice(1).map((c, j) => {
          const A = SLOTS[j];
          const B = SLOTS[j + 1];
          return (
            <path
              key={c.id}
              d={`M${A.x * 1.6} ${A.y * 0.9} Q${(A.x + B.x) * 0.8} ${Math.max(A.y, B.y) * 0.9 + 8} ${B.x * 1.6} ${B.y * 0.9}`}
              fill="none"
              stroke="var(--magenta)"
              strokeWidth={j === 0 ? 3 : 2}
              strokeDasharray="0 9"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity={Math.max(0.35, 1 - j * 0.12)}
            />
          );
        })}
      </svg>
      {items.map((c, i) => (
        <WallPage key={c.id} c={c} slot={i} fresh={i === 0 && now - c.createdAt < FRESH_MS} />
      ))}

      {feed && !items.length && <div className="empty">Waiting for the first page.</div>}

      <div className="hud title">Ang Ating Vargas</div>
      {feed && <div className="hud count">{feed.total} pages</div>}
    </main>
  );
}

// Enters from below the screen, then CSS transitions carry it to its slot as newer pages arrive.
function WallPage({ c, slot, fresh }: { c: Collection; slot: number; fresh: boolean }) {
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    // A short timer, not requestAnimationFrame, so pages still settle if the tab is in the background.
    const t = setTimeout(() => setPlaced(true), 60);
    return () => clearTimeout(t);
  }, []);
  const s = SLOTS[slot];
  const style = placed
    ? {
        left: `${s.x}%`,
        top: `${s.y}%`,
        zIndex: 40 - slot,
        // Older pages fade into the cobalt field and lose their color, like the museum's duotone photos.
        opacity: slot ? Math.max(0.4, 1 - slot * 0.08) : 1,
        transform: `translate(-50%,-50%) scale(${s.s})`,
        filter: slot ? `grayscale(${Math.min(1, slot * 0.2)})` : "none",
      }
    : { left: "50%", top: "120%", zIndex: 40 - slot, transform: "translate(-50%,-50%) scale(1.8)" };
  return (
    <div className={`wp${fresh ? " fresh" : ""}`} style={style}>
      <ScrapbookPage id={c.id} name={c.name} picks={c.picks} createdAt={c.createdAt} />
    </div>
  );
}

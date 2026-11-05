"use client";

import { useEffect, useRef, useState } from "react";
import { ScrapbookPage } from "@/components/scrapbook-page";
import { useFeed } from "@/lib/use-feed";
import type { Collection } from "@/lib/types";

// Screen 1 (projector): newest page front and center, older pages pushed back and faded.
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
  const svgRef = useRef<SVGSVGElement>(null);

  // Each frame, redraw every thread between the pages' current on-screen centers, so the threads
  // stretch and follow the pages while their CSS transitions move them.
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const svg = svgRef.current;
      if (svg) {
        const box = svg.getBoundingClientRect();
        svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
        const center = (id: string) => {
          const el = svg.parentElement?.querySelector<HTMLElement>(`[data-page="${id}"]`);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
        };
        svg.querySelectorAll<SVGPathElement>("path[data-from]").forEach((path) => {
          const a = center(path.dataset.from!);
          const b = center(path.dataset.to!);
          if (!a || !b) return;
          const sag = box.height * 0.08;
          path.setAttribute("d", `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.max(a.y, b.y) + sag} ${b.x} ${b.y}`);
        });
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="screen" aria-label="Ang Ating Vargas wall">
      {/* A dotted thread from each page to the one that arrived before it. */}
      <svg ref={svgRef} className="threads" aria-hidden="true">
        {items.slice(1).map((c, j) => {
          return (
            <path
              key={`${items[j].id}-${c.id}`}
              data-from={items[j].id}
              data-to={c.id}
              fill="none"
              stroke="var(--magenta)"
              strokeWidth={j === 0 ? 3 : 2}
              strokeDasharray="0 9"
              strokeLinecap="round"
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
        // Older pages fade into the background and lose their color.
        opacity: slot ? Math.max(0.4, 1 - slot * 0.08) : 1,
        transform: `translate(-50%,-50%) scale(${s.s})`,
        filter: slot ? `grayscale(${Math.min(1, slot * 0.2)})` : "none",
      }
    : { left: "50%", top: "120%", zIndex: 40 - slot, transform: "translate(-50%,-50%) scale(1.8)" };
  return (
    <div className={`wp${fresh ? " fresh" : ""}`} style={style} data-page={c.id}>
      <ScrapbookPage id={c.id} name={c.name} picks={c.picks} createdAt={c.createdAt} />
    </div>
  );
}

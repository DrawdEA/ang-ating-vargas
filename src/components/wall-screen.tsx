"use client";

import { useEffect, useRef, useState } from "react";
import { ScrapbookPage } from "@/components/scrapbook-page";
import { useFeed } from "@/lib/use-feed";
import type { Collection } from "@/lib/types";

// Screen 1 (projector): the newest page front and center, then rings of older pages around it.
// Each ring out is smaller, more faded and grayer, so the wall holds 31 pages at once.
type Slot = { x: number; y: number; s: number; fade: number; gray: number };
const RINGS = [
  { n: 6, rx: 33, ry: 36, s: 0.62, fade: 0.92, gray: 0.25, turn: 0 },
  { n: 10, rx: 45, ry: 40, s: 0.4, fade: 0.72, gray: 0.6, turn: 18 },
  { n: 14, rx: 49, ry: 46, s: 0.28, fade: 0.5, gray: 1, turn: 0 },
];
const SLOTS: Slot[] = [
  { x: 50, y: 52, s: 1.35, fade: 1, gray: 0 },
  ...RINGS.flatMap((r) =>
    Array.from({ length: r.n }, (_, k) => {
      const a = ((r.turn + (k * 360) / r.n) * Math.PI) / 180;
      return { x: 50 + r.rx * Math.cos(a), y: 52 + r.ry * Math.sin(a), s: r.s, fade: r.fade, gray: r.gray };
    }),
  ),
];
// Threads link only the newest pages, so the outer rings stay calm.
const THREADED = 10;
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

  // Pages already there when the screen opens appear in place; only pages that arrive afterwards fly in.
  const seen = useRef<Set<string> | null>(null);
  const arriving = new Set(seen.current ? items.filter((c) => !seen.current!.has(c.id)).map((c) => c.id) : []);
  useEffect(() => {
    if (feed) seen.current = new Set(feed.items.map((c) => c.id));
  }, [feed]);

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
        {items.slice(1, THREADED).map((c, j) => {
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
        <WallPage key={c.id} c={c} slot={i} arriving={arriving.has(c.id)} fresh={i === 0 && now - c.createdAt < FRESH_MS} />
      ))}

      {feed && !items.length && <div className="empty">Waiting for the first page.</div>}

      <div className="hud title">Ang Ating Vargas</div>
      {feed && <div className="hud count">{feed.total} pages</div>}
    </main>
  );
}

// A page that arrives while the wall is up rises from below the screen into its slot. CSS transitions
// then move every page back as newer ones arrive.
function WallPage({ c, slot, arriving, fresh }: { c: Collection; slot: number; arriving: boolean; fresh: boolean }) {
  const [placed, setPlaced] = useState(!arriving);
  useEffect(() => {
    if (placed) return;
    // A short timer, not requestAnimationFrame, so the page still settles if the tab is in the background.
    const t = setTimeout(() => setPlaced(true), 60);
    return () => clearTimeout(t);
  }, [placed]);
  const s = SLOTS[slot];
  const style = placed
    ? {
        left: `${s.x}%`,
        top: `${s.y}%`,
        zIndex: 100 - slot,
        // Older pages fade into the background and lose their color.
        opacity: s.fade,
        transform: `translate(-50%,-50%) scale(${s.s})`,
        filter: s.gray ? `grayscale(${s.gray})` : "none",
      }
    : { left: "50%", top: "120%", zIndex: 100 - slot, transform: "translate(-50%,-50%) scale(1.8)" };
  return (
    <div className={`wp${fresh ? " fresh" : ""}`} style={style} data-page={c.id}>
      <ScrapbookPage id={c.id} name={c.name} picks={c.picks} createdAt={c.createdAt} />
    </div>
  );
}

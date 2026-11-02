"use client";

import { useEffect, useRef, useState } from "react";
import { ScrapbookPage } from "@/components/scrapbook-page";
import { useFeed } from "@/lib/use-feed";
import { useQr } from "@/lib/use-qr";
import type { Collection } from "@/lib/types";

// Screen 2 (monitor beside the wall): the latest pages, each with its own QR code to keep it.
export default function QrGrid() {
  const feed = useFeed(8);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  // Only animate tiles that arrive after the screen first loads.
  const seen = useRef<Set<string> | null>(null);
  const items = feed?.items ?? [];
  const firstLoad = seen.current === null && feed !== null;
  const entering = new Set(firstLoad ? [] : items.filter((c) => !seen.current?.has(c.id)).map((c) => c.id));
  useEffect(() => {
    if (feed) seen.current = new Set(feed.items.map((c) => c.id));
  }, [feed]);

  return (
    <main className="screen" aria-label="Scan to keep your page">
      <div className="qrwall">
        <div className="hd">
          <b>Scan to keep your Vargas</b>
        </div>
        <div className="tiles">
          {items.map((c) => (
            <Tile key={c.id} c={c} now={now} entering={entering.has(c.id)} />
          ))}
        </div>
      </div>
      {feed && !items.length && <div className="empty">No pages yet</div>}
    </main>
  );
}

function ago(now: number, t: number) {
  const s = Math.round((now - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} hr ago`;
  return "earlier";
}

function Tile({ c, now, entering }: { c: Collection; now: number; entering: boolean }) {
  const qr = useQr(`/k/${c.id}`);
  const fresh = now - c.createdAt < 60_000;
  return (
    <div className={`tile${entering ? " enter" : ""}${fresh ? " fresh" : ""}`}>
      <div className="pg">
        <ScrapbookPage name={c.name} picks={c.picks} createdAt={c.createdAt} />
      </div>
      <div className="meta">
        <div className="qr">{qr && <img src={qr} alt={`QR code for ${c.name}'s page`} />}</div>
        <div>
          <div className="nm">{c.name}</div>
          <div className="ag">{ago(now, c.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}

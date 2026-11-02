"use client";

import { useEffect, useState } from "react";
import type { Feed } from "./types";

// Polls the newest collections. Every few seconds is live enough for a wall people glance at.
export function useFeed(limit: number, intervalMs = 3000) {
  const [feed, setFeed] = useState<Feed | null>(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/collections?limit=${limit}`, { cache: "no-store" });
        if (res.ok && alive) setFeed(await res.json());
      } catch {
        // Keep showing the last good feed if the connection drops.
      }
    };
    load();
    const t = setInterval(load, intervalMs);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [limit, intervalMs]);
  return feed;
}

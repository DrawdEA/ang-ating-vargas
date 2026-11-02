import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Collection, Feed, Pick } from "./types";

type Row = { id: string; name: string; picks: string; created_at: number };

export async function db() {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

const toCollection = (r: Row): Collection => ({
  id: r.id,
  name: r.name,
  picks: JSON.parse(r.picks) as Pick[],
  createdAt: r.created_at,
});

export async function latestFeed(limit: number): Promise<Feed> {
  const DB = await db();
  const [latest, all] = await DB.batch<Row>([
    DB.prepare("SELECT id, name, picks, created_at FROM collections WHERE hidden = 0 AND on_wall = 1 ORDER BY created_at DESC LIMIT ?").bind(limit),
    DB.prepare("SELECT picks FROM collections WHERE hidden = 0"),
  ]);
  const counts: Record<string, number> = {};
  for (const r of all.results) {
    for (const id of new Set((JSON.parse(r.picks) as Pick[]).map((p) => p.artworkId))) counts[id] = (counts[id] ?? 0) + 1;
  }
  return { items: latest.results.map(toCollection), total: all.results.length, counts };
}

export async function getCollection(id: string): Promise<Collection | null> {
  const DB = await db();
  const r = await DB.prepare("SELECT id, name, picks, created_at FROM collections WHERE id = ? AND hidden = 0").bind(id).first<Row>();
  return r ? toCollection(r) : null;
}

export function newId(len = 10) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
}

import { db, latestFeed, newId } from "@/lib/db";
import { isClean } from "@/lib/moderation";
import { ARTWORKS, STOPS } from "@/lib/stops";
import type { Pick } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_PHOTO_BYTES = 2_000_000;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(req: Request) {
  const limit = Math.min(30, Math.max(1, Number(new URL(req.url).searchParams.get("limit")) || 9));
  return Response.json(await latestFeed(limit), { headers: { "cache-control": "no-store" } });
}

type IncomingPick = { stop: number; artworkId: string; note?: string; photo?: string; r?: number };

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const onWall = form.get("onWall") !== "0";
  let incoming: IncomingPick[];
  try {
    incoming = JSON.parse(String(form.get("picks") ?? "[]"));
  } catch {
    return bad("Your photos couldn't be read. Try sending again.");
  }

  if (!name || name.length > 16) return bad("Add a name of up to 16 characters.");
  if (!isClean(name)) return bad("That name can't go on the wall. Try another.");
  if (!Array.isArray(incoming) || incoming.length < 1 || incoming.length > STOPS.length) return bad("Take at least one photo first.");

  const DB = await db();
  const now = Date.now();
  const statements: D1PreparedStatement[] = [];
  const picks: Pick[] = [];
  const seenStops = new Set<number>();

  for (const p of incoming) {
    const stop = STOPS[p.stop];
    if (!stop || seenStops.has(p.stop) || !stop.artworks.some((a) => a.id === p.artworkId)) return bad("One of your photos is tagged to the wrong stop.");
    seenStops.add(p.stop);
    const note = (p.note ?? "").trim().slice(0, 60);
    if (note && !isClean(note)) return bad(`Your note on “${ARTWORKS[p.artworkId].title}” can't go on the wall. Edit it and send again.`);

    const pick: Pick = { stop: p.stop, artworkId: p.artworkId, r: Math.max(-6, Math.min(6, Math.round(Number(p.r) || 0))) };
    if (note) pick.note = note;

    const file = p.photo ? form.get(p.photo) : null;
    if (file instanceof File) {
      if (!PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) return bad("One photo is too large or not an image. Retake it and send again.");
      pick.photoId = newId(14);
      const data = Buffer.from(await file.arrayBuffer()).toString("base64");
      statements.push(DB.prepare("INSERT INTO photos (id, mime, data, created_at) VALUES (?, ?, ?, ?)").bind(pick.photoId, file.type, data, now));
    }
    picks.push(pick);
  }

  const id = newId();
  picks.sort((a, b) => a.stop - b.stop);
  statements.push(
    DB.prepare("INSERT INTO collections (id, name, picks, on_wall, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, name, JSON.stringify(picks), onWall ? 1 : 0, now),
  );
  await DB.batch(statements);
  return Response.json({ id });
}

function bad(error: string) {
  return Response.json({ error }, { status: 400 });
}

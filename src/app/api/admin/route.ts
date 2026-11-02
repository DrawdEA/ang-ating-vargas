import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function authorized(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const key = req.headers.get("x-admin-key");
  return Boolean(env.ADMIN_KEY) && key === env.ADMIN_KEY;
}

type Row = { id: string; name: string; picks: string; on_wall: number; hidden: number; created_at: number };

// Admin list: newest 100 pages, including hidden ones.
export async function GET(req: Request) {
  if (!(await authorized(req))) return Response.json({ error: "Wrong admin key." }, { status: 401 });
  const DB = await db();
  const { results } = await DB.prepare("SELECT id, name, picks, on_wall, hidden, created_at FROM collections ORDER BY created_at DESC LIMIT 100").all<Row>();
  return Response.json({
    items: results.map((r) => ({ id: r.id, name: r.name, picks: JSON.parse(r.picks), onWall: !!r.on_wall, hidden: !!r.hidden, createdAt: r.created_at })),
  });
}

// Hide or restore one page.
export async function POST(req: Request) {
  if (!(await authorized(req))) return Response.json({ error: "Wrong admin key." }, { status: 401 });
  const { id, hidden } = (await req.json()) as { id: string; hidden: boolean };
  const DB = await db();
  await DB.prepare("UPDATE collections SET hidden = ? WHERE id = ?").bind(hidden ? 1 : 0, id).run();
  return Response.json({ ok: true });
}

// Delete one page and its photos for good.
export async function DELETE(req: Request) {
  if (!(await authorized(req))) return Response.json({ error: "Wrong admin key." }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  const DB = await db();
  await DB.batch([
    DB.prepare("DELETE FROM photos WHERE id IN (SELECT json_extract(value, '$.photoId') FROM collections, json_each(collections.picks) WHERE collections.id = ?)").bind(id),
    DB.prepare("DELETE FROM collections WHERE id = ?").bind(id),
  ]);
  return Response.json({ ok: true });
}

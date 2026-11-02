import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string; picks: string; on_wall: number; hidden: number; is_test: number; created_at: number };

// Admin list: newest 100 pages, including hidden ones.
export async function GET(req: Request) {
  if (!(await isAdmin(req))) return Response.json({ error: "Wrong admin key." }, { status: 401 });
  const DB = await db();
  const { results } = await DB.prepare("SELECT id, name, picks, on_wall, hidden, is_test, created_at FROM collections ORDER BY created_at DESC LIMIT 100").all<Row>();
  return Response.json({
    items: results.map((r) => ({ id: r.id, name: r.name, picks: JSON.parse(r.picks), onWall: !!r.on_wall, hidden: !!r.hidden, isTest: !!r.is_test, createdAt: r.created_at })),
  });
}

// Hide or restore one page.
export async function POST(req: Request) {
  if (!(await isAdmin(req))) return Response.json({ error: "Wrong admin key." }, { status: 401 });
  const { id, hidden } = (await req.json()) as { id: string; hidden: boolean };
  const DB = await db();
  await DB.prepare("UPDATE collections SET hidden = ? WHERE id = ?").bind(hidden ? 1 : 0, id).run();
  return Response.json({ ok: true });
}

// Delete one page, or every test page, along with their photos.
export async function DELETE(req: Request) {
  if (!(await isAdmin(req))) return Response.json({ error: "Wrong admin key." }, { status: 401 });
  const { id, allTests } = (await req.json()) as { id?: string; allTests?: boolean };
  const where = allTests ? "is_test = 1" : "id = ?";
  const bind = allTests ? [] : [id];
  const DB = await db();
  await DB.batch([
    DB.prepare(`DELETE FROM photos WHERE id IN (SELECT json_extract(value, '$.photoId') FROM collections, json_each(collections.picks) WHERE ${where})`).bind(...bind),
    DB.prepare(`DELETE FROM collections WHERE ${where}`).bind(...bind),
  ]);
  return Response.json({ ok: true });
}

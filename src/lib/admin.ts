import { getCloudflareContext } from "@opennextjs/cloudflare";

// True when the request carries the admin key set as the ADMIN_KEY secret.
export async function isAdmin(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const key = req.headers.get("x-admin-key");
  return Boolean(env.ADMIN_KEY) && key === env.ADMIN_KEY;
}

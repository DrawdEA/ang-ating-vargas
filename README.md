# Ang Ating Vargas

A participatory experience for the 3rd floor of the UP Vargas Museum. Visitors photograph what four prompts ask for, add a line on why, and send the result as a scrapbook page: their own Vargas. Pages appear live on a projector wall, and a monitor beside it shows each page with a QR code to keep it.

## How to use the prototype

| Screen | Link | Who uses it |
|---|---|---|
| Visitor app | `/` | Visitors, on their own phones (open it by scanning the entrance QR) |
| Main wall (Screen 1) | `/wall` | The projector. Newest page in front, older pages pushed back |
| QR grid (Screen 2) | `/qr` | The monitor beside the wall. The 8 newest pages, each with a QR code to the visitor's own page |
| Visitor's page | `/k/<id>` | Opened from the QR code; the visitor can bookmark or share it |
| Presentation mode | `/tour` | For the class demo: a start slide with the entrance QR, then one slide per stop's prompt. Arrow keys or click to advance |
| Admin | `/admin` | Hide or delete pages. Needs the admin key |

**As a visitor:**
1. Open `/` on a phone and enter a name. Untick "Show my page on the wall" to keep it private.
2. At each stop, read the prompt and take a photo. Add a note if you like, or skip the stop. The film strip at the top fills in as you collect.
3. Send your page to the wall, then scan its QR code on `/qr` (or tap "Open my page") to keep it.

**For the class demo:** put `/tour` on the TV and have classmates scan the start slide. Advance through the stops while they take photos, then switch to `/wall` for the reveal and `/qr` so they can keep their pages.

## Stack

Next.js 15 (App Router, TypeScript) deployed to Cloudflare Workers through OpenNext, with Cloudflare D1 storing pages and the compressed photos. Screens check for new pages every 3 seconds. QR codes come from the `qrcode` package; photos are resized on the phone before upload.

## Editing the stops

The four prompts live in [src/lib/stops.ts](src/lib/stops.ts). Each stop can also list `images` (files in `public/art/`) to show on its `/tour` slide.

## Development

```bash
npm install
npm run db:migrate:local
npm run dev
```

Copy `.dev.vars.example` to `.dev.vars` and set `ADMIN_KEY` to use `/admin` locally.

## Deploying to Cloudflare

```bash
npx wrangler d1 create vargas          # once; paste the database_id into wrangler.jsonc
npm run db:migrate:remote
npx wrangler secret put ADMIN_KEY      # admin key for /admin
npm run deploy
```

The original single-file prototype is kept at `public/prototype.html`.

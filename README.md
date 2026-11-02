# Ang Ating Vargas

A participatory experience for the 3rd floor of the UP Vargas Museum. Visitors photograph what four prompts ask for, add a line on why, and send the result as a scrapbook page: their own Vargas. Pages appear live on a projector wall, and a monitor beside it shows each page with a QR code to keep it.

## How to use the prototype

| Screen | Link | Who uses it |
|---|---|---|
| Visitor app | `/` | Visitors, on their own phones (open it by scanning the entrance QR) |
| Main wall (Screen 1) | `/wall` | The projector. Newest page in front; red threads link pages that photographed the same piece |
| QR grid (Screen 2) | `/qr` | The monitor beside the wall. The 8 newest pages, each with a QR code to the visitor's own page |
| Visitor's page | `/k/<id>` | Opened from the QR code; the visitor can bookmark or share it |
| Presentation mode | `/tour` | For the class demo: a start slide with the entrance QR, then each stop's four pieces shown large so the audience can photograph them. Arrow keys or click to advance |
| Staff moderation | `/admin` | Museum staff hide or restore pages. Needs the staff key |

**As a visitor:**
1. Open `/` on a phone, enter a name, and choose whether your page goes on the wall.
2. At each stop, tap the piece you'll photograph, then take the photo. Add a note if you like. You can skip a stop.
3. Swipe through the recap (photo count, collector type, how your picks compare with other visitors), then send your page to the wall.
4. Find your page on `/qr` and scan its QR code to keep it.

No camera (for example on a laptop)? After choosing a piece, tap **Use a sample shot**.

**For the class demo:** put `/tour` on the class projector. Have classmates scan the start slide's QR code, then advance through the stops so they can photograph each slide. When they send their pages, switch to `/wall` for the reveal, and show `/qr` on a second screen so they can scan their own pages.

## Stack

Next.js 15 (App Router, TypeScript) deployed to Cloudflare Workers through OpenNext, with Cloudflare D1 storing pages and the compressed photos. Screens poll for new pages every 3 seconds. QR codes come from the `qrcode` package; photos are resized on the phone before upload.

## Real artwork photos

Each piece shows a drawn placeholder until a photo is added. Put the photo in `public/art/` and set its `image` in [src/lib/stops.ts](src/lib/stops.ts), for example `image: "/art/oath.jpg"`. The stops' prompts and pieces are also edited there.

## Development

```bash
npm install
npm run db:migrate:local
npm run db:seed:local   # 12 sample pages so the wall isn't empty
npm run dev
```

Copy `.dev.vars.example` to `.dev.vars` and set `ADMIN_KEY` to use `/admin` locally.

## Deploying to Cloudflare

```bash
npx wrangler d1 create vargas          # once; paste the database_id into wrangler.jsonc
npm run db:migrate:remote
npm run db:seed:remote                 # optional sample pages
npx wrangler secret put ADMIN_KEY      # staff key for /admin
npm run deploy
```

The original single-file prototype is kept at `public/prototype.html`.

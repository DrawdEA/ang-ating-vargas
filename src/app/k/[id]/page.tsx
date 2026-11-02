import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shot } from "@/components/art";
import { ScrapbookPage } from "@/components/scrapbook-page";
import { ShareButton } from "@/components/share-button";
import { getCollection } from "@/lib/db";
import { ARTWORKS, STOPS, collectorType } from "@/lib/stops";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCollection((await params).id);
  return { title: c ? `Vargas ni ${c.name}` : "Page not found" };
}

// A visitor's own page, reached from the QR code on screen 2.
export default async function KeepPage({ params }: Props) {
  const c = await getCollection((await params).id);
  if (!c) notFound();
  const type = collectorType(c.picks.map((p) => p.artworkId));
  return (
    <main className="doc">
      <div className="eyebrow">UP Vargas Museum · Ang Ating Vargas</div>
      <h1>Vargas ni {c.name}</h1>
      <p>
        {type.name}: {type.blurb}
      </p>
      <div style={{ fontSize: "clamp(9px, 2.2vw, 17px)" }}>
        <ScrapbookPage name={c.name} picks={c.picks} createdAt={c.createdAt} />
      </div>
      <div className="photos">
        {c.picks.map((p) => (
          <figure key={p.stop}>
            <div className="ph">
              <Shot pick={p} />
            </div>
            <figcaption>
              <b>{ARTWORKS[p.artworkId].title}</b>
              {STOPS[p.stop].zone}
              {p.note && (
                <>
                  <br />
                  <q>{p.note}</q>
                </>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      <p>Bookmark this page or share the link to keep your collection. Photos are deleted when the exhibition ends.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <ShareButton title={`Vargas ni ${c.name}`} />
        <Link className="ghost" href="/">
          Start your own collection
        </Link>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrapbookPage } from "@/components/scrapbook-page";
import { ShareButton } from "@/components/share-button";
import { Shot } from "@/components/shot";
import { getCollection } from "@/lib/db";
import { STOPS } from "@/lib/stops";

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
  return (
    <main className="doc">
      <div className="doc-inner">
        <div className="caps">UP Vargas Museum · Ang Ating Vargas</div>
        <div style={{ fontSize: "clamp(9px, 2.2vw, 17px)" }}>
          <ScrapbookPage id={c.id} name={c.name} picks={c.picks} createdAt={c.createdAt} />
        </div>
        <div className="photos">
          {c.picks.map((p) => (
            <figure key={p.stop}>
              <div className="ph">
                <Shot pick={p} alt={STOPS[p.stop].prompt} />
              </div>
              <figcaption>
                Stop {p.stop + 1}. {STOPS[p.stop].prompt}.{p.note && <q>{p.note}</q>}
              </figcaption>
            </figure>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ShareButton title={`Vargas ni ${c.name}`} />
          <Link className="ghost" href="/">
            Make your own
          </Link>
        </div>
      </div>
    </main>
  );
}

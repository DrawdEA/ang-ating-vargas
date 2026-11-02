"use client";

import { useEffect, useState } from "react";
import { Art } from "@/components/art";
import { useQr } from "@/lib/use-qr";
import { STOPS } from "@/lib/stops";

// Presentation mode for the class demo: a start slide with the entrance QR, then each stop's four pieces
// shown large so the audience can photograph them from their seats. Arrow keys or clicks move between slides.
export default function Tour() {
  const [slide, setSlide] = useState(0);
  const last = STOPS.length;
  const qr = useQr("/", 640);
  const [host, setHost] = useState("");
  useEffect(() => {
    setHost(window.location.host);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) setSlide((s) => Math.min(last, s + 1));
      if (["ArrowLeft", "PageUp"].includes(e.key)) setSlide((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  const stop = slide > 0 ? STOPS[slide - 1] : null;

  return (
    <main className="tour" onClick={() => setSlide((s) => Math.min(last, s + 1))}>
      {!stop ? (
        <div className="start">
          <div className="qrbig">{qr && <img src={qr} alt="QR code to start collecting" />}</div>
          <div>
            <div className="eyebrow" style={{ fontSize: "2cqh" }}>
              UP Vargas Museum · 3rd floor
            </div>
            <h1 style={{ fontSize: "7cqh", marginTop: "2cqh" }}>Gumawa ng sariling Vargas.</h1>
            <p>Scan to start. At each stop, photograph what the prompt asks for, then send your page to the wall.</p>
            <div className="url">{host}</div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="eyebrow" style={{ fontSize: "1.8cqh" }}>
              Stop {slide} of {STOPS.length} · {stop.zone} · {stop.where}
            </div>
            <h1 style={{ marginTop: "1.2cqh" }}>{stop.prompt}</h1>
          </div>
          <div className="works">
            {stop.artworks.map((a) => (
              <div className="work" key={a.id}>
                <div className="img">
                  <Art id={a.id} />
                </div>
                <span>{a.title}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="nav" onClick={(e) => e.stopPropagation()}>
        <button className="ghost" onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0}>
          Back
        </button>
        <span>
          {slide === 0 ? "Start" : `Stop ${slide}`} · {slide + 1} / {last + 1}
        </span>
        <button className="ghost" onClick={() => setSlide((s) => Math.min(last, s + 1))} disabled={slide === last}>
          Next
        </button>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { QrScreen } from "@/components/qr-screen";
import { WallScreen } from "@/components/wall-screen";
import { useQr } from "@/lib/use-qr";
import { STOPS } from "@/lib/stops";

// Presentation mode for the class demo: the entrance QR, one slide per stop, then the live wall and QR grid.
// Arrow keys or a click move between slides.
type Slide = { kind: "start" } | { kind: "stop"; index: number } | { kind: "wall" } | { kind: "qr" };
const SLIDES: Slide[] = [{ kind: "start" }, ...STOPS.map((_, index) => ({ kind: "stop" as const, index })), { kind: "wall" }, { kind: "qr" }];
const LAST = SLIDES.length - 1;

export default function Tour() {
  const [n, setN] = useState(0);
  const qr = useQr("/", 640);
  const slide = SLIDES[n];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) setN((s) => Math.min(LAST, s + 1));
      if (["ArrowLeft", "PageUp"].includes(e.key)) setN((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="tour" onClick={() => setN((s) => Math.min(LAST, s + 1))}>
      {slide.kind === "start" && (
        <div className="start">
          <div className="qrbig">{qr && <img src={qr} alt="QR code to start" />}</div>
          <h1 style={{ fontSize: "8cqh" }}>Scan to start your Vargas</h1>
        </div>
      )}
      {slide.kind === "stop" && (
        <div className="stop-slide">
          <div className="stop-num">{slide.index + 1}</div>
          <div className="eyebrow" style={{ fontSize: "2.2cqh" }}>
            {STOPS[slide.index].zone}
          </div>
          <h1 style={{ fontSize: "9cqh" }}>{STOPS[slide.index].prompt}</h1>
          {STOPS[slide.index].images && (
            <div className="works">
              {STOPS[slide.index].images!.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          )}
        </div>
      )}
      {slide.kind === "wall" && <WallScreen />}
      {slide.kind === "qr" && <QrScreen />}
      <div className="nav">
        {SLIDES.slice(1).map((_, i) => (
          <i key={i} className={i < n ? "on" : ""} />
        ))}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { QrScreen } from "@/components/qr-screen";
import { WallScreen } from "@/components/wall-screen";
import { stopColor } from "@/lib/palette";
import { useQr } from "@/lib/use-qr";
import { STOPS } from "@/lib/stops";

// Presentation mode for the class demo: the entrance QR, one slide per stop, then the live wall and QR grid.
// Arrow keys or a click move between slides.
type Slide = { kind: "start" } | { kind: "stop"; index: number } | { kind: "wall" } | { kind: "qr" };
const SLIDES: Slide[] = [{ kind: "start" }, ...STOPS.map((_, index) => ({ kind: "stop" as const, index })), { kind: "wall" }, { kind: "qr" }];
const LAST = SLIDES.length - 1;

export default function Tour() {
  const [n, setN] = useState(0);
  const [host, setHost] = useState("");
  const qr = useQr("/", 640);
  const slide = SLIDES[n];

  useEffect(() => {
    setHost(window.location.host);
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
        <>
          <div className="half">
            <div className="caps" style={{ fontSize: "2.2cqh", marginBottom: "6cqh" }}>
              Vargas Museum · 3rd floor
            </div>
            <h1>
              Vargas collected for sixty years. <span className="accent">Scan to start yours.</span>
            </h1>
            <div className="url">{host}</div>
          </div>
          <div className="half c-mustard">
            <div className="qrbig">{qr && <img src={qr} alt="QR code to start" />}</div>
          </div>
        </>
      )}
      {slide.kind === "stop" && (
        <div className="stop-slide">
          <div className={`big-num c-${stopColor(slide.index)}`}>{slide.index + 1}</div>
          <div className="caps" style={{ fontSize: "2.2cqh" }}>
            {STOPS[slide.index].zone}
          </div>
          <h1>{STOPS[slide.index].prompt}</h1>
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

"use client";

import { useEffect, useState } from "react";
import { useQr } from "@/lib/use-qr";
import { STOPS } from "@/lib/stops";

// Presentation mode for the class demo: the entrance QR, then one slide per stop's prompt.
// Arrow keys or a click move between slides.
export default function Tour() {
  const [slide, setSlide] = useState(0);
  const last = STOPS.length;
  const qr = useQr("/", 640);

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
          <div className="qrbig">{qr && <img src={qr} alt="QR code to start" />}</div>
          <h1 style={{ fontSize: "8cqh" }}>Scan to start your Vargas</h1>
        </div>
      ) : (
        <div className="stop-slide">
          <div className="stop-num">{slide}</div>
          <div className="eyebrow" style={{ fontSize: "2.2cqh" }}>
            {stop.zone}
          </div>
          <h1 style={{ fontSize: "9cqh" }}>{stop.prompt}</h1>
          {stop.images && (
            <div className="works">
              {stop.images.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="nav">
        {STOPS.map((_, i) => (
          <i key={i} className={i < slide ? "on" : ""} />
        ))}
      </div>
    </main>
  );
}

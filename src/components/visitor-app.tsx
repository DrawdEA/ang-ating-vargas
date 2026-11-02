"use client";

import { useEffect, useMemo, useState } from "react";
import { Art, Shot } from "./art";
import { ScrapbookPage } from "./scrapbook-page";
import { compressPhoto } from "@/lib/image";
import { ARTWORKS, STOPS, collectorType } from "@/lib/stops";
import type { Feed, Pick } from "@/lib/types";

// A photo taken at one stop, kept on the phone until the visitor sends their page.
type Taken = { artworkId: string; note: string; r: number; blob?: Blob; url?: string };

type Step = { kind: "welcome" } | { kind: "stop"; index: number } | { kind: "recap"; slide: number } | { kind: "sent"; id: string };

const tilt = () => Math.round(Math.random() * 8 - 4);

export function VisitorApp() {
  const [step, setStep] = useState<Step>({ kind: "welcome" });
  const [name, setName] = useState("");
  const [onWall, setOnWall] = useState(true);
  const [taken, setTaken] = useState<(Taken | null)[]>(() => STOPS.map(() => null));
  const [aim, setAim] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState<Feed | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const reset = () => {
    taken.forEach((t) => t?.url && URL.revokeObjectURL(t.url));
    setTaken(STOPS.map(() => null));
    setStep({ kind: "welcome" });
    setName("");
    setAim(null);
    setError("");
  };

  const setStopPhoto = (index: number, value: Taken | null) =>
    setTaken((prev) => {
      const next = [...prev];
      if (prev[index]?.url && prev[index]?.url !== value?.url) URL.revokeObjectURL(prev[index]!.url!);
      next[index] = value;
      return next;
    });

  const goNext = (index: number) => {
    setAim(null);
    setError("");
    if (index < STOPS.length - 1) setStep({ kind: "stop", index: index + 1 });
    else {
      setStep({ kind: "recap", slide: 0 });
      fetch("/api/collections?limit=1", { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<Feed>) : null))
        .then(setStats)
        .catch(() => {});
    }
  };

  const send = async () => {
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("name", name.trim());
    form.set("onWall", onWall ? "1" : "0");
    const picks: object[] = [];
    taken.forEach((t, stop) => {
      if (!t) return;
      const key = t.blob ? `photo_${stop}` : undefined;
      if (t.blob && key) form.set(key, t.blob, `${key}.jpg`);
      picks.push({ stop, artworkId: t.artworkId, note: t.note.trim() || undefined, photo: key, r: t.r });
    });
    form.set("picks", JSON.stringify(picks));
    try {
      const res = await fetch("/api/collections", { method: "POST", body: form });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Your page didn't send. Check your connection and try again.");
      setStep({ kind: "sent", id: data.id });
    } catch (e) {
      setError(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Your page didn't send. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app">
      <div className="app-inner">
        <div className="brand">
          <span>UP Vargas Museum</span>
          <span>Ang Ating Vargas</span>
        </div>
        {step.kind === "welcome" && (
          <Welcome name={name} setName={setName} onWall={onWall} setOnWall={setOnWall} onStart={() => setStep({ kind: "stop", index: 0 })} />
        )}
        {step.kind === "stop" && (
          <StopScreen
            index={step.index}
            taken={taken[step.index]}
            aim={aim}
            setAim={setAim}
            onPhoto={(t) => setStopPhoto(step.index, t)}
            onNote={(note) => setStopPhoto(step.index, { ...taken[step.index]!, note })}
            onNext={() => goNext(step.index)}
            onSkip={() => {
              setStopPhoto(step.index, null);
              goNext(step.index);
            }}
            onBack={step.index > 0 ? () => setStep({ kind: "stop", index: step.index - 1 }) : undefined}
          />
        )}
        {step.kind === "recap" && (
          <Recap
            name={name}
            taken={taken}
            stats={stats}
            slide={step.slide}
            setSlide={(slide) => setStep({ kind: "recap", slide })}
            onSend={send}
            onRetake={() => setStep({ kind: "stop", index: 0 })}
            busy={busy}
            error={error}
          />
        )}
        {step.kind === "sent" && (
          <div className="grow">
            <div className="eyebrow">Sent</div>
            <h1>{onWall ? "Look up. Your page is in front on the wall." : "Your page is saved."}</h1>
            <p>
              {onWall
                ? "Find it on the screen beside the wall and scan its QR code to keep it. You can also open it right here."
                : "You chose to keep it off the wall. Open it below and bookmark the link to keep it."}
            </p>
            <a className="btn" href={`/k/${step.id}`}>
              Open my page
            </a>
            <button className="btn alt" onClick={reset}>
              Start a new collection
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Welcome(props: { name: string; setName: (v: string) => void; onWall: boolean; setOnWall: (v: boolean) => void; onStart: () => void }) {
  const [err, setErr] = useState("");
  return (
    <div className="grow">
      <div className="eyebrow">3rd floor · start here</div>
      <h1>Vargas collected for sixty years. Today, you collect for one visit.</h1>
      <p>At four stops, a prompt tells you what to photograph. Add a line on why if you like. At the exit, your photos become a scrapbook page: your own Vargas.</p>
      <div className="field">
        <label htmlFor="name">Your name or nickname</label>
        <input
          id="name"
          type="text"
          maxLength={16}
          placeholder="Bea"
          autoComplete="given-name"
          value={props.name}
          onChange={(e) => {
            props.setName(e.target.value);
            setErr("");
          }}
        />
      </div>
      <label className="check">
        <input id="onwall" type="checkbox" checked={props.onWall} onChange={(e) => props.setOnWall(e.target.checked)} />
        <span>Show my page on the museum wall. Only your first name, photos and notes appear. Photos are deleted when the exhibition ends.</span>
      </label>
      <div className="err" role="alert">
        {err}
      </div>
      <button
        className="btn"
        onClick={() => {
          if (!props.name.trim()) return setErr("Add a name so your page has a collector.");
          props.onStart();
        }}
      >
        Start collecting
      </button>
    </div>
  );
}

function StopScreen(props: {
  index: number;
  taken: Taken | null;
  aim: string | null;
  setAim: (id: string) => void;
  onPhoto: (t: Taken | null) => void;
  onNote: (note: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
}) {
  const stop = STOPS[props.index];
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(false);
  const t = props.taken;

  const onFile = async (file: File | undefined) => {
    if (!file || !props.aim) return;
    setWorking(true);
    setErr("");
    try {
      const blob = await compressPhoto(file);
      props.onPhoto({ artworkId: props.aim, note: "", r: tilt(), blob, url: URL.createObjectURL(blob) });
    } catch {
      setErr("That photo couldn't be read. Try taking it again.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div className="progress">
        {STOPS.map((_, i) => (
          <i key={i} className={i <= props.index ? "on" : ""} />
        ))}
      </div>
      <div>
        <div className="eyebrow">
          Stop {props.index + 1} of {STOPS.length} · {stop.zone}
        </div>
        <p style={{ fontSize: 13 }}>{stop.where}</p>
      </div>
      <h2>{stop.prompt}</h2>

      {!t && (
        <>
          <p style={{ fontSize: 14 }}>Find these four pieces. Tap the one you&apos;ll photograph.</p>
          <div className="grid4">
            {stop.artworks.map((a) => (
              <button key={a.id} className="opt" aria-pressed={props.aim === a.id} onClick={() => props.setAim(a.id)}>
                <span className="thumb">
                  <Art id={a.id} />
                </span>
                <span className="t">{a.title}</span>
              </button>
            ))}
          </div>
          <label className={`btn camera${props.aim && !working ? "" : " disabled"}`} style={{ opacity: props.aim && !working ? 1 : 0.45 }}>
            {working ? "Processing photo…" : props.aim ? `Photograph “${ARTWORKS[props.aim].title}”` : "Tap a piece first"}
            <input
              id={`camera-${props.index}`}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={!props.aim || working}
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {props.aim && (
            <button className="link" onClick={() => props.onPhoto({ artworkId: props.aim!, note: "", r: tilt() })}>
              No camera here? Use a sample shot
            </button>
          )}
          <div className="err" role="alert">
            {err}
          </div>
        </>
      )}

      {t && (
        <>
          <div className="preview">
            <Shot pick={{ stop: props.index, artworkId: t.artworkId, r: t.r }} src={t.url} />
            <span className="tag">{ARTWORKS[t.artworkId].title}</span>
          </div>
          <div className="field">
            <label htmlFor={`note-${props.index}`}>Why this one? (optional)</label>
            <textarea id={`note-${props.index}`} rows={2} maxLength={60} placeholder="Parang si Lola." value={t.note} onChange={(e) => props.onNote(e.target.value)} />
          </div>
          <div className="row">
            <button className="btn alt" onClick={() => props.onPhoto(null)}>
              Retake
            </button>
            <button className="btn" onClick={props.onNext}>
              {props.index < STOPS.length - 1 ? "Next stop" : "Finish"}
            </button>
          </div>
        </>
      )}

      <div className="row" style={{ justifyContent: "space-between" }}>
        {props.onBack ? (
          <button className="link" style={{ flex: "none" }} onClick={props.onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button className="link" style={{ flex: "none", textAlign: "right" }} onClick={props.onSkip}>
          Skip this stop
        </button>
      </div>
    </>
  );
}

function Recap(props: {
  name: string;
  taken: (Taken | null)[];
  stats: Feed | null;
  slide: number;
  setSlide: (n: number) => void;
  onSend: () => void;
  onRetake: () => void;
  busy: boolean;
  error: string;
}) {
  const entries = props.taken.map((t, stop) => (t ? { t, stop } : null)).filter((e): e is { t: Taken; stop: number } => e !== null);
  const picks: Pick[] = entries.map(({ t, stop }) => ({ stop, artworkId: t.artworkId, note: t.note.trim() || undefined, r: t.r }));
  const srcs = entries.map(({ t }) => t.url);
  const now = useMemo(() => Date.now(), []);

  if (!entries.length) {
    return (
      <div className="grow">
        <h1>You skipped every stop.</h1>
        <p>Your page needs at least one photo.</p>
        <button className="btn" onClick={props.onRetake}>
          Go back to stop 1
        </button>
      </div>
    );
  }

  const type = collectorType(picks.map((p) => p.artworkId));
  const slides = [
    <>
      <div className="eyebrow">Your Vargas, {props.name}</div>
      <div className="big">{entries.length}</div>
      <h1>
        photo{entries.length === 1 ? "" : "s"} collected in one visit.
      </h1>
      <p>Vargas needed a whole museum for his collection. Yours fits on one page.</p>
    </>,
    <>
      <div className="eyebrow">Your collector type</div>
      <h1 style={{ fontSize: 38 }}>{type.name}</h1>
      <p>{type.blurb}</p>
    </>,
    <>
      <div className="eyebrow">You and other visitors</div>
      <h2>Here&apos;s how your photos compare.</h2>
      {entries.map(({ t, stop }) => {
        const total = props.stats?.total ?? 0;
        const pct = total ? Math.round((100 * (props.stats?.counts[t.artworkId] ?? 0)) / total) : 0;
        return (
          <div className="stat" key={stop}>
            <span className="thumb">
              <Shot pick={{ stop, artworkId: t.artworkId, r: t.r }} src={t.url} />
            </span>
            <div>
              <div style={{ fontSize: 14 }}>{ARTWORKS[t.artworkId].title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
                {pct ? `${pct}% of visitors photographed this${pct < 20 ? " · a rare pick" : ""}` : "No one has photographed this yet. You're the first."}
              </div>
              <div className="meter">
                <b style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </>,
    <>
      <div className="eyebrow">Your page</div>
      <div style={{ fontSize: 9.5 }}>
        <ScrapbookPage name={props.name} picks={picks} createdAt={now} srcs={srcs} />
      </div>
      <p>Send it to the wall. Your page and its QR code will appear on the screen at the exit.</p>
      <div className="err" role="alert">
        {props.error}
      </div>
      <button className="btn" onClick={props.onSend} disabled={props.busy}>
        {props.busy ? "Sending…" : props.error ? "Try sending again" : "Send to the wall"}
      </button>
    </>,
  ];
  const last = slides.length - 1;

  return (
    <>
      <div className="dots">
        {slides.map((_, i) => (
          <i key={i} className={i === props.slide ? "on" : ""} />
        ))}
      </div>
      <div className="grow">{slides[props.slide]}</div>
      <div className="row">
        <button className="btn alt" disabled={props.slide === 0} onClick={() => props.setSlide(props.slide - 1)}>
          Back
        </button>
        {props.slide < last && (
          <button className="btn" onClick={() => props.setSlide(props.slide + 1)}>
            Next
          </button>
        )}
      </div>
    </>
  );
}

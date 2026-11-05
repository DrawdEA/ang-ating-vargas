"use client";

import { useEffect, useMemo, useState } from "react";
import { ScrapbookPage } from "./scrapbook-page";
import { Shot } from "./shot";
import { compressPhoto } from "@/lib/image";
import { stopColor } from "@/lib/palette";
import { STOPS } from "@/lib/stops";
import type { Pick } from "@/lib/types";

// A photo taken at one stop, kept on the phone until the visitor sends their page.
type Taken = { blob: Blob; url: string; note: string; r: number };

type Step = { kind: "welcome" } | { kind: "stop"; index: number } | { kind: "review" } | { kind: "sent"; id: string };

export function VisitorApp() {
  const [step, setStep] = useState<Step>({ kind: "welcome" });
  const [name, setName] = useState("");
  const [onWall, setOnWall] = useState(true);
  const [taken, setTaken] = useState<(Taken | null)[]>(() => STOPS.map(() => null));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const setAt = (index: number, value: Taken | null) =>
    setTaken((prev) => {
      const old = prev[index];
      if (old && old.url !== value?.url) URL.revokeObjectURL(old.url);
      return prev.map((t, i) => (i === index ? value : t));
    });

  const next = (index: number) => setStep(index < STOPS.length - 1 ? { kind: "stop", index: index + 1 } : { kind: "review" });

  const reset = () => {
    taken.forEach((t) => t && URL.revokeObjectURL(t.url));
    setTaken(STOPS.map(() => null));
    setName("");
    setError("");
    setStep({ kind: "welcome" });
  };

  const send = async () => {
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("name", name.trim());
    form.set("onWall", onWall ? "1" : "0");
    const picks: { stop: number; note?: string; r: number }[] = [];
    taken.forEach((t, stop) => {
      if (!t) return;
      form.set(`photo_${stop}`, t.blob, `stop-${stop + 1}.jpg`);
      picks.push({ stop, note: t.note.trim() || undefined, r: t.r });
    });
    form.set("picks", JSON.stringify(picks));
    try {
      const res = await fetch("/api/collections", { method: "POST", body: form });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error);
      setStep({ kind: "sent", id: data.id });
    } catch (e) {
      setError((e instanceof Error && e.message) || "Didn't send. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const inFlow = step.kind === "stop" || step.kind === "review";
  return (
    <main className="app">
      <div className="app-inner">
        {inFlow && <FilmStrip taken={taken} current={step.kind === "stop" ? step.index : -1} onJump={(index) => setStep({ kind: "stop", index })} />}

        {step.kind === "welcome" && (
          <Welcome name={name} setName={setName} onWall={onWall} setOnWall={setOnWall} onStart={() => setStep({ kind: "stop", index: 0 })} />
        )}

        {step.kind === "stop" && (
          <StopScreen
            key={step.index}
            index={step.index}
            taken={taken[step.index]}
            onTake={(t) => setAt(step.index, t)}
            onNote={(note) => taken[step.index] && setAt(step.index, { ...taken[step.index]!, note })}
            onNext={() => next(step.index)}
          />
        )}

        {step.kind === "review" && <Review name={name} taken={taken} onSend={send} busy={busy} error={error} onBack={() => setStep({ kind: "stop", index: 0 })} />}

        {step.kind === "sent" && (
          <div className="grow">
            <h1>{onWall ? "Look up. You're on the wall." : "Your page is saved."}</h1>
            <a className="btn" href={`/k/${step.id}`}>
              Open my page
            </a>
            <button className="btn alt" onClick={reset}>
              Start over
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// Four slots that fill with the visitor's photos. Tap any slot to go to that stop.
function FilmStrip({ taken, current, onJump }: { taken: (Taken | null)[]; current: number; onJump: (i: number) => void }) {
  const count = taken.filter(Boolean).length;
  return (
    <div className="strip" aria-label={`${count} of ${taken.length} photos collected`}>
      {taken.map((t, i) => (
        <button key={i} className={`slot${i === current ? " current" : ""}${t ? " filled" : ""}`} onClick={() => onJump(i)} aria-label={`Stop ${i + 1}${t ? ", photo taken" : ""}`}>
          {t && <Shot src={t.url} />}
          <span className="slot-num">{i + 1}</span>
        </button>
      ))}
      <span className="strip-count">
        {count}/{taken.length}
      </span>
    </div>
  );
}

function Welcome(props: { name: string; setName: (v: string) => void; onWall: boolean; setOnWall: (v: boolean) => void; onStart: () => void }) {
  const [err, setErr] = useState("");
  return (
    <div className="grow">
      <div className="swatches" aria-hidden="true">
        <i className="c-mustard" />
        <i className="c-mint" />
        <i className="c-pink" />
        <i className="c-cobalt" />
      </div>
      <h1>
        Vargas collected for sixty years. <span className="accent">You have one visit.</span>
      </h1>
      <div className="field">
        <input
          id="name"
          type="text"
          maxLength={16}
          placeholder="Your name"
          aria-label="Your name"
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
        <span>Show my page on the wall</span>
      </label>
      {err && (
        <div className="err" role="alert">
          {err}
        </div>
      )}
      <button
        className="btn"
        onClick={() => {
          if (!props.name.trim()) return setErr("Add your name first.");
          props.onStart();
        }}
      >
        Start
      </button>
    </div>
  );
}

function CameraInput({ disabled, onFile }: { disabled: boolean; onFile: (f?: File) => void }) {
  return (
    <input
      type="file"
      accept="image/*"
      capture="environment"
      disabled={disabled}
      onChange={(e) => {
        onFile(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );
}

function StopScreen(props: { index: number; taken: Taken | null; onTake: (t: Taken | null) => void; onNote: (n: string) => void; onNext: () => void }) {
  const stop = STOPS[props.index];
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(false);
  const t = props.taken;

  const onFile = async (file?: File) => {
    if (!file) return;
    setWorking(true);
    setErr("");
    try {
      const blob = await compressPhoto(file);
      props.onTake({ blob, url: URL.createObjectURL(blob), note: t?.note ?? "", r: Math.round(Math.random() * 8 - 4) });
    } catch {
      setErr("That photo didn't work. Try again.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div>
        <div className="stop-head">
          <span className={`stop-chip c-${stopColor(props.index)}`}>{props.index + 1}</span>
          <span>{stop.zone}</span>
        </div>
        <h2 style={{ marginTop: 12 }}>{stop.prompt}</h2>
      </div>

      {t ? (
        <>
          <div className="viewfinder">
            <Shot src={t.url} alt={`Your photo for stop ${props.index + 1}`} />
          </div>
          <div className="vf-caption">Stop {props.index + 1}. Your photo.</div>
        </>
      ) : (
        <label className={`viewfinder empty-vf c-${stopColor(props.index)}`}>
          <span className="ellipse" aria-hidden="true" />
          <span className="shutter" aria-hidden="true" />
          <span>{working ? "Processing..." : "Take photo"}</span>
          <CameraInput disabled={working} onFile={onFile} />
        </label>
      )}

      {err && (
        <div className="err" role="alert">
          {err}
        </div>
      )}

      {t ? (
        <>
          <div className="field">
            <textarea
              id={`note-${props.index}`}
              rows={2}
              maxLength={60}
              placeholder="Why this? (optional)"
              aria-label="Why this? (optional)"
              value={t.note}
              onChange={(e) => props.onNote(e.target.value)}
            />
          </div>
          <div className="row">
            <label className="btn alt camera">
              Retake
              <CameraInput disabled={working} onFile={onFile} />
            </label>
            <button className="btn" onClick={props.onNext}>
              {props.index === STOPS.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </>
      ) : (
        <button className="link" onClick={props.onNext}>
          Skip
        </button>
      )}
    </>
  );
}

function Review(props: { name: string; taken: (Taken | null)[]; onSend: () => void; busy: boolean; error: string; onBack: () => void }) {
  const entries = props.taken.map((t, stop) => (t ? { t, stop } : null)).filter((e): e is { t: Taken; stop: number } => !!e);
  const picks: Pick[] = entries.map(({ t, stop }) => ({ stop, photoId: "", note: t.note.trim() || undefined, r: t.r }));
  const now = useMemo(() => Date.now(), []);

  if (!entries.length) {
    return (
      <div className="grow">
        <h1>No photos yet.</h1>
        <button className="btn" onClick={props.onBack}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="grow">
      <div style={{ fontSize: 9.5 }}>
        <ScrapbookPage name={props.name} picks={picks} createdAt={now} srcs={entries.map(({ t }) => t.url)} />
      </div>
      {props.error && (
        <div className="err" role="alert">
          {props.error}
        </div>
      )}
      <button className="btn" onClick={props.onSend} disabled={props.busy}>
        {props.busy ? "Sending..." : "Send to the wall"}
      </button>
    </div>
  );
}

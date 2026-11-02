// Builds a test page on the admin's device and sends it through the same endpoint visitors use.
import { STOPS } from "./stops";

const NAMES = ["Bea", "Migs", "Lia", "Paolo", "Kat", "Josh", "Ria", "Enzo", "Nina", "Carlo", "Ysa", "Gab"];
const NOTES = ["Parang si Lola.", "Who owns this now?", "The gold got me.", "Dapat dito lang ito.", "He kept everything.", "Ang ganda ng ilaw."];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// A plainly fake photo: a colored card labeled TEST with its stop number.
function testPhoto(stop: number): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = 800;
  c.height = 1000;
  const x = c.getContext("2d")!;
  const hue = Math.floor(Math.random() * 360);
  x.fillStyle = `hsl(${hue} 35% 38%)`;
  x.fillRect(0, 0, 800, 1000);
  x.fillStyle = `hsl(${(hue + 40) % 360} 45% 70%)`;
  x.beginPath();
  x.arc(400, 420, 220, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#fff";
  x.textAlign = "center";
  x.font = "bold 120px sans-serif";
  x.fillText("TEST", 400, 820);
  x.font = "500 56px sans-serif";
  x.fillText(`Stop ${stop + 1}`, 400, 900);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't make a test photo."))), "image/jpeg", 0.8));
}

export async function sendTestPage(adminKey: string) {
  const stops = STOPS.map((_, i) => i).filter(() => Math.random() > 0.2);
  if (!stops.length) stops.push(0);
  const noteAt = Math.random() > 0.3 ? pick(stops) : -1;

  const form = new FormData();
  form.set("name", pick(NAMES));
  form.set("test", "1");
  form.set("picks", JSON.stringify(stops.map((stop) => ({ stop, note: stop === noteAt ? pick(NOTES) : undefined, r: Math.round(Math.random() * 8 - 4) }))));
  for (const stop of stops) form.set(`photo_${stop}`, await testPhoto(stop), `test-${stop + 1}.jpg`);

  const res = await fetch("/api/collections", { method: "POST", body: form, headers: { "x-admin-key": adminKey } });
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Couldn't add a test page.");
}

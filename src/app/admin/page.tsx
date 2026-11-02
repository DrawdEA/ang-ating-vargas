"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrapbookPage } from "@/components/scrapbook-page";
import type { Collection } from "@/lib/types";

type AdminItem = Collection & { onWall: boolean; hidden: boolean };

// Staff moderation: hide or restore any page. Needs the staff key set as ADMIN_KEY on the server.
export default function Admin() {
  const [key, setKey] = useState("");
  const [items, setItems] = useState<AdminItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setKey(sessionStorage.getItem("vargas-admin-key") ?? "");
    } catch {}
  }, []);

  const load = useCallback(async (k: string) => {
    setError("");
    const res = await fetch("/api/admin", { headers: { "x-admin-key": k }, cache: "no-store" });
    if (!res.ok) {
      setItems(null);
      return setError("That staff key didn't work. Check it and try again.");
    }
    try {
      sessionStorage.setItem("vargas-admin-key", k);
    } catch {}
    setItems(((await res.json()) as { items: AdminItem[] }).items);
  }, []);

  const toggle = async (item: AdminItem) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "x-admin-key": key, "content-type": "application/json" },
      body: JSON.stringify({ id: item.id, hidden: !item.hidden }),
    });
    if (res.ok) setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, hidden: !i.hidden } : i)) ?? null);
    else setError("Couldn't update that page. Try again.");
  };

  return (
    <main className="doc">
      <div className="eyebrow">Staff only</div>
      <h1>Moderate pages</h1>
      <form
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!key.trim()) return setError("Enter the staff key first.");
          load(key.trim());
        }}
      >
        <input
          id="admin-key"
          type="password"
          placeholder="Staff key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--night-2)", color: "var(--fg)" }}
        />
        <button className="ghost" type="submit">
          Show pages
        </button>
      </form>
      {error && <p style={{ color: "#E7A797" }}>{error}</p>}
      {items && (
        <div className="admin-list">
          {items.length === 0 && <p>No pages yet.</p>}
          {items.map((item) => (
            <div key={item.id} className={`admin-row${item.hidden ? " hidden" : ""}`}>
              <div className="pg">
                <ScrapbookPage name={item.name} picks={item.picks} createdAt={item.createdAt} />
              </div>
              <div>
                <div style={{ color: "var(--fg)" }}>{item.name}</div>
                <div style={{ fontSize: 13, color: "var(--fg-2)" }}>
                  {new Date(item.createdAt).toLocaleString("en-PH")} · {item.hidden ? "Hidden" : item.onWall ? "On the wall" : "Kept off the wall"}
                </div>
                {item.picks.filter((p) => p.note).map((p) => (
                  <div key={p.stop} style={{ fontSize: 13, color: "var(--fg-2)" }}>
                    &ldquo;{p.note}&rdquo;
                  </div>
                ))}
              </div>
              <button className="ghost" onClick={() => toggle(item)}>
                {item.hidden ? "Restore" : "Hide"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

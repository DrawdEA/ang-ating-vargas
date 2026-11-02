"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrapbookPage } from "@/components/scrapbook-page";
import type { Collection } from "@/lib/types";

type AdminItem = Collection & { onWall: boolean; hidden: boolean };

const STORAGE = "vargas-admin-key";

// Admin page: see every page as it comes in, hide or delete it, and share access with the team.
// An admin link carries the key in the URL hash (#key=...), which never reaches the server logs.
export default function Admin() {
  const [key, setKey] = useState("");
  const [items, setItems] = useState<AdminItem[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(async (k: string) => {
    const res = await fetch("/api/admin", { headers: { "x-admin-key": k }, cache: "no-store" });
    if (!res.ok) {
      setItems(null);
      setError("That admin key didn't work.");
      return false;
    }
    setError("");
    try {
      sessionStorage.setItem(STORAGE, k);
    } catch {}
    setItems(((await res.json()) as { items: AdminItem[] }).items);
    return true;
  }, []);

  // Sign in from an admin link or an earlier visit, then keep the list fresh.
  useEffect(() => {
    let k = new URLSearchParams(window.location.hash.slice(1)).get("key") ?? "";
    if (k) history.replaceState(null, "", window.location.pathname);
    else {
      try {
        k = sessionStorage.getItem(STORAGE) ?? "";
      } catch {}
    }
    if (k) {
      setKey(k);
      load(k);
    }
  }, [load]);

  useEffect(() => {
    if (!items) return;
    const t = setInterval(() => load(key), 5000);
    return () => clearInterval(t);
  }, [items, key, load]);

  const call = async (method: "POST" | "DELETE", body: object) => {
    const res = await fetch("/api/admin", { method, headers: { "x-admin-key": key, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) setError("That didn't work. Try again.");
    await load(key);
  };

  const remove = (id: string) => {
    if (confirming !== id) {
      setConfirming(id);
      setTimeout(() => setConfirming((c) => (c === id ? null : c)), 4000);
      return;
    }
    setConfirming(null);
    call("DELETE", { id });
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/admin#key=${encodeURIComponent(key)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setError(`Copy this link: ${link}`);
    }
  };

  if (!items) {
    return (
      <main className="doc">
        <h1>Admin</h1>
        <form
          className="admin-login"
          onSubmit={(e) => {
            e.preventDefault();
            if (!key.trim()) return setError("Enter the admin key.");
            load(key.trim());
          }}
        >
          <input id="admin-key" type="password" placeholder="Admin key" aria-label="Admin key" value={key} onChange={(e) => setKey(e.target.value)} />
          <button className="ghost" type="submit">
            Open
          </button>
        </form>
        {error && <p className="admin-err">{error}</p>}
      </main>
    );
  }

  const live = items.filter((i) => !i.hidden).length;

  return (
    <main className="doc">
      <div className="admin-head">
        <h1>Admin</h1>
        <button className="ghost" onClick={copyLink}>
          {copied ? "Link copied" : "Copy admin link"}
        </button>
      </div>
      <ul className="admin-help">
        <li>
          <b>Hide</b> takes a page off the screens. You can bring it back.
        </li>
        <li>
          <b>Delete</b> removes the page and its photos for good. Tap twice to confirm.
        </li>
        <li>
          <b>Copy admin link</b> to give a groupmate access. Anyone with the link can hide and delete.
        </li>
      </ul>
      {error && <p className="admin-err">{error}</p>}
      <p>
        {items.length} page{items.length === 1 ? "" : "s"} · {live} showing
      </p>
      <div className="admin-list">
        {items.map((item) => (
          <div key={item.id} className={`admin-row${item.hidden ? " hidden" : ""}`}>
            <a className="pg" href={`/k/${item.id}`} target="_blank" rel="noreferrer">
              <ScrapbookPage name={item.name} picks={item.picks} createdAt={item.createdAt} />
            </a>
            <div>
              <div style={{ color: "var(--fg)" }}>{item.name}</div>
              <div style={{ fontSize: 13, color: "var(--fg-2)" }}>
                {new Date(item.createdAt).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })} · {item.hidden ? "Hidden" : item.onWall ? "On the wall" : "Private"}
              </div>
            </div>
            <div className="admin-actions">
              <button className="ghost" onClick={() => call("POST", { id: item.id, hidden: !item.hidden })}>
                {item.hidden ? "Show" : "Hide"}
              </button>
              <button className={`ghost danger${confirming === item.id ? " armed" : ""}`} onClick={() => remove(item.id)}>
                {confirming === item.id ? "Tap to confirm" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

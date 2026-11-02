"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [label, setLabel] = useState("Share or copy link");
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) return await navigator.share({ title, url });
      await navigator.clipboard.writeText(url);
      setLabel("Link copied");
    } catch {
      // The visitor closed the share sheet; nothing to do.
    }
  };
  return (
    <button className="ghost" onClick={share}>
      {label}
    </button>
  );
}

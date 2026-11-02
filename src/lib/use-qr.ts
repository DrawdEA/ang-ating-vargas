"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

// A data URL of a QR code pointing at `path` on this site.
export function useQr(path: string, size = 320) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(new URL(path, window.location.origin).toString(), {
      margin: 1,
      width: size,
      errorCorrectionLevel: "M",
      color: { dark: "#2B2118", light: "#FFFFFF" },
    }).then(setSrc, () => setSrc(null));
  }, [path, size]);
  return src;
}

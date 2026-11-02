// Drawn stand-ins for each piece, used until real photos are added to public/art/.
import type { Artwork } from "./stops";

function shapes(a: Artwork): string {
  const B = `<rect width="100" height="100" fill="${a.color}"/>`;
  switch (a.motif) {
    case "halo":
      return B + `<circle cx="50" cy="36" r="19" fill="#E9C66B" opacity=".9"/><ellipse cx="50" cy="82" rx="26" ry="32" fill="#3A2416"/><circle cx="50" cy="38" r="10" fill="#D8B48A"/><rect x="4" y="4" width="92" height="92" fill="none" stroke="#E9C66B" stroke-width="2" opacity=".6"/>`;
    case "box":
      return B + `<rect x="12" y="28" width="76" height="46" rx="6" fill="#120F0D" stroke="#C9A14A" stroke-width="2"/><ellipse cx="50" cy="51" rx="22" ry="14" fill="#A3261E"/><circle cx="50" cy="51" r="6" fill="#E9C66B"/>`;
    case "hands":
      return B + `<rect width="100" height="100" fill="#C9A14A" opacity=".35"/><path d="M38 90 L46 30 Q50 22 54 30 L62 90 Z" fill="#D8B48A"/><path d="M50 26 L50 90" stroke="#9A7A58" stroke-width="1.5"/>`;
    case "land":
      return B + `<rect y="58" width="100" height="42" fill="#4F6D5A"/><path d="M0 62 Q30 44 55 58 T100 54 V100 H0Z" fill="#3D5646"/><circle cx="76" cy="24" r="8" fill="#F1E3B8"/><rect x="40" y="64" width="3" height="8" fill="#7A2E22"/><rect x="47" y="65" width="3" height="7" fill="#1E3550"/>`;
    case "glass":
      return B + `<rect y="62" width="100" height="38" fill="#3E7A3A"/><rect x="14" y="40" width="22" height="24" fill="#D3453A"/><path d="M12 40 L25 28 L38 40Z" fill="#4A2A1A"/><rect x="56" y="44" width="26" height="20" fill="#2F5FA3"/><path d="M54 44 L69 32 L84 44Z" fill="#4A2A1A"/><circle cx="20" cy="18" r="8" fill="#FBEFB0"/>`;
    case "portrait":
      return B + `<ellipse cx="50" cy="40" rx="15" ry="19" fill="#C99A6E"/><path d="M18 100 Q22 66 50 62 Q78 66 82 100Z" fill="#1E1C1A"/><path d="M44 64 L50 80 L56 64Z" fill="#EDE4D3"/><rect x="4" y="4" width="92" height="92" fill="none" stroke="#C9A14A" stroke-width="3"/>`;
    case "group":
      return B + [22, 40, 60, 78].map((x, i) => `<circle cx="${x}" cy="${44 + (i % 2) * 6}" r="8" fill="#C99A6E"/><path d="M${x - 12} 100 Q${x} ${58 + (i % 2) * 6} ${x + 12} 100Z" fill="#2A2420"/>`).join("");
    case "medal":
      return B + `<path d="M38 6 L50 40 L62 6Z" fill="#2F5FA3"/><path d="M44 6 L50 30 L56 6Z" fill="#D3453A"/><circle cx="50" cy="62" r="24" fill="#C9A14A"/><circle cx="50" cy="62" r="17" fill="none" stroke="#8A6A22" stroke-width="2"/><path d="M50 50 L54 60 L64 60 L56 66 L59 76 L50 70 L41 76 L44 66 L36 60 L46 60Z" fill="#8A6A22"/>`;
    case "hat":
      return B + `<path d="M10 66 L50 26 L90 66 Q50 76 10 66Z" fill="#8A6234"/><path d="M50 26 L50 66 M30 46 L70 46" stroke="#5C3E1E" stroke-width="1.5"/><ellipse cx="50" cy="66" rx="40" ry="5" fill="#6E4B26"/>`;
    case "cane":
      return B + `<path d="M52 92 L52 30 Q52 16 40 16 Q30 16 30 26" fill="none" stroke="#5C3A24" stroke-width="7" stroke-linecap="round"/><rect x="48" y="84" width="8" height="8" fill="#C9A14A"/>`;
    case "page":
      return B + `<rect x="14" y="14" width="72" height="72" fill="#F8F0DC" stroke="#CDBB95"/><rect x="22" y="22" width="30" height="24" fill="#7A6A53"/>` + [54, 62, 70, 78].map((y) => `<rect x="22" y="${y}" width="${y % 16 ? 52 : 40}" height="2" fill="#B7A47E"/>`).join("");
  }
}

export function artSvg(a: Artwork): string {
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${shapes(a)}</svg>`;
}

// A drawn "phone photo" of the piece: tilted, with gallery wall around it. Used for seeded pages and sample shots.
export function sampleShotSvg(a: Artwork, r = 0): string {
  return `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="125" fill="#D3CBBB"/><rect y="104" width="100" height="21" fill="#B3AA99"/><g transform="translate(14 20) rotate(${r} 36 36) scale(.72)"><rect x="-4" y="-4" width="108" height="108" fill="#3A2E22"/>${shapes(a)}</g><rect width="100" height="125" fill="#000" opacity=".06"/><rect width="34" height="125" fill="#fff" opacity=".07"/></svg>`;
}

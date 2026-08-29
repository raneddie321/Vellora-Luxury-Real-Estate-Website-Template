/* Tiny SVG drawing helpers shared by every scene composer. */

export const f = (n) => Number(n.toFixed(2));

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
export function rgbToHex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
/** Linear blend between two hex colours. t=0 → a, t=1 → b. */
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([
    A[0] + (B[0] - A[0]) * t,
    A[1] + (B[1] - A[1]) * t,
    A[2] + (B[2] - A[2]) * t,
  ]);
}
export function shade(hex, amount) {
  return amount < 0 ? mix(hex, "#000000", -amount) : mix(hex, "#ffffff", amount);
}

export const rect = (x, y, w, h, fill, extra = "") =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}" fill="${fill}"${extra ? " " + extra : ""}/>`;

export const circle = (cx, cy, r, fill, extra = "") =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}"${extra ? " " + extra : ""}/>`;

export const ellipse = (cx, cy, rx, ry, fill, extra = "") =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${extra ? " " + extra : ""}/>`;

export const poly = (points, fill, extra = "") =>
  `<polygon points="${points.map(([x, y]) => `${f(x)},${f(y)}`).join(" ")}" fill="${fill}"${extra ? " " + extra : ""}/>`;

export const line = (x1, y1, x2, y2, stroke, w = 1, extra = "") =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${f(w)}"${extra ? " " + extra : ""}/>`;

export const path = (d, fill, extra = "") =>
  `<path d="${d}" fill="${fill}"${extra ? " " + extra : ""}/>`;

/** A vertical linear gradient definition. */
export function vGrad(id, stops) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</linearGradient>`;
}
export function hGrad(id, stops) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</linearGradient>`;
}
export function rGrad(id, stops, cx = "50%", cy = "50%", r = "70%") {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</radialGradient>`;
}

/**
 * Film grain as a small repeating pattern rather than a full-canvas filter —
 * the browser rasterises 120×120 once instead of the whole plate.
 */
export function grainPattern(id, opacity = 0.5, freq = 0.85) {
  return `<filter id="${id}-f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
<pattern id="${id}" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" filter="url(#${id}-f)" opacity="${opacity}"/></pattern>`;
}

export function blurFilter(id, amount) {
  return `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="${amount}"/></filter>`;
}

/** Wraps a composed scene in the standard Vellora plate chrome. */
export function plate({ w, h, defs = "", body, grainOpacity = 0.5, vignette = 0.34 }) {
  // The grain sits in `overlay`, so mid-grey noise is a no-op and only the
  // deviation shows. That gives texture without the grey fog a plain
  // semi-transparent noise layer would leave behind.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<defs>${defs}${grainPattern("vg", 1, 0.9)}${rGrad("vig", [["52%", "#000000", 0], ["100%", "#0A0806", vignette]], "50%", "42%", "80%")}</defs>
${body}
${rect(0, 0, w, h, "url(#vig)")}
${rect(0, 0, w, h, "url(#vg)", `opacity="${grainOpacity}" style="mix-blend-mode:overlay"`)}
</svg>`;
}

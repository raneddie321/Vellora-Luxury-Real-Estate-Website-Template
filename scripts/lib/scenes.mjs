import { PALETTES, INTERIOR_PALETTES, PALETTE_KEYS, INTERIOR_KEYS } from "./palettes.mjs";
import {
  rect, circle, ellipse, poly, line, path, vGrad, hGrad, rGrad,
  blurFilter, mix, shade, f, hexToRgb,
} from "./draw.mjs";

/* ========================================================================== */
/*  Shared furniture                                                          */
/* ========================================================================== */

function sky(w, h, p) {
  const glow = mix(p.lit, "#FFE7BC", 0.55);
  return (
    vGrad("sky", [["0%", p.skyTop], ["46%", p.skyMid], ["100%", p.skyLow]]) +
    rGrad("sun", [["0%", glow, 0.55], ["38%", glow, 0.16], ["100%", glow, 0]], "50%", "50%", "50%")
  );
}

/** Vertical unit that stays sane whether the plate is 3:2 or 2:1 cinematic. */
const unit = (w, h) => Math.min(h, w * 0.66);

function palm(x, baseY, scale, color, rng) {
  const t = 90 * scale;
  let s = `<path d="M${f(x)},${f(baseY)} q${f(4 * scale)},${f(-t * 0.55)} ${f(-2 * scale)},${f(-t)}" stroke="${color}" stroke-width="${f(3.4 * scale)}" fill="none" stroke-linecap="round"/>`;
  const top = baseY - t;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i / 6) * Math.PI;
    const len = (30 + rng.range(-6, 12)) * scale;
    const cx = x - 2 * scale + Math.cos(a) * len;
    const cy = top + Math.sin(a) * len * 0.66 + 6 * scale;
    s += `<path d="M${f(x - 2 * scale)},${f(top)} Q${f((x + cx) / 2)},${f(top - 14 * scale)} ${f(cx)},${f(cy)}" stroke="${color}" stroke-width="${f(2.6 * scale)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

function cypress(x, baseY, hgt, color) {
  return path(
    `M${f(x)},${f(baseY)} C${f(x - hgt * 0.14)},${f(baseY - hgt * 0.4)} ${f(x - hgt * 0.1)},${f(baseY - hgt * 0.82)} ${f(x)},${f(baseY - hgt)} C${f(x + hgt * 0.1)},${f(baseY - hgt * 0.82)} ${f(x + hgt * 0.14)},${f(baseY - hgt * 0.4)} ${f(x)},${f(baseY)} Z`,
    color,
  );
}

function bushRow(x1, x2, baseY, color, rng, n = 6) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = x1 + ((x2 - x1) * i) / (n - 1) + rng.range(-10, 10);
    const r = rng.range(14, 30);
    s += ellipse(x, baseY, r, r * 0.72, color);
  }
  return s;
}

/* ========================================================================== */
/*  Exterior scenes                                                           */
/* ========================================================================== */

export function coastal(rng, w, h) {
  const p = PALETTES[rng.pick(["dusk", "dawn", "noon", "ember", "linen", "ash"])];
  const horizon = h * rng.range(0.44, 0.54);
  const defs =
    sky(w, h, p) +
    vGrad("sea", [["0%", shade(p.water, 0.16)], ["100%", shade(p.water, -0.22)]]) +
    blurFilter("soft", 14);

  const u = unit(w, h);
  let b = rect(0, 0, w, h, "url(#sky)");
  b += circle(w * 0.72, horizon - u * 0.16, u * 0.16, "url(#sun)");

  // Distant headland, hazed back into the sky.
  const hz = mix(p.haze, p.skyLow, 0.42);
  b += path(
    `M0,${f(horizon)} L0,${f(horizon - h * 0.09)} Q${f(w * 0.12)},${f(horizon - h * 0.15)} ${f(w * 0.26)},${f(horizon - h * 0.06)} T${f(w * 0.44)},${f(horizon)} Z`,
    hz,
    'opacity="0.75"',
  );
  b += rect(0, horizon, w, h - horizon, "url(#sea)");
  for (let i = 0; i < 22; i++) {
    const y = horizon + Math.pow(i / 22, 1.9) * (h - horizon);
    b += rect(rng.range(0, w * 0.5), y, rng.range(w * 0.18, w * 0.6), rng.range(1, 3), shade(p.lit, 0), `opacity="${f(rng.range(0.04, 0.13))}"`);
  }

  // A headland the residence can actually sit on — floating terraces read as
  // collage, not architecture.
  const baseX = w * rng.range(0.46, 0.58);
  const terraces = rng.int(3, 4);
  const headlandTop = horizon - u * 0.055;
  b += path(
    `M${f(baseX - w * 0.14)},${f(h)} C${f(baseX - w * 0.06)},${f(horizon + h * 0.06)} ${f(baseX - w * 0.02)},${f(headlandTop + u * 0.04)} ${f(baseX + w * 0.06)},${f(headlandTop)} L${f(w)},${f(headlandTop - u * 0.02)} L${f(w)},${f(h)} Z`,
    mix(p.ground, p.land, 0.32),
  );
  b += path(
    `M${f(baseX - w * 0.14)},${f(h)} C${f(baseX - w * 0.06)},${f(horizon + h * 0.06)} ${f(baseX - w * 0.02)},${f(headlandTop + u * 0.04)} ${f(baseX + w * 0.06)},${f(headlandTop)} L${f(baseX + w * 0.1)},${f(headlandTop + 6)} C${f(baseX + w * 0.02)},${f(headlandTop + u * 0.06)} ${f(baseX - w * 0.02)},${f(horizon + h * 0.08)} ${f(baseX - w * 0.09)},${f(h)} Z`,
    shade(mix(p.ground, p.land, 0.32), 0.14),
    'opacity="0.7"',
  );
  for (let i = 0; i < terraces; i++) {
    const tw = u * rng.range(0.2, 0.3);
    const th = u * rng.range(0.085, 0.12);
    const x = baseX + w * 0.03 + i * tw * rng.range(0.5, 0.72);
    const y = headlandTop + u * 0.01 - i * th * rng.range(0.72, 0.95);
    const face = mix(p.lit, p.haze, 0.1 + i * 0.06);
    b += rect(x, y - th, tw, th, face);
    b += rect(x, y - th, tw, 3, shade(face, 0.28));
    b += rect(x, y - th * 0.62, tw * 0.86, th * 0.3, p.glass, 'opacity="0.82"');
    for (let m = 1; m < 5; m++) {
      b += rect(x + (tw * 0.86 * m) / 5, y - th * 0.62, 2, th * 0.3, face, 'opacity="0.7"');
    }
    b += rect(x, y, tw * 1.02, 4, shade(face, -0.3), 'opacity="0.35"');
  }

  // Foreground deck, pool and planting.
  const deckY = h * rng.range(0.78, 0.86);
  b += rect(0, deckY, w, h - deckY, mix(p.lit, p.ground, 0.42));
  b += rect(0, deckY, w, 2, shade(p.lit, 0.2), 'opacity="0.5"');
  const poolX = w * rng.range(0.04, 0.14);
  const poolW = w * rng.range(0.34, 0.46);
  b += rect(poolX, deckY + h * 0.035, poolW, h * 0.1, shade(p.water, -0.05));
  b += rect(poolX, deckY + h * 0.035, poolW, 3, shade(p.lit, 0.1), 'opacity="0.35"');
  for (let i = 0; i < 5; i++) {
    b += rect(poolX + rng.range(0, poolW * 0.6), deckY + h * 0.05 + i * h * 0.016, poolW * rng.range(0.16, 0.4), 2, "#ffffff", `opacity="${f(rng.range(0.06, 0.16))}"`);
  }
  const dark = shade(p.land, -0.1);
  b += palm(w * rng.range(0.06, 0.12), deckY + h * 0.02, rng.range(1.5, 2.2), dark, rng);
  if (rng.chance(0.6)) b += palm(w * rng.range(0.86, 0.94), deckY + h * 0.05, rng.range(1.8, 2.6), dark, rng);
  b += bushRow(w * 0.55, w * 0.99, deckY + h * 0.03, mix(p.land, p.ground, 0.35), rng, 7);
  b += rect(0, h - h * 0.06, w, h * 0.06, p.ground, 'opacity="0.55"');
  return { defs, body: b, palette: p };
}

export function villa(rng, w, h) {
  const p = PALETTES[rng.pick(["dusk", "dawn", "noon", "olive", "linen", "ash", "ember"])];
  const horizon = h * rng.range(0.6, 0.68);
  const defs = sky(w, h, p) + vGrad("gnd", [["0%", mix(p.ground, p.lit, 0.28)], ["100%", shade(p.ground, -0.25)]]);

  let b = rect(0, 0, w, h, "url(#sky)");
  b += circle(w * rng.range(0.14, 0.34), h * 0.22, unit(w, h) * 0.17, "url(#sun)");
  b += rect(0, horizon, w, h - horizon, "url(#gnd)");

  const face = mix(p.lit, "#ffffff", 0.12);
  const shadeFace = shade(face, -0.16);
  const u = unit(w, h);
  const bw = u * rng.range(0.82, 1.05);
  const bx = w * rng.range(0.12, 0.24) * (w > h * 1.8 ? 1.4 : 1);
  const levels = rng.int(2, 3);
  const lh = u * rng.range(0.13, 0.17);
  for (let i = 0; i < levels; i++) {
    const y = horizon - (i + 1) * lh;
    // Each floor cantilevers past the one below — the modernist signature.
    const off = i === levels - 1 ? -u * rng.range(0.03, 0.09) : u * rng.range(0.0, 0.07);
    const x = bx + off;
    const ww = bw - off * (i % 2 === 0 ? 1.2 : 0.4);
    b += rect(x, y, ww, lh, i % 2 === 0 ? face : shadeFace);
    b += rect(x, y, ww, 5, shade(face, 0.3));
    b += rect(x, y + lh - 6, ww, 6, shade(face, -0.34), 'opacity="0.5"');
    const gw = ww * rng.range(0.5, 0.82);
    const gx = x + (i % 2 ? ww - gw - ww * 0.06 : ww * 0.06);
    b += rect(gx, y + lh * 0.2, gw, lh * 0.58, p.glass, 'opacity="0.88"');
    b += rect(gx, y + lh * 0.2, gw, lh * 0.58, shade(p.lit, 0), 'opacity="0.07"');
    const mull = rng.int(3, 6);
    for (let m = 1; m < mull; m++) {
      b += rect(gx + (gw * m) / mull, y + lh * 0.2, 2.5, lh * 0.58, face, 'opacity="0.85"');
    }
  }
  // Long raking shadow.
  b += poly(
    [[bx, horizon], [bx + bw, horizon], [bx + bw + u * 0.24, horizon + (h - horizon) * 0.3], [bx - u * 0.08, horizon + (h - horizon) * 0.3]],
    shade(p.ground, -0.45),
    'opacity="0.28"',
  );
  const treeC = mix(p.land, p.ground, 0.22);
  b += cypress(w * rng.range(0.05, 0.12), horizon + h * 0.02, u * rng.range(0.32, 0.46), treeC);
  b += cypress(w * rng.range(0.86, 0.95), horizon + h * 0.04, u * rng.range(0.26, 0.4), treeC);
  if (rng.chance(0.6)) b += cypress(w * 0.8, horizon + h * 0.01, u * 0.26, mix(treeC, p.haze, 0.3));
  if (w > h * 1.7) b += cypress(w * 0.68, horizon + h * 0.02, u * 0.3, mix(treeC, p.haze, 0.14));

  const poolY = horizon + h * rng.range(0.1, 0.16);
  const px = w * rng.range(0.12, 0.2);
  const pw = w * rng.range(0.5, 0.66);
  b += rect(px, poolY, pw, h - poolY - h * 0.04, shade(p.water, -0.08));
  b += rect(px, poolY, pw, 3, shade(p.lit, 0.2), 'opacity="0.4"');
  // Reflection of the house, mirrored and faint.
  b += rect(px + pw * 0.1, poolY + 8, pw * 0.62, (h - poolY) * 0.4, face, 'opacity="0.12"');
  for (let i = 0; i < 6; i++) {
    b += rect(px + rng.range(0, pw * 0.6), poolY + h * 0.02 + i * h * 0.018, pw * rng.range(0.12, 0.36), 2, "#ffffff", `opacity="${f(rng.range(0.05, 0.14))}"`);
  }
  b += bushRow(0, w, horizon + h * 0.015, mix(p.land, p.ground, 0.4), rng, 9);
  return { defs, body: b, palette: p };
}

export function tower(rng, w, h) {
  const p = PALETTES[rng.pick(["dusk", "night", "ember", "ash", "dawn"])];
  const horizon = h * rng.range(0.82, 0.9);
  const defs = sky(w, h, p);
  let b = rect(0, 0, w, h, "url(#sky)");
  b += circle(w * rng.range(0.58, 0.86), h * rng.range(0.46, 0.64), unit(w, h) * 0.22, "url(#sun)");

  const n = rng.int(5, 8);
  const towers = [];
  for (let i = 0; i < n; i++) {
    towers.push({
      x: (w / n) * i + rng.range(-w * 0.03, w * 0.03),
      wdt: (w / n) * rng.range(0.55, 1.05),
      hgt: unit(w, h) * rng.range(0.34, 0.86),
      depth: rng.range(0, 1),
    });
  }
  towers.sort((a, c) => c.depth - a.depth);
  for (const t of towers) {
    const body = mix(p.land, p.skyMid, t.depth * 0.55);
    const y = horizon - t.hgt;
    b += rect(t.x, y, t.wdt, t.hgt, body);
    b += rect(t.x, y, t.wdt * 0.22, t.hgt, shade(body, 0.1), 'opacity="0.6"');
    b += rect(t.x, y, t.wdt, 4, shade(body, 0.24), 'opacity="0.7"');
    // Floor bands read as fenestration at a fraction of the geometry cost.
    const rows = Math.max(4, Math.min(22, Math.round(t.hgt / 44)));
    const cols = Math.max(2, Math.min(7, Math.round(t.wdt / 42)));
    const glass = shade(p.glass, t.depth * 0.35);
    const bandH = (t.hgt - 18) / rows;
    for (let r = 0; r < rows; r++) {
      b += rect(t.x + t.wdt * 0.08, y + 12 + r * bandH, t.wdt * 0.84, bandH * 0.62, glass, 'opacity="0.85"');
    }
    for (let c = 1; c < cols; c++) {
      b += rect(t.x + (t.wdt * 0.84 * c) / cols + t.wdt * 0.08, y + 12, 2.4, t.hgt - 18, body, 'opacity="0.75"');
    }
    const litCount = Math.round((1 - t.depth) * 14) + 4;
    for (let i = 0; i < litCount; i++) {
      const c = rng.int(0, cols - 1);
      const r = rng.int(0, rows - 1);
      b += rect(
        t.x + t.wdt * 0.08 + (t.wdt * 0.84 * c) / cols + 3,
        y + 12 + r * bandH,
        (t.wdt * 0.84) / cols - 6,
        bandH * 0.62,
        p.lit,
        `opacity="${f(rng.range(0.4, 0.9))}"`,
      );
    }
  }
  b += rect(0, horizon, w, h - horizon, shade(p.land, -0.25));
  b += rect(0, horizon, w, 2, shade(p.lit, 0), 'opacity="0.1"');
  for (let i = 0; i < 12; i++) {
    const x = rng.range(0, w);
    b += rect(x, horizon - rng.range(h * 0.02, h * 0.06), rng.range(w * 0.03, w * 0.1), h * 0.06, shade(p.land, -0.35));
  }
  return { defs, body: b, palette: p };
}

export function townhouse(rng, w, h) {
  const p = PALETTES[rng.pick(["noon", "dawn", "linen", "olive", "ash", "ember"])];
  const defs = sky(w, h, p) + vGrad("fac", [["0%", "#ffffff", 0.14], ["100%", "#000000", 0.1]]);
  const facadeTop = h * rng.range(0.1, 0.17);
  const groundY = h * rng.range(0.88, 0.93);
  const face = mix(p.lit, p.haze, rng.range(0.05, 0.3));

  let b = rect(0, 0, w, h, "url(#sky)");
  b += rect(0, facadeTop, w, groundY - facadeTop, face);
  b += rect(0, facadeTop, w, h * 0.03, shade(face, 0.18));
  b += rect(0, facadeTop + h * 0.03, w, 3, shade(face, -0.3), 'opacity="0.35"');

  const bays = rng.int(4, 6);
  const bw = w / bays;
  const floors = rng.int(3, 4);
  const arched = rng.chance(0.55);
  const fh = (groundY - facadeTop - h * 0.06) / floors;
  for (let fl = 0; fl < floors; fl++) {
    const y = facadeTop + h * 0.05 + fl * fh;
    b += rect(0, y - 4, w, 2, shade(face, -0.22), 'opacity="0.35"');
    for (let i = 0; i < bays; i++) {
      const cx = bw * i + bw / 2;
      const ww = bw * rng.range(0.3, 0.4);
      const wh = fh * rng.range(0.5, 0.62);
      const wy = y + fh * 0.16;
      const wx = cx - ww / 2;
      if (arched && fl === 0) {
        b += path(
          `M${f(wx)},${f(wy + wh)} L${f(wx)},${f(wy + ww / 2)} A${f(ww / 2)},${f(ww / 2)} 0 0 1 ${f(wx + ww)},${f(wy + ww / 2)} L${f(wx + ww)},${f(wy + wh)} Z`,
          p.glass,
        );
      } else {
        b += rect(wx, wy, ww, wh, p.glass);
      }
      b += rect(wx, wy, ww, wh, "#ffffff", 'opacity="0.06"');
      b += rect(wx - 3, wy - 3, ww + 6, 4, shade(face, 0.24));
      b += rect(wx + ww / 2 - 1.2, wy, 2.4, wh, face, 'opacity="0.8"');
      b += rect(wx, wy + wh * 0.46, ww, 2.4, face, 'opacity="0.8"');
      if (fl === 1 && rng.chance(0.7)) {
        b += rect(wx - ww * 0.16, wy + wh, ww * 1.32, 5, shade(face, -0.18));
        for (let s = 0; s < 9; s++) {
          b += rect(wx - ww * 0.14 + (ww * 1.28 * s) / 9, wy + wh + 5, 2, fh * 0.16, shade(face, -0.32), 'opacity="0.7"');
        }
      }
      if (rng.chance(0.35)) {
        const sc = shade(rng.chance(0.5) ? p.accent : p.land, -0.1);
        b += rect(wx - ww * 0.12, wy, ww * 0.11, wh, sc, 'opacity="0.75"');
        b += rect(wx + ww * 1.01, wy, ww * 0.11, wh, sc, 'opacity="0.75"');
      }
    }
  }
  // Shopfront / entrance level.
  b += rect(0, groundY - h * 0.14, w, h * 0.14, shade(face, -0.12));
  for (let i = 0; i < bays; i++) {
    const cx = bw * i + bw / 2;
    if (i === Math.floor(bays / 2)) {
      const dw = bw * 0.3;
      b += rect(cx - dw / 2, groundY - h * 0.125, dw, h * 0.125, shade(p.land, 0.05));
      b += path(`M${f(cx - dw / 2)},${f(groundY - h * 0.125)} A${f(dw / 2)},${f(dw / 2)} 0 0 1 ${f(cx + dw / 2)},${f(groundY - h * 0.125)} Z`, p.glass);
      b += rect(cx - dw / 2 - 6, groundY - h * 0.135, dw + 12, 6, shade(face, 0.2));
    } else {
      b += rect(cx - bw * 0.22, groundY - h * 0.11, bw * 0.44, h * 0.09, p.glass, 'opacity="0.9"');
    }
  }
  b += rect(0, groundY, w, h - groundY, shade(p.ground, -0.18));
  b += rect(0, groundY, w, 3, shade(p.lit, 0), 'opacity="0.12"');
  b += rect(0, facadeTop, w, groundY - facadeTop, "url(#fac)");
  return { defs, body: b, palette: p };
}

export function estate(rng, w, h) {
  const p = PALETTES[rng.pick(["noon", "dawn", "olive", "linen", "ash"])];
  const horizon = h * rng.range(0.62, 0.7);
  const defs = sky(w, h, p) + vGrad("lawn", [["0%", mix(p.ground, "#7E8A66", 0.5)], ["100%", shade(mix(p.ground, "#5E6A4A", 0.5), -0.2)]]);
  const face = mix(p.lit, p.haze, 0.12);
  let b = rect(0, 0, w, h, "url(#sky)");
  b += circle(w * rng.range(0.36, 0.64), h * 0.2, unit(w, h) * 0.18, "url(#sun)");
  b += rect(0, horizon, w, h - horizon, "url(#lawn)");

  const u = unit(w, h);
  const cw = u * rng.range(0.46, 0.56);
  const cx = w / 2 - cw / 2;
  const bh = u * rng.range(0.32, 0.4);
  const top = horizon - bh;
  // Wings
  for (const side of [-1, 1]) {
    const ww = cw * rng.range(0.5, 0.66);
    const wx = side < 0 ? cx - ww : cx + cw;
    b += rect(wx, top + bh * 0.18, ww, bh * 0.82, shade(face, -0.06));
    b += poly([[wx - 8, top + bh * 0.18], [wx + ww + 8, top + bh * 0.18], [wx + ww, top + bh * 0.08], [wx, top + bh * 0.08]], shade(face, -0.24));
    for (let i = 0; i < 4; i++) {
      b += rect(wx + ww * (0.1 + i * 0.22), top + bh * 0.34, ww * 0.13, bh * 0.28, p.glass);
      b += rect(wx + ww * (0.1 + i * 0.22), top + bh * 0.72, ww * 0.13, bh * 0.2, p.glass, 'opacity="0.85"');
    }
  }
  b += rect(cx, top, cw, bh, face);
  b += poly([[cx - 14, top], [cx + cw + 14, top], [cx + cw - 10, top - bh * 0.14], [cx + 10, top - bh * 0.14]], shade(face, -0.2));
  b += rect(cx, top, cw, 7, shade(face, 0.26));
  // Portico
  const pcw = cw * 0.44;
  const pcx = cx + cw / 2 - pcw / 2;
  b += poly([[pcx - 12, top + bh * 0.16], [pcx + pcw + 12, top + bh * 0.16], [pcx + pcw / 2, top - bh * 0.06]], shade(face, 0.14));
  const colN = rng.int(4, 6);
  for (let i = 0; i < colN; i++) {
    const colX = pcx + (pcw - 16) * (i / (colN - 1)) + 4;
    b += rect(colX, top + bh * 0.18, 13, bh * 0.82, shade(face, 0.1));
    b += rect(colX - 3, top + bh * 0.16, 19, 6, shade(face, 0.2));
    b += rect(colX - 3, horizon - 6, 19, 6, shade(face, -0.1));
  }
  for (let i = 0; i < 5; i++) {
    if (i === 2) continue;
    b += rect(cx + cw * (0.07 + i * 0.185), top + bh * 0.28, cw * 0.09, bh * 0.24, p.glass);
    b += rect(cx + cw * (0.07 + i * 0.185), top + bh * 0.62, cw * 0.09, bh * 0.26, p.glass, 'opacity="0.9"');
  }
  b += poly([[cx, horizon], [cx + cw, horizon], [cx + cw + w * 0.1, horizon + h * 0.06], [cx - w * 0.1, horizon + h * 0.06]], "#000000", 'opacity="0.16"');
  // Formal approach
  b += poly([[w / 2 - w * 0.045, horizon], [w / 2 + w * 0.045, horizon], [w / 2 + w * 0.2, h], [w / 2 - w * 0.2, h]], mix(p.ground, p.lit, 0.5), 'opacity="0.75"');
  const treeC = "#3E4A34";
  for (const x of [w * 0.06, w * 0.14, w * 0.22, w * 0.78, w * 0.86, w * 0.94]) {
    b += cypress(x, horizon + h * 0.03, u * rng.range(0.3, 0.44), treeC);
  }
  b += bushRow(w * 0.28, w * 0.72, horizon + h * 0.02, "#4A553C", rng, 8);
  return { defs, body: b, palette: p };
}

export function aerial(rng, w, h) {
  const p = PALETTES[rng.pick(["noon", "linen", "olive", "ash", "dawn"])];
  const defs = vGrad("gr", [["0%", mix(p.ground, p.lit, 0.32)], ["100%", shade(p.ground, -0.15)]]);
  let b = rect(0, 0, w, h, "url(#gr)");
  const rot = rng.range(-9, 9);
  b += `<g transform="rotate(${f(rot)} ${f(w / 2)} ${f(h / 2)})">`;
  b += rect(-w * 0.2, -h * 0.2, w * 1.4, h * 1.4, mix(p.ground, "#7E8564", 0.4));
  const cols = rng.int(4, 6);
  const rows = rng.int(3, 4);
  const cw = (w * 1.3) / cols;
  const ch = (h * 1.3) / rows;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = -w * 0.15 + c * cw + rng.range(6, 20);
      const y = -h * 0.15 + r * ch + rng.range(6, 20);
      const bw = cw * rng.range(0.5, 0.82);
      const bh = ch * rng.range(0.42, 0.75);
      b += rect(x + 10, y + 12, bw, bh, "#000000", 'opacity="0.2"');
      const roof = mix(mix(p.lit, p.haze, rng.range(0.3, 0.75)), "#C6A98A", rng.range(0, 0.5));
      b += rect(x, y, bw, bh, roof);
      b += rect(x, y, bw, bh * 0.18, shade(roof, -0.16), 'opacity="0.6"');
      for (let l = 1; l < 3; l++) {
        b += rect(x, y + (bh * l) / 3, bw, 1.6, shade(roof, -0.3), 'opacity="0.35"');
      }
      if (rng.chance(0.55)) b += rect(x + bw * 0.15, y + bh * 0.28, bw * 0.42, bh * 0.3, shade(p.water, -0.02));
      for (let t = 0; t < rng.int(2, 5); t++) {
        b += circle(x + rng.range(-14, bw + 14), y + bh + rng.range(4, ch * 0.22), rng.range(7, 15), "#48543C", 'opacity="0.85"');
      }
    }
  }
  for (let c = 1; c < cols; c++) {
    b += rect(-w * 0.15 + c * cw - 14, -h * 0.2, 18, h * 1.4, mix(p.ground, p.land, 0.35), 'opacity="0.7"');
  }
  for (let r = 1; r < rows; r++) {
    b += rect(-w * 0.2, -h * 0.15 + r * ch - 12, w * 1.4, 16, mix(p.ground, p.land, 0.35), 'opacity="0.7"');
  }
  b += "</g>";
  return { defs, body: b, palette: p };
}

export function plan(rng, w, h) {
  const ink = "#1F1D1B";
  const light = "#F6F3ED";
  const wall = "#2A2724";
  const soft = "#B9B0A2";
  const defs = "";
  let b = rect(0, 0, w, h, light);

  const m = Math.min(w, h) * 0.09;
  const X = m;
  const Y = m;
  const W = w - m * 2;
  const H = h - m * 2;
  const t = Math.max(7, Math.min(w, h) * 0.011);

  const wallRect = (x, y, ww, hh) =>
    rect(x, y, ww, t, wall) + rect(x, y + hh - t, ww, t, wall) + rect(x, y, t, hh, wall) + rect(x + ww - t, y, t, hh, wall);

  b += rect(X, Y, W, H, "#EFEAE0");
  b += wallRect(X, Y, W, H);

  // Two vertical splits and one horizontal split → 5–6 rooms.
  const v1 = X + W * rng.range(0.36, 0.46);
  const v2 = X + W * rng.range(0.66, 0.76);
  const hz = Y + H * rng.range(0.48, 0.58);
  b += rect(v1, Y, t * 0.7, H, wall);
  b += rect(v2, hz, t * 0.7, H - (hz - Y), wall);
  b += rect(v1, hz, W - (v1 - X) - t, t * 0.7, wall);

  // Doorways punched out of the partitions, with swing arcs.
  const doors = [
    { x: v1, y: Y + H * 0.24, vertical: true },
    { x: v1, y: hz + H * 0.18, vertical: true },
    { x: v2, y: hz + H * 0.3, vertical: true },
    { x: X + W * 0.2, y: hz, vertical: false },
  ];
  const dw = Math.min(W, H) * 0.11;
  for (const d of doors) {
    if (d.vertical) {
      b += rect(d.x - 1, d.y, t * 0.7 + 2, dw, "#EFEAE0");
      b += `<path d="M${f(d.x + t)},${f(d.y)} A${f(dw)},${f(dw)} 0 0 1 ${f(d.x + t + dw)},${f(d.y + dw)}" fill="none" stroke="${soft}" stroke-width="1.6"/>`;
      b += line(d.x + t, d.y, d.x + t, d.y + dw, ink, 2.4);
    } else {
      b += rect(d.x, d.y - 1, dw, t * 0.7 + 2, "#EFEAE0");
      b += `<path d="M${f(d.x)},${f(d.y + t)} A${f(dw)},${f(dw)} 0 0 1 ${f(d.x + dw)},${f(d.y + t + dw)}" fill="none" stroke="${soft}" stroke-width="1.6"/>`;
      b += line(d.x, d.y + t, d.x + dw, d.y + t, ink, 2.4);
    }
  }

  // Windows: gaps in the outer wall drawn as thin double lines.
  const winSpots = [
    [X + W * 0.1, Y, W * 0.16, true], [X + W * 0.55, Y, W * 0.2, true],
    [X + W * 0.22, Y + H - t, W * 0.18, true], [X + W * 0.66, Y + H - t, W * 0.16, true],
    [X, Y + H * 0.22, H * 0.2, false], [X + W - t, Y + H * 0.6, H * 0.22, false],
  ];
  for (const [x, y, len, horiz] of winSpots) {
    if (horiz) {
      b += rect(x, y, len, t, light);
      b += rect(x, y + t * 0.34, len, 1.6, ink);
      b += rect(x, y, len, 1.2, ink);
      b += rect(x, y + t - 1.2, len, 1.2, ink);
    } else {
      b += rect(x, y, t, len, light);
      b += rect(x + t * 0.34, y, 1.6, len, ink);
      b += rect(x, y, 1.2, len, ink);
      b += rect(x + t - 1.2, y, 1.2, len, ink);
    }
  }

  // Fixtures.
  const fx = (x, y, ww, hh, r = 0) =>
    `<rect x="${f(x)}" y="${f(y)}" width="${f(ww)}" height="${f(hh)}" rx="${r}" fill="none" stroke="${soft}" stroke-width="2"/>`;
  // Living: sofa + rug
  b += fx(X + W * 0.06, Y + H * 0.1, W * 0.22, H * 0.1, 4);
  b += fx(X + W * 0.09, Y + H * 0.26, W * 0.16, H * 0.14, 4);
  // Dining: table + chairs
  const dcx = X + W * 0.2;
  const dcy = hz + (H - (hz - Y)) * 0.42;
  b += `<ellipse cx="${f(dcx)}" cy="${f(dcy)}" rx="${f(W * 0.09)}" ry="${f(H * 0.09)}" fill="none" stroke="${soft}" stroke-width="2"/>`;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b += `<circle cx="${f(dcx + Math.cos(a) * W * 0.125)}" cy="${f(dcy + Math.sin(a) * H * 0.125)}" r="${f(Math.min(W, H) * 0.022)}" fill="none" stroke="${soft}" stroke-width="1.8"/>`;
  }
  // Bed
  b += fx(v1 + W * 0.05, Y + H * 0.12, W * 0.19, H * 0.24, 3);
  b += fx(v1 + W * 0.05, Y + H * 0.12, W * 0.19, H * 0.06, 3);
  // Bath
  b += fx(v2 + W * 0.04, Y + H * 0.06, W * 0.14, H * 0.08, 6);
  b += `<circle cx="${f(v2 + W * 0.11)}" cy="${f(Y + H * 0.2)}" r="${f(Math.min(W, H) * 0.026)}" fill="none" stroke="${soft}" stroke-width="1.8"/>`;
  // Kitchen run
  b += fx(v2 + W * 0.03, hz + H * 0.06, W * 0.18, H * 0.06);
  b += `<circle cx="${f(v2 + W * 0.07)}" cy="${f(hz + H * 0.09)}" r="${f(Math.min(W, H) * 0.02)}" fill="none" stroke="${soft}" stroke-width="1.8"/>`;
  // Stair
  b += fx(v1 + W * 0.04, hz + H * 0.06, W * 0.1, H * 0.2);
  for (let i = 1; i < 8; i++) {
    b += line(v1 + W * 0.04, hz + H * 0.06 + (H * 0.2 * i) / 8, v1 + W * 0.14, hz + H * 0.06 + (H * 0.2 * i) / 8, soft, 1.4);
  }

  const label = (x, y, name, area) =>
    `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(Math.min(w, h) * 0.026)}" letter-spacing="2.6" fill="${ink}" opacity="0.82">${name}</text>` +
    `<text x="${f(x)}" y="${f(y + Math.min(w, h) * 0.042)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(Math.min(w, h) * 0.022)}" letter-spacing="1.4" fill="${ink}" opacity="0.45">${area}</text>`;

  b += label(X + W * 0.07, Y + H * 0.06, "RECEPTION", `${rng.int(38, 62)} m²`);
  b += label(v1 + W * 0.05, Y + H * 0.08, "PRINCIPAL", `${rng.int(24, 38)} m²`);
  b += label(v2 + W * 0.03, Y + H * 0.03, "BATH", `${rng.int(9, 16)} m²`);
  b += label(X + W * 0.06, hz + H * 0.08, "DINING", `${rng.int(22, 34)} m²`);
  b += label(v2 + W * 0.03, hz + H * 0.19, "KITCHEN", `${rng.int(16, 26)} m²`);

  // North point + scale bar.
  const nx = X + W - Math.min(w, h) * 0.09;
  const ny = Y + H - Math.min(w, h) * 0.1;
  b += `<circle cx="${f(nx)}" cy="${f(ny)}" r="${f(Math.min(w, h) * 0.045)}" fill="none" stroke="${soft}" stroke-width="1.4"/>`;
  b += poly([[nx, ny - Math.min(w, h) * 0.038], [nx - 7, ny + 8], [nx + 7, ny + 8]], ink);
  b += `<text x="${f(nx - 5)}" y="${f(ny + Math.min(w, h) * 0.072)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(Math.min(w, h) * 0.024)}" fill="${ink}" opacity="0.6">N</text>`;
  b += rect(X, Y + H + Math.min(w, h) * 0.03, W * 0.14, 3, ink, 'opacity="0.55"');
  return { defs, body: b, grainOpacity: 0.06, vignette: 0.16, palette: { accent: "#B08E55" } };
}

/* ========================================================================== */
/*  Stylised map                                                              */
/* ========================================================================== */

export function map(rng, w, h) {
  const ground = "#EDE8DE";
  const block = "#DED7C9";
  const road = "#FBF8F2";
  const water = "#BFCCC9";
  const park = "#CBD3BC";
  const ink = "#1F1D1B";
  let b = rect(0, 0, w, h, ground);

  b += path(
    `M${f(w * 0.62)},0 C${f(w * 0.7)},${f(h * 0.24)} ${f(w * 0.52)},${f(h * 0.5)} ${f(w * 0.68)},${f(h * 0.74)} C${f(w * 0.78)},${f(h * 0.9)} ${f(w * 0.86)},${f(h * 0.96)} ${f(w)},${f(h)} L${f(w)},0 Z`,
    water,
  );
  b += ellipse(w * 0.2, h * 0.7, w * 0.13, h * 0.16, park);

  const rot = rng.range(-16, 16);
  b += `<g transform="rotate(${f(rot)} ${f(w / 2)} ${f(h / 2)})" opacity="0.95">`;
  const cols = rng.int(6, 9);
  const rows = rng.int(5, 7);
  const cw = (w * 1.5) / cols;
  const ch = (h * 1.5) / rows;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = -w * 0.25 + c * cw;
      const y = -h * 0.25 + r * ch;
      b += rect(x + 10, y + 10, cw - 26, ch - 26, block, `opacity="${f(rng.range(0.6, 1))}"`);
    }
  }
  for (let c = 0; c <= cols; c++) b += rect(-w * 0.25 + c * cw - 8, -h * 0.3, 16, h * 1.6, road);
  for (let r = 0; r <= rows; r++) b += rect(-w * 0.3, -h * 0.25 + r * ch - 7, w * 1.6, 14, road);
  b += `</g>`;

  b += path(
    `M0,${f(h * 0.42)} C${f(w * 0.24)},${f(h * 0.3)} ${f(w * 0.4)},${f(h * 0.56)} ${f(w * 0.66)},${f(h * 0.46)}`,
    "none",
    `stroke="${road}" stroke-width="22" stroke-linecap="round"`,
  );
  b += path(
    `M0,${f(h * 0.42)} C${f(w * 0.24)},${f(h * 0.3)} ${f(w * 0.4)},${f(h * 0.56)} ${f(w * 0.66)},${f(h * 0.46)}`,
    "none",
    `stroke="${ink}" stroke-width="1" opacity="0.14" stroke-dasharray="2 8"`,
  );

  const mx = w * rng.range(0.36, 0.5);
  const my = h * rng.range(0.42, 0.56);
  b += ellipse(mx, my + 26, 22, 7, "#000000", 'opacity="0.18"');
  b += path(
    `M${f(mx)},${f(my + 24)} C${f(mx - 22)},${f(my - 6)} ${f(mx - 17)},${f(my - 40)} ${f(mx)},${f(my - 40)} C${f(mx + 17)},${f(my - 40)} ${f(mx + 22)},${f(my - 6)} ${f(mx)},${f(my + 24)} Z`,
    "#1F1D1B",
  );
  b += circle(mx, my - 22, 7, "#F6F3ED");
  b += rect(w * 0.06, h * 0.9, w * 0.1, 2.5, ink, 'opacity="0.4"');
  return { defs: "", body: b, grainOpacity: 0.05, vignette: 0.18, palette: { accent: "#B08E55" } };
}

/* ========================================================================== */
/*  Editorial abstract — journal covers, CTAs, brand plates                   */
/* ========================================================================== */

export function land(rng, w, h) {
  const p = PALETTES[rng.pick(["dawn", "noon", "olive", "linen", "ember", "ash"])];
  const horizon = h * rng.range(0.44, 0.54);
  const u = unit(w, h);
  const defs = sky(w, h, p);
  let b = rect(0, 0, w, h, "url(#sky)");
  b += circle(w * rng.range(0.2, 0.8), h * 0.26, u * 0.2, "url(#sun)");

  // Distant ridge, then successive fields rolling toward the viewer.
  b += path(
    `M0,${f(horizon)} C${f(w * 0.22)},${f(horizon - u * 0.14)} ${f(w * 0.44)},${f(horizon - u * 0.04)} ${f(w * 0.66)},${f(horizon - u * 0.1)} C${f(w * 0.84)},${f(horizon - u * 0.15)} ${f(w * 0.94)},${f(horizon - u * 0.05)} ${f(w)},${f(horizon - u * 0.08)} L${f(w)},${f(h)} L0,${f(h)} Z`,
    mix(p.haze, p.skyLow, 0.35),
  );
  const bands = rng.int(4, 6);
  for (let i = 0; i < bands; i++) {
    const y = horizon + ((h - horizon) * (i + 0.4)) / bands;
    const c = mix(mix(p.ground, "#8F9468", 0.5), "#4A5238", (i / bands) * 0.75);
    b += path(
      `M0,${f(y + rng.range(-16, 16))} C${f(w * 0.3)},${f(y - rng.range(8, 44))} ${f(w * 0.7)},${f(y + rng.range(8, 44))} ${f(w)},${f(y + rng.range(-16, 16))} L${f(w)},${f(h)} L0,${f(h)} Z`,
      c,
    );
    if (i > 1) {
      for (let d = 0; d < 26; d++) {
        b += circle(rng.range(0, w), y + rng.range(6, (h - horizon) / bands), rng.range(1.5, 3.5), shade(c, 0.28), 'opacity="0.5"');
      }
    }
  }

  // A track running to a small stone outbuilding — gives the plot a story.
  const tx = w * rng.range(0.3, 0.7);
  b += path(
    `M${f(tx - u * 0.02)},${f(horizon - u * 0.02)} C${f(tx - u * 0.1)},${f(horizon + (h - horizon) * 0.4)} ${f(tx + u * 0.16)},${f(horizon + (h - horizon) * 0.6)} ${f(tx - u * 0.1)},${f(h + 10)} L${f(tx + u * 0.22)},${f(h + 10)} C${f(tx + u * 0.4)},${f(horizon + (h - horizon) * 0.55)} ${f(tx + u * 0.06)},${f(horizon + (h - horizon) * 0.3)} ${f(tx + u * 0.03)},${f(horizon - u * 0.02)} Z`,
    mix(p.ground, p.lit, 0.55),
    'opacity="0.8"',
  );
  const sx = tx + u * 0.16;
  const sy = horizon - u * 0.015;
  b += rect(sx, sy - u * 0.075, u * 0.16, u * 0.075, mix(p.lit, p.haze, 0.28));
  b += poly([[sx - 6, sy - u * 0.075], [sx + u * 0.16 + 6, sy - u * 0.075], [sx + u * 0.08, sy - u * 0.125]], shade(p.land, 0.22));
  b += rect(sx + u * 0.06, sy - u * 0.042, u * 0.035, u * 0.042, shade(p.glass, 0.1));

  const treeC = "#3F4A36";
  for (let i = 0; i < rng.int(5, 9); i++) {
    const d = rng.range(0, 1);
    b += cypress(rng.range(w * 0.03, w * 0.97), horizon + (h - horizon) * d * 0.6 + u * 0.02, u * (0.1 + d * 0.24), mix(treeC, p.haze, (1 - d) * 0.45));
  }
  // Dry-stone boundary wall.
  const py = horizon + (h - horizon) * 0.34;
  for (let i = 0; i < 20; i++) {
    const x = (w / 19) * i;
    b += rect(x, py + i * 1.6, w / 24, u * 0.022, shade(mix(p.lit, p.haze, 0.5), -0.08), 'opacity="0.8"');
  }
  return { defs, body: b, palette: p };
}

export function detail(rng, w, h) {
  const p = PALETTES[rng.pick(["dusk", "noon", "linen", "ember", "ash", "olive", "dawn"])];
  const defs =
    hGrad("rake", [["0%", "#FFE9C6", 0.18], ["42%", "#ffffff", 0], ["100%", "#0A0806", 0.34]]) +
    blurFilter("dsoft", 18);
  const face = mix(p.lit, p.haze, rng.range(0.06, 0.28));
  let b = rect(0, 0, w, h, face);
  const mode = rng.int(0, 4);

  if (mode === 0) {
    // Deep vertical fins, each casting onto the glass behind.
    const n = rng.int(7, 12);
    const step = w / n;
    b = rect(0, 0, w, h, shade(p.glass, 0.12));
    for (let i = 0; i < n; i++) {
      const x = step * i;
      b += rect(x + step * 0.62, 0, step * 0.38, h, shade(p.glass, -0.1), 'opacity="0.8"');
      b += rect(x, 0, step * 0.34, h, shade(face, 0.1));
      b += rect(x + step * 0.34, 0, step * 0.1, h, shade(face, -0.34));
    }
    b += rect(0, h * 0.44, w, 5, shade(face, -0.2), 'opacity="0.4"');
  } else if (mode === 1) {
    // Arcade.
    const n = rng.int(3, 5);
    const aw = w / n;
    b = rect(0, 0, w, h, shade(face, -0.04));
    for (let i = 0; i < n; i++) {
      const x = aw * i + aw * 0.12;
      const ww = aw * 0.76;
      b += path(
        `M${f(x)},${f(h)} L${f(x)},${f(h * 0.46)} A${f(ww / 2)},${f(ww / 2)} 0 0 1 ${f(x + ww)},${f(h * 0.46)} L${f(x + ww)},${f(h)} Z`,
        shade(p.land, 0.08),
      );
      b += path(
        `M${f(x + 14)},${f(h)} L${f(x + 14)},${f(h * 0.47)} A${f(ww / 2 - 14)},${f(ww / 2 - 14)} 0 0 1 ${f(x + ww - 14)},${f(h * 0.47)} L${f(x + ww - 14)},${f(h)} Z`,
        shade(p.glass, 0.04),
      );
      b += rect(x + ww * 0.18, h * 0.72, ww * 0.64, h * 0.28, mix(p.lit, "#FFE7BC", 0.4), 'opacity="0.22"');
    }
    b += rect(0, 0, w, h * 0.12, shade(face, 0.16));
    b += rect(0, h * 0.12, w, 5, shade(face, -0.3), 'opacity="0.45"');
  } else if (mode === 2) {
    // Ashlar stone with a raking shadow.
    const rows = rng.int(5, 8);
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * rng.range(50, 110);
      for (let x = -180; x < w + 180; x += 190) {
        const stone = shade(face, rng.range(-0.2, 0.16));
        b += rect(x + off, r * rh, 184, rh - 5, stone);
        // Each block catches light on its top arris and loses it at the joint.
        b += rect(x + off, r * rh, 184, 3, shade(stone, 0.2), 'opacity="0.7"');
        b += rect(x + off, r * rh + rh - 8, 184, 3, shade(stone, -0.35), 'opacity="0.45"');
      }
      b += rect(0, r * rh + rh - 5, w, 5, shade(face, -0.42), 'opacity="0.5"');
    }
    // Foliage shadow raking across the stone.
    b += `<g filter="url(#dsoft)" opacity="0.5">`;
    const ox = rng.range(w * 0.1, w * 0.6);
    const oy = rng.range(-h * 0.1, h * 0.3);
    for (let i = 0; i < 64; i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.pow(rng.range(0, 1), 0.6);
      b += `<ellipse cx="${f(ox + Math.cos(a) * w * 0.32 * d)}" cy="${f(oy + Math.sin(a) * h * 0.5 * d + h * 0.3)}" rx="${f(rng.range(22, 58))}" ry="${f(rng.range(10, 26))}" fill="#1E1A14" transform="rotate(${f(rng.range(-60, 60))} ${f(ox + Math.cos(a) * w * 0.32 * d)} ${f(oy + Math.sin(a) * h * 0.5 * d + h * 0.3)})"/>`;
    }
    b += `</g>`;
  } else if (mode === 3) {
    // Brise-soleil grid against a lit interior.
    // Warm interior behind, dark structure in front. Contrast is the picture.
    b = rect(0, 0, w, h, mix(p.lit, "#FFD79A", 0.55));
    for (let i = 0; i < 7; i++) {
      b += rect(0, h * rng.range(0, 0.92), w, h * rng.range(0.04, 0.12), mix(p.lit, "#F0B063", 0.7), `opacity="${f(rng.range(0.16, 0.4))}"`);
    }
    const frame = shade(p.land, 0.04);
    const cols = rng.int(4, 7);
    const rows = rng.int(3, 5);
    const cw2 = w / cols;
    const ch2 = h / rows;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = cw2 * c;
        const y = ch2 * r;
        if (rng.chance(0.34)) {
          b += rect(x + 16, y + 16, cw2 - 32, ch2 - 32, frame, 'opacity="0.92"');
        } else {
          b += rect(x + 16, y + 16, cw2 - 32, ch2 - 32, mix(p.lit, "#FFE3B0", 0.6), `opacity="${f(rng.range(0.3, 0.8))}"`);
          const fins = rng.int(3, 6);
          for (let fI = 1; fI <= fins; fI++) {
            b += rect(x + 16, y + 16 + ((ch2 - 32) * fI) / (fins + 1) - 4, cw2 - 32, 8, frame, 'opacity="0.75"');
          }
        }
      }
    }
    for (let c = 0; c <= cols; c++) b += rect(cw2 * c - 9, 0, 18, h, frame);
    for (let r = 0; r <= rows; r++) b += rect(0, ch2 * r - 9, w, 18, shade(frame, 0.06));
  } else {
    // Sheer curtain lifting off a stone reveal.
    b = rect(0, 0, w, h, shade(face, -0.16));
    b += rect(w * 0.06, 0, w * 0.5, h, shade(p.glass, 0.14));
    for (let i = 0; i < 16; i++) {
      const x = w * 0.5 + i * (w * 0.032);
      b += path(
        `M${f(x)},0 C${f(x - 26)},${f(h * 0.35)} ${f(x + 30)},${f(h * 0.7)} ${f(x - 12)},${f(h)} L${f(x + w * 0.03)},${f(h)} C${f(x + w * 0.03 + 30)},${f(h * 0.7)} ${f(x + w * 0.03 - 26)},${f(h * 0.35)} ${f(x + w * 0.03)},0 Z`,
        mix(p.lit, "#FFFFFF", 0.4),
        `opacity="${f(rng.range(0.5, 0.86))}"`,
      );
    }
  }
  b += rect(0, 0, w, h, "url(#rake)");
  return { defs, body: b, palette: p };
}

export function interior(rng, w, h) {
  const p = INTERIOR_PALETTES[rng.pick(INTERIOR_KEYS)];
  const room = rng.pick(["living", "living", "bedroom", "kitchen", "bath"]);
  const defs =
    vGrad("wall", [["0%", shade(p.wall, 0.1)], ["100%", p.wallShade]]) +
    vGrad("flr", [["0%", p.floorDark], ["100%", p.floor]]) +
    hGrad("shaft", [["0%", p.light, 0.55], ["100%", p.light, 0]]) +
    blurFilter("sblur", 26);

  const floorY = h * rng.range(0.58, 0.68);
  const ceil = h * rng.range(0.04, 0.1);
  let b = rect(0, 0, w, h, "url(#wall)");
  b += rect(0, 0, w, ceil, shade(p.wall, 0.14));
  b += rect(0, ceil, w, 3, shade(p.wall, -0.2), 'opacity="0.5"');
  b += rect(0, floorY, w, h - floorY, "url(#flr)");
  b += rect(0, floorY - 14, w, 14, shade(p.wall, -0.18));
  b += rect(0, floorY, w, 3, shade(p.floorDark, -0.25), 'opacity="0.6"');
  // Floorboards
  for (let i = 1; i < 9; i++) {
    b += rect(0, floorY + ((h - floorY) * i) / 9, w, 1.4, shade(p.floorDark, -0.16), 'opacity="0.3"');
  }

  const winLeft = rng.chance(0.5);
  const wx = winLeft ? w * rng.range(0.04, 0.1) : w * rng.range(0.56, 0.68);
  const ww = w * rng.range(0.24, 0.34);
  const wy = ceil + h * 0.03;
  const wh = floorY - wy - h * rng.range(0.0, 0.05);
  const arched = rng.chance(0.3);
  b += rect(wx - 12, wy - 12, ww + 24, wh + 14, shade(p.wall, -0.24));
  if (arched) {
    b += path(
      `M${f(wx)},${f(wy + wh)} L${f(wx)},${f(wy + ww / 2)} A${f(ww / 2)},${f(ww / 2)} 0 0 1 ${f(wx + ww)},${f(wy + ww / 2)} L${f(wx + ww)},${f(wy + wh)} Z`,
      p.light,
    );
  } else {
    b += rect(wx, wy, ww, wh, p.light, 'opacity="0.95"');
  }
  const panes = rng.int(2, 4);
  for (let i = 1; i < panes; i++) b += rect(wx + (ww * i) / panes - 3, wy + (arched ? ww / 2 : 0), 6, wh - (arched ? ww / 2 : 0), p.deep, 'opacity="0.5"');
  b += rect(wx, wy + wh * rng.range(0.5, 0.68), ww, 5, p.deep, 'opacity="0.38"');
  b += poly(
    [[wx, floorY], [wx + ww, floorY], [wx + ww + (winLeft ? w * 0.3 : -w * 0.3), h], [wx + (winLeft ? w * 0.12 : -w * 0.12), h]],
    "url(#shaft)",
    'opacity="0.5"',
  );

  const near = winLeft ? 1 : -1;
  const anchor = (t) => (winLeft ? w * (0.42 + t * 0.5) : w * (0.06 + t * 0.5));

  if (room === "living") {
    const rugY = floorY + (h - floorY) * 0.3;
    b += rect(w * 0.12, rugY, w * 0.66, (h - floorY) * 0.62, p.textile, 'opacity="0.7"');
    const sx = anchor(0);
    const sw = w * 0.32;
    const sy = floorY + (h - floorY) * 0.14;
    const sh = (h - floorY) * 0.3;
    b += rect(sx - 8, sy + sh, sw + 16, 12, "#000000", 'opacity="0.16"');
    b += rect(sx, sy - sh * 0.55, sw, sh * 0.6, shade(p.object, 0.07));
    b += rect(sx, sy, sw, sh, p.object);
    for (let i = 0; i < 3; i++) {
      b += rect(sx + sw * (0.07 + i * 0.31), sy - sh * 0.46, sw * 0.22, sh * 0.42, shade(p.textile, rng.range(-0.06, 0.14)));
    }
    b += rect(sx + sw * 0.08, sy + sh, sw * 0.05, (h - floorY) * 0.09, p.objectDark);
    b += rect(sx + sw * 0.87, sy + sh, sw * 0.05, (h - floorY) * 0.09, p.objectDark);
    const tx = anchor(0.42);
    b += ellipse(tx, floorY + (h - floorY) * 0.66, w * 0.085, (h - floorY) * 0.1, "#000000", 'opacity="0.16"');
    b += ellipse(tx, floorY + (h - floorY) * 0.6, w * 0.085, (h - floorY) * 0.085, shade(p.object, 0.16));
    b += rect(tx - 4, floorY + (h - floorY) * 0.62, 8, (h - floorY) * 0.2, p.objectDark);
    b += rect(tx - w * 0.018, floorY + (h - floorY) * 0.545, w * 0.011, (h - floorY) * 0.055, p.accent);
  } else if (room === "bedroom") {
    const bx = winLeft ? w * 0.4 : w * 0.1;
    const bwd = w * 0.42;
    const by = floorY + (h - floorY) * 0.1;
    const bhh = (h - floorY) * 0.46;
    b += rect(bx + bwd * 0.06, by - bhh * 1.5, bwd * 0.88, bhh * 1.5, shade(p.object, 0.04));
    for (let i = 1; i < 5; i++) b += rect(bx + bwd * 0.06 + (bwd * 0.88 * i) / 5, by - bhh * 1.5, 2.5, bhh * 1.5, shade(p.object, -0.1), 'opacity="0.6"');
    b += rect(bx - 6, by + bhh, bwd + 12, 12, "#000000", 'opacity="0.16"');
    b += rect(bx, by, bwd, bhh, shade(p.textile, 0.1));
    b += rect(bx, by, bwd, bhh * 0.3, shade(p.light, -0.05));
    b += rect(bx, by + bhh * 0.56, bwd, bhh * 0.14, shade(p.textile, -0.16));
    for (let i = 0; i < 2; i++) {
      b += rect(bx + bwd * (0.08 + i * 0.46), by - bhh * 0.22, bwd * 0.38, bhh * 0.26, shade(p.light, -0.02));
    }
    for (const side of [-1, 1]) {
      const nx = side < 0 ? bx - w * 0.075 : bx + bwd + w * 0.02;
      b += rect(nx, floorY + (h - floorY) * 0.34, w * 0.055, (h - floorY) * 0.24, p.objectDark);
      b += rect(nx + w * 0.012, floorY + (h - floorY) * 0.26, w * 0.03, (h - floorY) * 0.08, shade(p.light, -0.08));
      b += rect(nx + w * 0.026, floorY + (h - floorY) * 0.3, 3, (h - floorY) * 0.05, p.accent);
    }
  } else if (room === "kitchen") {
    b += rect(0, ceil + h * 0.02, w * 0.4, floorY - ceil - h * 0.02, shade(p.object, 0.02));
    for (let i = 0; i < 3; i++) b += rect(w * 0.13 * i + 6, ceil + h * 0.03, w * 0.12, floorY - ceil - h * 0.05, shade(p.object, i % 2 ? -0.04 : 0.06));
    const ix = w * 0.26;
    const iw = w * 0.48;
    const iy = floorY + (h - floorY) * 0.06;
    const ih = (h - floorY) * 0.44;
    b += rect(ix - 8, iy + ih, iw + 16, 12, "#000000", 'opacity="0.18"');
    b += rect(ix, iy, iw, ih, shade(p.object, -0.06));
    b += rect(ix - 10, iy - 14, iw + 20, 16, shade(p.light, -0.12));
    b += rect(ix - 10, iy - 14, iw + 20, 4, shade(p.light, 0.1));
    for (let i = 1; i < 4; i++) b += rect(ix + (iw * i) / 4, iy, 2.5, ih, shade(p.objectDark, 0), 'opacity="0.5"');
    for (let i = 0; i < 3; i++) {
      const px = ix + iw * (0.2 + i * 0.3);
      b += rect(px - 1.5, ceil + 4, 3, h * 0.2, p.objectDark);
      b += poly([[px - 18, ceil + h * 0.2], [px + 18, ceil + h * 0.2], [px + 11, ceil + h * 0.14], [px - 11, ceil + h * 0.14]], p.accent);
    }
    b += rect(ix + iw * 0.7, iy - 40, w * 0.03, 40, p.objectDark);
  } else {
    // Bath / spa
    const tx = w * (winLeft ? 0.56 : 0.3);
    const tw = w * 0.3;
    const ty = floorY + (h - floorY) * 0.22;
    const th = (h - floorY) * 0.34;
    b += ellipse(tx + tw / 2, ty + th + 8, tw * 0.5, 12, "#000000", 'opacity="0.16"');
    b += `<rect x="${f(tx)}" y="${f(ty)}" width="${f(tw)}" height="${f(th)}" rx="${f(th * 0.48)}" fill="${shade(p.light, -0.04)}"/>`;
    b += `<rect x="${f(tx + 10)}" y="${f(ty + 8)}" width="${f(tw - 20)}" height="${f(th - 18)}" rx="${f(th * 0.4)}" fill="${shade(p.textile, -0.08)}" opacity="0.65"/>`;
    b += rect(tx - w * 0.02, ty - h * 0.1, 4, h * 0.1, p.objectDark);
    b += rect(tx - w * 0.03, ty - h * 0.1, w * 0.03, 4, p.objectDark);
    const vx = w * (winLeft ? 0.16 : 0.72);
    b += rect(vx, floorY - h * 0.02, w * 0.16, (h - floorY) * 0.2, shade(p.object, -0.02));
    b += rect(vx, floorY - h * 0.035, w * 0.16, h * 0.02, shade(p.light, -0.1));
    b += `<rect x="${f(vx + w * 0.03)}" y="${f(floorY - h * 0.22)}" width="${f(w * 0.1)}" height="${f(h * 0.17)}" rx="${f(w * 0.05)}" fill="${shade(p.wall, -0.2)}"/>`;
    b += `<rect x="${f(vx + w * 0.034)}" y="${f(floorY - h * 0.215)}" width="${f(w * 0.092)}" height="${f(h * 0.16)}" rx="${f(w * 0.046)}" fill="${shade(p.light, 0.02)}" opacity="0.8"/>`;
  }

  // Floor lamp, art and planting are shared dressing across every room.
  if (rng.chance(0.7)) {
    const lx = winLeft ? w * rng.range(0.84, 0.92) : w * rng.range(0.08, 0.16);
    b += rect(lx - 2, floorY - h * 0.18, 4, h * 0.18 + (h - floorY) * 0.3, p.objectDark);
    b += poly([[lx - 28, floorY - h * 0.18], [lx + 28, floorY - h * 0.18], [lx + 19, floorY - h * 0.26], [lx - 19, floorY - h * 0.26]], shade(p.light, -0.05));
    b += ellipse(lx, floorY - h * 0.175, 26, 7, mix(p.light, "#FFE7BC", 0.5), 'opacity="0.5"');
  }
  if (rng.chance(0.75)) {
    const ax = winLeft ? w * rng.range(0.46, 0.6) : w * rng.range(0.18, 0.3);
    const aw2 = w * rng.range(0.12, 0.18);
    const ah = h * rng.range(0.18, 0.26);
    b += rect(ax, ceil + h * 0.06, aw2, ah, shade(p.wall, -0.16));
    b += rect(ax + 9, ceil + h * 0.06 + 9, aw2 - 18, ah - 18, shade(rng.chance(0.5) ? p.accent : p.textile, rng.range(-0.25, 0.3)), 'opacity="0.55"');
  }
  if (rng.chance(0.6)) {
    const px2 = winLeft ? w * rng.range(0.3, 0.38) : w * rng.range(0.78, 0.88);
    b += rect(px2 - 24, floorY + (h - floorY) * 0.4, 48, (h - floorY) * 0.3, shade(p.object, -0.12));
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI * 0.88 + (i / 7) * Math.PI * 0.76;
      b += path(
        `M${f(px2)},${f(floorY + (h - floorY) * 0.4)} Q${f(px2 + Math.cos(a) * 62)},${f(floorY - h * 0.03 + Math.sin(a) * 62)} ${f(px2 + Math.cos(a) * 108)},${f(floorY - h * 0.07 + Math.sin(a) * 76)}`,
        "none",
        `stroke="#4E5A42" stroke-width="7" stroke-linecap="round" opacity="0.85"`,
      );
    }
  }
  void near;
  return { defs, body: b, palette: p };
}

export function portrait(rng, w, h) {
  const grounds = ["#2A2724", "#3A3630", "#4A4640", "#1E1D1C", "#584F45", "#6B6156", "#2F3330", "#403A33", "#7A7065", "#8C8377"];
  const skins = ["#C9A184", "#A87A5C", "#8A5D42", "#DCBDA0", "#6E4630", "#B98D6C", "#E0C4A8", "#7C543A", "#5A3826"];
  const hairs = ["#1C1714", "#2E241C", "#4A3626", "#6B5A46", "#8A7A62", "#241F1C", "#B9A88C", "#3A3A3C"];
  const cloths = ["#22211F", "#3B3A38", "#5C5852", "#8A8377", "#2E3538", "#4A3F36", "#6E6A62", "#1B2226"];
  const g = rng.pick(grounds);
  const skin = rng.pick(skins);
  // Keep hair readable against the skin tone it sits next to.
  const lum = (hex) => { const [r, gg, bb] = hexToRgb(hex); return 0.299 * r + 0.587 * gg + 0.114 * bb; };
  let hair = rng.pick(hairs);
  for (let i = 0; i < 6 && Math.abs(lum(hair) - lum(skin)) < 46; i++) hair = rng.pick(hairs);
  const cloth = rng.pick(cloths);
  const keyLeft = rng.chance(0.5);
  const keyX = keyLeft ? 30 : 70;
  const dir = keyLeft ? -1 : 1;
  const style = rng.pick(["short", "short", "long", "tied", "cropped"]);

  const defs =
    rGrad("pg", [["0%", shade(g, 0.26)], ["100%", shade(g, -0.38)]], `${keyX}%`, "32%", "92%") +
    rGrad("key", [["0%", "#FFF1DA", 0.34], ["100%", "#FFF1DA", 0]], `${keyX}%`, "22%", "58%") +
    blurFilter("figure", 13) +
    blurFilter("feat", 9) +
    blurFilter("rim", 34);

  let b = rect(0, 0, w, h, "url(#pg)");
  b += rect(0, 0, w, h, "url(#key)");

  // A tighter crop than a headshot: plenty of negative space above, the
  // shoulders running off the bottom edge. Reads as a film frame, not an avatar.
  const cx = w * (0.5 + (keyLeft ? 0.03 : -0.03) + rng.range(-0.03, 0.03));
  const rx = w * rng.range(0.145, 0.168);
  const ry = rx * rng.range(1.2, 1.3);
  const cy = h * rng.range(0.4, 0.45);
  const shoulderY = cy + ry * 1.62;

  b += `<g filter="url(#figure)">`;
  if (style === "long") {
    b += path(
      `M${f(cx - rx * 1.2)},${f(cy - ry * 0.1)} C${f(cx - rx * 1.9)},${f(cy + ry * 1.5)} ${f(cx - rx * 1.7)},${f(cy + ry * 2.6)} ${f(cx - rx * 1.35)},${f(shoulderY + ry * 1.1)} L${f(cx + rx * 1.35)},${f(shoulderY + ry * 1.1)} C${f(cx + rx * 1.7)},${f(cy + ry * 2.6)} ${f(cx + rx * 1.9)},${f(cy + ry * 1.5)} ${f(cx + rx * 1.2)},${f(cy - ry * 0.1)} Z`,
      shade(hair, -0.1),
    );
  }
  // Shoulders and chest.
  b += path(
    `M${f(cx - w * 0.72)},${f(h + 30)} C${f(cx - w * 0.42)},${f(shoulderY + ry * 0.5)} ${f(cx - w * 0.23)},${f(shoulderY - ry * 0.1)} ${f(cx + dir * w * 0.012)},${f(shoulderY - ry * 0.16)} C${f(cx + w * 0.23)},${f(shoulderY - ry * 0.1)} ${f(cx + w * 0.42)},${f(shoulderY + ry * 0.5)} ${f(cx + w * 0.72)},${f(h + 30)} Z`,
    cloth,
  );
  if (rng.chance(0.6)) {
    // Notched lapel.
    b += poly(
      [[cx - rx * 0.66, shoulderY + ry * 0.02], [cx, shoulderY + ry * 1.0], [cx + rx * 0.66, shoulderY + ry * 0.02], [cx + rx * 0.28, shoulderY - ry * 0.08], [cx - rx * 0.28, shoulderY - ry * 0.08]],
      shade(cloth, 0.14),
    );
  } else {
    // Open collar / roll neck.
    b += `<path d="M${f(cx - rx * 0.56)},${f(shoulderY - ry * 0.02)} Q${f(cx)},${f(shoulderY + ry * 0.5)} ${f(cx + rx * 0.56)},${f(shoulderY - ry * 0.02)}" fill="${shade(cloth, 0.1)}"/>`;
  }
  // Neck, hair mass, then the face over it so the hairline sits correctly.
  b += path(
    `M${f(cx - rx * 0.44)},${f(cy + ry * 0.68)} L${f(cx - rx * 0.5)},${f(shoulderY + ry * 0.05)} L${f(cx + rx * 0.5)},${f(shoulderY + ry * 0.05)} L${f(cx + rx * 0.44)},${f(cy + ry * 0.68)} Z`,
    shade(skin, -0.22),
  );
  const cap = style === "cropped" ? 1.02 : style === "tied" ? 1.06 : 1.12;
  b += ellipse(cx + dir * rx * 0.03, cy - ry * 0.13, rx * cap, ry * cap, hair);
  if (style === "tied") b += ellipse(cx - dir * rx * 0.95, cy - ry * 0.5, rx * 0.34, ry * 0.3, hair);
  if (style === "long") {
    b += ellipse(cx - rx * 1.02, cy + ry * 0.5, rx * 0.34, ry * 0.85, hair);
    b += ellipse(cx + rx * 1.02, cy + ry * 0.5, rx * 0.34, ry * 0.85, hair);
  }
  b += ellipse(cx + dir * rx * 0.04, cy + ry * 0.12, rx * 0.92, ry * 0.94, skin);
  // Fill light on the key side, shadow opposite.
  b += ellipse(cx - dir * rx * 0.55, cy + ry * 0.2, rx * 0.62, ry * 0.8, shade(skin, -0.2), 'opacity="0.5"');
  b += ellipse(cx + dir * rx * 0.4, cy - ry * 0.05, rx * 0.44, ry * 0.5, shade(skin, 0.16), 'opacity="0.45"');
  b += `</g>`;

  // Facial structure, softly out of focus — enough to read as a person.
  b += `<g filter="url(#feat)" opacity="0.72">`;
  const eyeY = cy + ry * 0.06;
  const eyeDx = rx * 0.36;
  for (const s of [-1, 1]) {
    b += ellipse(cx + dir * rx * 0.04 + s * eyeDx, eyeY, rx * 0.19, ry * 0.075, shade(skin, -0.46));
    b += ellipse(cx + dir * rx * 0.04 + s * eyeDx, eyeY - ry * 0.13, rx * 0.22, ry * 0.05, shade(skin, -0.34), 'opacity="0.7"');
  }
  b += ellipse(cx + dir * rx * 0.08, cy + ry * 0.4, rx * 0.13, ry * 0.12, shade(skin, -0.3), 'opacity="0.55"');
  b += ellipse(cx + dir * rx * 0.05, cy + ry * 0.62, rx * 0.26, ry * 0.075, shade(skin, -0.4), 'opacity="0.62"');
  b += ellipse(cx + dir * rx * 0.05, cy + ry * 0.88, rx * 0.5, ry * 0.2, shade(skin, -0.24), 'opacity="0.4"');
  b += `</g>`;

  // Rim light licking the key edge of the head.
  b += `<g filter="url(#rim)" opacity="0.22">${ellipse(cx + (keyLeft ? -1 : 1) * rx * 1.25, cy - ry * 0.2, rx * 0.3, ry * 0.62, "#FFF0D8")}</g>`;
  return { defs, body: b, grainOpacity: 0.42, vignette: 0.46, palette: { accent: "#B08E55" } };
}

export function editorial(rng, w, h) {
  const p = PALETTES[rng.pick(PALETTE_KEYS)];
  const defs =
    vGrad("eg", [["0%", shade(p.skyMid, 0.2)], ["100%", shade(p.land, 0.1)]]) +
    rGrad("eo", [["0%", mix(p.accent, "#FFE7BC", 0.4), 0.42], ["100%", p.accent, 0]], "28%", "26%", "62%") +
    blurFilter("eb", 46);
  let b = rect(0, 0, w, h, "url(#eg)");
  b += `<g filter="url(#eb)" opacity="0.3">`;
  for (let i = 0; i < 2; i++) {
    b += ellipse(rng.range(0, w), rng.range(0, h), rng.range(w * 0.16, w * 0.34), rng.range(h * 0.14, h * 0.34), rng.pick([p.lit, p.haze, p.water]));
  }
  b += `</g>`;
  b += rect(0, 0, w, h, "url(#eo)");

  // A single strong architectural gesture, then quiet supporting structure.
  const kind = rng.int(0, 3);
  const cx = w * rng.range(0.32, 0.66);
  const s = Math.min(w, h) * rng.range(0.4, 0.62);
  const c = rng.pick([p.land, p.lit, p.accent]);
  if (kind === 0) {
    b += path(`M${f(cx - s / 2)},${f(h * 0.9)} L${f(cx - s / 2)},${f(h * 0.48)} A${f(s / 2)},${f(s / 2)} 0 0 1 ${f(cx + s / 2)},${f(h * 0.48)} L${f(cx + s / 2)},${f(h * 0.9)} Z`, c, 'opacity="0.85"');
    b += path(`M${f(cx - s / 2 + 22)},${f(h * 0.9)} L${f(cx - s / 2 + 22)},${f(h * 0.49)} A${f(s / 2 - 22)},${f(s / 2 - 22)} 0 0 1 ${f(cx + s / 2 - 22)},${f(h * 0.49)} L${f(cx + s / 2 - 22)},${f(h * 0.9)} Z`, shade(p.skyLow, 0.1), 'opacity="0.6"');
  } else if (kind === 1) {
    b += circle(cx, h * 0.42, s * 0.46, c, 'opacity="0.8"');
    b += circle(cx, h * 0.42, s * 0.46, "none", `stroke="${shade(p.lit, 0.3)}" stroke-width="1.5" opacity="0.5"`);
    b += rect(0, h * 0.42, w, 1.6, shade(p.lit, 0.25), 'opacity="0.55"');
  } else if (kind === 2) {
    const n = rng.int(3, 6);
    for (let i = 0; i < n; i++) {
      b += rect(cx - s / 2 + (s / n) * i, h * rng.range(0.2, 0.4), (s / n) * 0.66, h * rng.range(0.34, 0.56), c, `opacity="${f(rng.range(0.5, 0.9))}"`);
    }
  } else {
    b += poly([[cx - s / 2, h * 0.86], [cx, h * 0.2], [cx + s / 2, h * 0.86]], c, 'opacity="0.75"');
  }

  // Hairline grid — the typographic signature carried into the imagery.
  const gcols = rng.int(4, 7);
  for (let i = 1; i < gcols; i++) {
    b += rect((w / gcols) * i, 0, 1, h, shade(p.lit, 0.25), 'opacity="0.16"');
  }
  for (let i = 0; i < rng.int(2, 4); i++) {
    const y = rng.range(h * 0.12, h * 0.88);
    b += rect(0, y, w, 1.4, shade(p.lit, 0.2), `opacity="${f(rng.range(0.16, 0.32))}"`);
  }
  // Halftone corner.
  const dx = rng.chance(0.5) ? w * 0.06 : w * 0.62;
  for (let r = 0; r < 7; r++) {
    for (let cc = 0; cc < 9; cc++) {
      b += circle(dx + cc * (w * 0.032), h * 0.7 + r * (h * 0.042), Math.max(0.8, 4.6 - r * 0.55), p.accent, `opacity="${f(0.42 - r * 0.045)}"`);
    }
  }
  return { defs, body: b, palette: p };
}

export const SCENES = {
  coastal, villa, tower, townhouse, estate, land, aerial, detail,
  interior, portrait, plan, map, editorial,
};

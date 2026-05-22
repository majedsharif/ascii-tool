import { PALETTES } from './presets';
import type { Grid, ImageSettings } from './types';

export function boxBlur(buf: Float32Array, cols: number, rows: number, r: number): void {
  const tmp = new Float32Array(buf.length);
  const win = 2 * r + 1;
  for (let y = 0; y < rows; y++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) {
      const xc = k < 0 ? 0 : k >= cols ? cols - 1 : k;
      sum += buf[y * cols + xc];
    }
    for (let x = 0; x < cols; x++) {
      tmp[y * cols + x] = sum / win;
      const xOut = x - r;
      const xIn = x + r + 1;
      const ai = xOut < 0 ? 0 : xOut;
      const bi = xIn >= cols ? cols - 1 : xIn;
      sum += buf[y * cols + bi] - buf[y * cols + ai];
    }
  }
  for (let x = 0; x < cols; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) {
      const yc = k < 0 ? 0 : k >= rows ? rows - 1 : k;
      sum += tmp[yc * cols + x];
    }
    for (let y = 0; y < rows; y++) {
      buf[y * cols + x] = sum / win;
      const yOut = y - r;
      const yIn = y + r + 1;
      const ai = yOut < 0 ? 0 : yOut;
      const bi = yIn >= rows ? rows - 1 : yIn;
      sum += tmp[bi * cols + x] - tmp[ai * cols + x];
    }
  }
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 255, g * 255, b * 255];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function nearestPaletteColor(r: number, g: number, b: number, palette: number[][]): [number, number, number] {
  let best = palette[0], bd = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const dr = palette[i][0] - r;
    const dg = palette[i][1] - g;
    const db = palette[i][2] - b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bd) { bd = d; best = palette[i]; }
  }
  return [best[0], best[1], best[2]];
}

export function processImageToGrid(
  procCanvas: HTMLCanvasElement,
  procCtx: CanvasRenderingContext2D,
  image: CanvasImageSource | null,
  imageW: number,
  imageH: number,
  cols: number,
  rows: number,
  settings: ImageSettings,
  bgColor: string = '#ffffff',
): Grid {
  procCanvas.width = cols;
  procCanvas.height = rows;
  procCtx.clearRect(0, 0, cols, rows);

  if (!image || !imageW || !imageH) {
    const gray = new Float32Array(cols * rows).fill(0.5);
    const colors = new Uint8ClampedArray(cols * rows * 3).fill(128);
    const alpha = new Uint8ClampedArray(cols * rows).fill(255);
    return { gray, colors, alpha, cols, rows };
  }

  procCtx.imageSmoothingEnabled = true;
  procCtx.imageSmoothingQuality = 'high';

  const rot = ((settings.rotation || 0) % 360 + 360) % 360;
  const flipH = !!settings.flipH;
  const flipV = !!settings.flipV;
  if (rot === 0 && !flipH && !flipV) {
    procCtx.drawImage(image, 0, 0, cols, rows);
  } else {
    procCtx.save();
    procCtx.translate(cols / 2, rows / 2);
    procCtx.rotate((rot * Math.PI) / 180);
    procCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    const r90 = rot === 90 || rot === 270;
    const dw = r90 ? rows : cols;
    const dh = r90 ? cols : rows;
    procCtx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
    procCtx.restore();
  }
  const imgData = procCtx.getImageData(0, 0, cols, rows);
  const data = imgData.data;

  // Keep alpha as a visibility mask; composite RGB against bgColor so luminance reads correctly.
  const alpha = new Uint8ClampedArray(cols * rows);
  const [bgR, bgG, bgB] = hexToRgb(bgColor);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const a255 = data[i + 3];
    alpha[p] = a255;
    if (a255 < 255) {
      const af = a255 / 255;
      const inv = 1 - af;
      data[i] = data[i] * af + bgR * inv;
      data[i + 1] = data[i + 1] * af + bgG * inv;
      data[i + 2] = data[i + 2] * af + bgB * inv;
    }
  }

  const b = settings.brightness * 2.55;
  const c = settings.contrast;
  const cf = (259 * (c + 255)) / (255 * (259 - c));
  const sat = settings.saturation / 100;
  const gam = settings.gamma > 0 ? settings.gamma : 1;
  const gInv = 1 / gam;
  const inv = settings.invert / 100;
  const hueDeg = settings.hueShift || 0;
  const hueShift = hueDeg / 360;
  const tintStr = (settings.tintStrength || 0) / 100;
  const tintRgb = tintStr > 0 ? hexToRgb(settings.tintColor || '#ffffff') : null;

  const gray = new Float32Array(cols * rows);
  const colors = new Uint8ClampedArray(cols * rows * 3);

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    let r = data[i], g = data[i + 1], bl = data[i + 2];
    r += b; g += b; bl += b;
    r = cf * (r - 128) + 128;
    g = cf * (g - 128) + 128;
    bl = cf * (bl - 128) + 128;
    if (sat !== 0) {
      const ly = 0.299 * r + 0.587 * g + 0.114 * bl;
      const k = 1 + sat;
      r = ly + (r - ly) * k;
      g = ly + (g - ly) * k;
      bl = ly + (bl - ly) * k;
    }
    if (gam !== 1) {
      r = r < 0 ? 0 : r > 255 ? 255 : r;
      g = g < 0 ? 0 : g > 255 ? 255 : g;
      bl = bl < 0 ? 0 : bl > 255 ? 255 : bl;
      r = Math.pow(r / 255, gInv) * 255;
      g = Math.pow(g / 255, gInv) * 255;
      bl = Math.pow(bl / 255, gInv) * 255;
    }
    if (inv > 0) {
      r = r * (1 - inv) + (255 - r) * inv;
      g = g * (1 - inv) + (255 - g) * inv;
      bl = bl * (1 - inv) + (255 - bl) * inv;
    }
    if (hueShift !== 0) {
      r = r < 0 ? 0 : r > 255 ? 255 : r;
      g = g < 0 ? 0 : g > 255 ? 255 : g;
      bl = bl < 0 ? 0 : bl > 255 ? 255 : bl;
      const [h, ss, ll] = rgbToHsl(r, g, bl);
      const nh = (h + hueShift) % 1;
      const [nr, ng, nb] = hslToRgb(nh < 0 ? nh + 1 : nh, ss, ll);
      r = nr; g = ng; bl = nb;
    }
    if (tintRgb && tintStr > 0) {
      const ly = (0.299 * r + 0.587 * g + 0.114 * bl) / 255;
      const tr = tintRgb[0] * ly;
      const tg = tintRgb[1] * ly;
      const tb = tintRgb[2] * ly;
      r = r * (1 - tintStr) + tr * tintStr;
      g = g * (1 - tintStr) + tg * tintStr;
      bl = bl * (1 - tintStr) + tb * tintStr;
    }
    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    bl = bl < 0 ? 0 : bl > 255 ? 255 : bl;
    colors[p * 3] = r;
    colors[p * 3 + 1] = g;
    colors[p * 3 + 2] = bl;
    gray[p] = (0.299 * r + 0.587 * g + 0.114 * bl) / 255;
  }

  const palette = PALETTES.find((p) => p.id === settings.paletteMode);
  if (palette && palette.colors.length > 0) {
    for (let p = 0; p < gray.length; p++) {
      const [nr, ng, nb] = nearestPaletteColor(
        colors[p * 3], colors[p * 3 + 1], colors[p * 3 + 2],
        palette.colors,
      );
      colors[p * 3] = nr;
      colors[p * 3 + 1] = ng;
      colors[p * 3 + 2] = nb;
    }
  }

  if (settings.duotoneEnable) {
    const lightRgb = hexToRgb(settings.duotoneLight || '#ffffff');
    const darkRgb = hexToRgb(settings.duotoneDark || '#000000');
    for (let p = 0; p < gray.length; p++) {
      const t = gray[p];
      colors[p * 3] = darkRgb[0] + (lightRgb[0] - darkRgb[0]) * t;
      colors[p * 3 + 1] = darkRgb[1] + (lightRgb[1] - darkRgb[1]) * t;
      colors[p * 3 + 2] = darkRgb[2] + (lightRgb[2] - darkRgb[2]) * t;
    }
  }

  const blurR = Math.round(settings.blur);
  if (blurR > 0) {
    boxBlur(gray, cols, rows, blurR);
  }

  const sharp = settings.sharpen / 100;
  if (sharp > 0) {
    const src = new Float32Array(gray);
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const i = y * cols + x;
        const lap = 4 * src[i] - src[i - 1] - src[i + 1] - src[i - cols] - src[i + cols];
        const v = src[i] + sharp * lap;
        gray[i] = v < 0 ? 0 : v > 1 ? 1 : v;
      }
    }
  }

  const edge = settings.edge / 100;
  if (edge > 0) {
    const edges = new Float32Array(cols * rows);
    const invSobelMax = 1 / Math.sqrt(32);
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const i00 = (y - 1) * cols + (x - 1);
        const i01 = (y - 1) * cols + x;
        const i02 = (y - 1) * cols + (x + 1);
        const i10 = y * cols + (x - 1);
        const i12 = y * cols + (x + 1);
        const i20 = (y + 1) * cols + (x - 1);
        const i21 = (y + 1) * cols + x;
        const i22 = (y + 1) * cols + (x + 1);
        const gx = -gray[i00] + gray[i02] - 2 * gray[i10] + 2 * gray[i12] - gray[i20] + gray[i22];
        const gy = -gray[i00] - 2 * gray[i01] - gray[i02] + gray[i20] + 2 * gray[i21] + gray[i22];
        const m = Math.sqrt(Math.sqrt(gx * gx + gy * gy) * invSobelMax);
        edges[y * cols + x] = m > 1 ? 1 : m;
      }
    }
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const i = y * cols + x;
        gray[i] = gray[i] * (1 - edge) + edges[i] * edge;
      }
    }
  }

  const post = settings.posterize | 0;
  if (post >= 2) {
    const denom = post - 1;
    for (let i = 0; i < gray.length; i++) {
      gray[i] = Math.round(gray[i] * denom) / denom;
    }
  }

  const dith = settings.dither / 100;
  if (dith > 0) {
    const work = new Float32Array(gray);
    const levels = 5;
    const denom = levels - 1;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const old = work[i];
        const quant = Math.round(old * denom) / denom;
        const err = old - quant;
        work[i] = quant;
        if (x + 1 < cols) work[i + 1] += err * 7 / 16;
        if (y + 1 < rows) {
          if (x > 0) work[i + cols - 1] += err * 3 / 16;
          work[i + cols] += err * 5 / 16;
          if (x + 1 < cols) work[i + cols + 1] += err * 1 / 16;
        }
      }
    }
    for (let i = 0; i < gray.length; i++) {
      const v = gray[i] * (1 - dith) + work[i] * dith;
      gray[i] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
  }

  return { gray, colors, alpha, cols, rows };
}

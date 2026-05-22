import type { ImageSettings } from './types';

export function pseudoRand(seed: number): number {
  const s = Math.sin(seed) * 43758.5453;
  return s - Math.floor(s);
}

export function getCharIndex(
  x: number,
  y: number,
  cols: number,
  rows: number,
  settings: ImageSettings,
  text: string,
  t: number | null,
  b: number | null,
): number {
  const len = text.length;
  if (len === 0) return 0;
  let idx: number;
  switch (settings.fillMode) {
    case 'wave': {
      const phase = x * 0.14 + y * 0.09;
      idx = Math.min(len - 1, Math.floor((Math.sin(phase) * 0.5 + 0.5) * len));
      break;
    }
    case 'scatter': {
      const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      idx = h % len;
      break;
    }
    case 'density': {
      const bv = b == null ? 0.5 : b;
      idx = Math.min(len - 1, Math.max(0, Math.floor(bv * len)));
      break;
    }
    case 'stream': {
      const colOff = ((x * 41) ^ ((x * 7) >>> 1)) >>> 0;
      idx = (colOff + y) % len;
      break;
    }
    case 'bits': {
      const pattern = (((x * 3) ^ (y >> 1)) + ((y * 5) ^ (x >> 1))) & 3;
      idx = Math.min(len - 1, Math.floor((pattern / 4) * len));
      break;
    }
    case 'repeat':
    default:
      idx = (y * cols + x) % len;
  }
  if (t != null && settings.animEnable) {
    const intensity = settings.animIntensity / 100;
    const tt = t * (settings.animSpeed / 4);
    switch (settings.animMode) {
      case 'wave': {
        const shift = Math.floor(Math.sin(y * 0.2 + tt) * intensity * 6);
        idx = ((idx + shift) % len + len) % len;
        break;
      }
      case 'pulse': {
        const dx = x - cols / 2;
        const dy = y - rows / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const shift = Math.floor(Math.sin(dist * 0.18 - tt * 2) * intensity * 6);
        idx = ((idx + shift) % len + len) % len;
        break;
      }
      case 'rain': {
        const shift = Math.floor((tt * 6 + x * 0.7) * intensity);
        idx = ((idx + shift) % len + len) % len;
        break;
      }
      case 'glitch': {
        const r = pseudoRand(x * 12.9898 + y * 78.233 + Math.floor(tt * 12));
        if (r < intensity * 0.15) {
          idx = Math.floor(pseudoRand(x + y * 31 + tt) * len);
        }
        break;
      }
      case 'error': {
        const colSeed = pseudoRand(x * 1.731 + 0.13);
        if (colSeed > intensity) break;
        const cyclePhase = ((tt * 0.12) + colSeed * 3.7) % 1;
        let stackHeight: number;
        if (cyclePhase < 0.85) {
          stackHeight = Math.floor((cyclePhase / 0.85) * (rows + 1));
        } else {
          stackHeight = Math.floor((1 - (cyclePhase - 0.85) / 0.15) * (rows + 1));
        }
        stackHeight = Math.max(0, Math.min(rows, stackHeight));
        const stackTop = rows - stackHeight;
        const free = Math.max(1, stackTop);
        const fallSpeed = 5 + colSeed * 8;
        const fallY = Math.floor((tt * fallSpeed + colSeed * 11) % free);
        const inStack = y >= stackTop;
        const isFalling = y === fallY && y < stackTop;
        if (!inStack && !isFalling) return -1;
        if (isFalling) {
          idx = (Math.floor(colSeed * 9 + tt * 6) % len + len) % len;
        } else {
          idx = (x * 3 + (rows - 1 - y) * 2) % len;
        }
        break;
      }
      case 'scan': {
        const scanSpan = rows + 12;
        const scanY = ((tt * 16) % scanSpan) - 6;
        const dy = y - scanY;
        if (dy >= 0 && dy < 3) {
          const shift = Math.floor(tt * 30 + x * 0.6);
          idx = ((idx + shift * Math.ceil(1 + intensity * 4)) % len + len) % len;
        } else if (dy >= -10 && dy < 0) {
          const dist = -dy;
          const fade = (10 - dist) / 10;
          const shift = Math.floor((pseudoRand(x * 7 + y * 11) - 0.5) * 16 * intensity * fade);
          idx = ((idx + shift) % len + len) % len;
        }
        break;
      }
      case 'type': {
        if (intensity <= 0) break;
        const totalCells = cols * rows;
        const cellsPerSec = cols * 8;
        const span = totalCells + cols * 3;
        const cursorPos = Math.floor((tt * cellsPerSec) % span);
        const cellPos = y * cols + x;
        if (cellPos > cursorPos) return -1;
        if (cellPos === cursorPos) {
          if (Math.floor(tt * 6) % 2 === 0) {
            idx = len - 1;
          } else {
            return -1;
          }
        } else if (cursorPos - cellPos < cols * 2) {
          const r = pseudoRand(cellPos + Math.floor(tt * 24));
          if (r < intensity * 0.25) {
            idx = Math.floor(pseudoRand(r * 99 + 1) * len);
          }
        }
        break;
      }
      case 'corrupt': {
        const bandH = 4;
        const bandIdx = Math.floor(y / bandH);
        const bandTime = Math.floor(tt * 3);
        const r1 = pseudoRand(bandIdx * 13.7 + bandTime);
        if (r1 < intensity * 0.45) {
          const r2 = pseudoRand(bandIdx * 7.13 + bandTime * 2.31);
          const shift = Math.floor((r2 * 2 - 1) * cols * 0.6);
          idx = ((idx + shift) % len + len) % len;
        }
        const r3 = pseudoRand(x * 17 + y * 29 + Math.floor(tt * 18));
        if (r3 < intensity * 0.04) {
          idx = Math.floor(pseudoRand(r3 * 100 + 1) * len);
        }
        const r4 = pseudoRand(bandIdx * 2.3 + Math.floor(tt * 2));
        if (r4 < intensity * 0.04) return -1;
        break;
      }
    }
  }
  return idx;
}

import type { ImageSettings, ImageStats } from './types';

interface OverlayPair {
  s: Partial<ImageSettings>;
  bg?: string;
}

// Must match CHAR_RAMPS so the char-preset dropdown stays in sync.
const ASCII = ' .:-=+*#%@';
const ASCII_ART = ' .,;-+=*#@';

export const EXAMPLE_OVERLAYS: Record<string, OverlayPair> = {
  cat: {
    s: {
      text: ASCII,
      charPreset: 'classic',
      fillMode: 'density',
      contrast: 45,
      sharpen: 35,
      threshold: 8,
      cols: 150,
    },
    bg: '#f7eed0',
  },

  desert: {
    s: {
      text: ASCII,
      charPreset: 'classic',
      fillMode: 'density',
      contrast: 35,
      sharpen: 25,
      threshold: 6,
      cols: 150,
    },
    bg: '#efe2c8',
  },

  duck: {
    s: {
      text: ASCII,
      charPreset: 'classic',
      fillMode: 'density',
      contrast: 50,
      sharpen: 40,
      threshold: 10,
      cols: 150,
    },
    bg: '#dde7f0',
  },

  flower: {
    s: {
      text: ASCII,
      charPreset: 'classic',
      fillMode: 'density',
      contrast: 45,
      sharpen: 35,
      threshold: 8,
      cols: 150,
    },
    bg: '#efe4e6',
  },

  clownfish: {
    s: {
      text: ASCII,
      charPreset: 'classic',
      fillMode: 'density',
      contrast: 55,
      sharpen: 40,
      threshold: 10,
      cols: 160,
    },
    bg: '#ece4d8',
  },

  mountain: {
    s: {
      text: ASCII_ART,
      charPreset: 'ascii-art',
      fillMode: 'density',
      contrast: 40,
      sharpen: 30,
      edge: 18,
      threshold: 6,
      cols: 160,
    },
    bg: '#ebe4dc',
  },

  saturn: {
    s: {
      text: ASCII,
      charPreset: 'classic',
      fillMode: 'density',
      contrast: 50,
      sharpen: 30,
      threshold: 22,
      cols: 170,
    },
    bg: '#000000',
  },

  tree: {
    s: {
      text: ASCII_ART,
      charPreset: 'ascii-art',
      fillMode: 'density',
      contrast: 45,
      sharpen: 35,
      edge: 15,
      threshold: 8,
      cols: 150,
    },
    bg: '#e6ecdc',
  },

  wave: {
    s: {
      text: ASCII,
      charPreset: 'classic',
      fillMode: 'density',
      contrast: 50,
      sharpen: 45,
      threshold: 10,
      cols: 150,
    },
    bg: '#dce6ec',
  },
};

export function deriveOverlayFromStats(stats: ImageStats): Partial<ImageSettings> {
  const out: Partial<ImageSettings> = {};

  // Baseline ASCII art tuning: keep the subject defined.
  out.text = ASCII;
  out.charPreset = 'classic';
  out.fillMode = 'density';

  // Subject pop: lift contrast when the image is flat, but always nudge it up
  // a bit so the subject pulls away from the background.
  if (stats.isFlat) {
    out.contrast = 45;
    out.sharpen = 40;
  } else if (stats.contrast < 0.22) {
    out.contrast = 35;
    out.sharpen = 30;
  } else {
    out.contrast = 25;
    out.sharpen = 25;
  }

  if (stats.isBusy) {
    out.cols = 160;
  } else if (stats.edgeDensity > 0.12) {
    out.cols = 150;
  } else {
    out.cols = 140;
  }

  if (stats.isDark) {
    out.threshold = 18;
    out.gamma = 1.15;
  } else if (stats.meanBrightness > 0.7) {
    out.threshold = 4;
    out.gamma = 0.9;
  } else {
    out.threshold = 8;
  }

  return out;
}

export function exampleOverlayFor(name: string): OverlayPair | null {
  return EXAMPLE_OVERLAYS[name] ?? null;
}

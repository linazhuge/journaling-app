export const EDITOR_FONTS = [
  { label: 'Lora',         css: 'var(--font-lora), serif' },
  { label: 'Merriweather', css: 'var(--font-merriweather), serif' },
  { label: 'Garamond',     css: 'var(--font-eb-garamond), serif' },
  { label: 'Typewriter',   css: 'var(--font-courier-prime), monospace' },
  { label: 'Georgia',      css: 'Georgia, serif' },
] as const;

export const INK_COLORS = [
  { label: 'Ink Black',  value: '#1a1a1a' },
  { label: 'Navy',       value: '#1e3a6e' },
  { label: 'Forest',     value: '#1a4731' },
  { label: 'Burgundy',   value: '#7a1e2e' },
  { label: 'Plum',       value: '#5b2667' },
  { label: 'Rust',       value: '#8b3a2a' },
  { label: 'Teal',       value: '#1a5f6a' },
  { label: 'Slate',      value: '#4a5568' },
] as const;

export const DEFAULT_FONT = EDITOR_FONTS[0];
export const DEFAULT_COLOR = INK_COLORS[0].value;
export const DEFAULT_SIZE = 15;
export const MIN_SIZE = 10;
export const MAX_SIZE = 24;

/** Fixed ruling on every page — never changes with font size. */
export const LINE_HEIGHT_PX = 32;

/** Page padding — shared between JournalPage (lines overlay) and PageEditor (click area). */
export const PAGE_PADDING_TOP = 24;
export const PAGE_PADDING_BOTTOM = 24;
export const PAGE_PADDING_LEFT = 56;
export const PAGE_PADDING_RIGHT = 24;

export const HABIT_TRACKER_DURATIONS = {
  '1yr': { label: '1 Year',  subtitle: '12 months', pageCount: 12 },
  '2yr': { label: '2 Years', subtitle: '24 months', pageCount: 24 },
  '5yr': { label: '5 Years', subtitle: '60 months', pageCount: 60 },
} as const;

export type HabitTrackerDuration = keyof typeof HABIT_TRACKER_DURATIONS;

export const JOURNAL_SIZES = {
  pocket: {
    label: 'Pocket',
    subtitle: 'Field Notes style',
    pageCount: 48,
    widthPx: 320,
    heightPx: 480,
  },
  standard: {
    label: 'Standard',
    subtitle: 'Moleskine style',
    pageCount: 240,
    widthPx: 440,
    heightPx: 640,
  },
  large: {
    label: 'Large',
    subtitle: 'A4 style',
    pageCount: 120,
    widthPx: 560,
    heightPx: 792,
  },
} as const;

export type JournalSize = keyof typeof JOURNAL_SIZES;

export const COVER_COLORS = [
  { label: 'Forest',   value: '#2d4a3e' },
  { label: 'Navy',     value: '#1e3a5f' },
  { label: 'Burgundy', value: '#6b2737' },
  { label: 'Slate',    value: '#3d4f5c' },
  { label: 'Rust',     value: '#8b3a2a' },
  { label: 'Plum',     value: '#4a2545' },
  { label: 'Tan',      value: '#8b7355' },
  { label: 'Charcoal', value: '#2c2c2c' },
];

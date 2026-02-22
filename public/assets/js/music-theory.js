// assets/js/music-theory.js

// ============================================================
// NOTE NORMALIZATION
// ============================================================
export function normalizeNote(n) {
  if (!n) return null;
  return n.replace(/##/g, "#").replace(/bb/g, "b").toUpperCase();
}

// ============================================================
// CHROMATIC SCALE (EXPORTED)
// ============================================================
export const CHROMATIC = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

// ============================================================
// INTERVAL MATH
// ============================================================
export function intervalBetween(note, tonic) {
  note = normalizeNote(note);
  tonic = normalizeNote(tonic);
  const i1 = CHROMATIC.indexOf(tonic);
  const i2 = CHROMATIC.indexOf(note);
  if (i1 < 0 || i2 < 0) return null;
  return (i2 - i1 + 12) % 12;
}

// ============================================================
// MAJOR SCALE
// ============================================================
export function getMajorScale(tonic) {
  tonic = normalizeNote(tonic);
  const idx = CHROMATIC.indexOf(tonic);
  if (idx < 0) return [];
  const intervals = [0, 2, 4, 5, 7, 9, 11];
  return intervals.map(i => CHROMATIC[(idx + i) % 12]);
}

// ============================================================
// MAJOR TRIAD
// ============================================================
export function getMajorTriad(root) {
  root = normalizeNote(root);
  const idx = CHROMATIC.indexOf(root);
  if (idx < 0) return [];
  return [
    CHROMATIC[idx],
    CHROMATIC[(idx + 4) % 12],
    CHROMATIC[(idx + 7) % 12]
  ];
}

// ============================================================
// MODE INTERVALS
// ============================================================
export const MODE_INTERVALS = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

// ============================================================
// FUNCTIONAL HARMONY: DEGREE ROOT
// ============================================================
// Example: tonic = C, degree = "ii" → returns "D"
export function getDegreeRoot(tonic, degree) {
  tonic = normalizeNote(tonic);

  const MAJOR_SCALE = getMajorScale(tonic);
  if (MAJOR_SCALE.length !== 7) return tonic;

  const map = {
    "I": 0,
    "ii": 1,
    "iii": 2,
    "IV": 3,
    "V": 4,
    "vi": 5,
    "vii°": 6
  };

  const idx = map[degree];
  if (idx === undefined) return tonic;

  return MAJOR_SCALE[idx];
}

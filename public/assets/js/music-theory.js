// assets/js/music-theory.js

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function normalizeNote(note) {
  return note.toUpperCase();
}

export function intervalBetween(note, tonic) {
  const a = CHROMATIC.indexOf(normalizeNote(note));
  const b = CHROMATIC.indexOf(normalizeNote(tonic));
  if (a === -1 || b === -1) return null;
  return (a - b + 12) % 12;
}

export function getMajorScale(tonic) {
  const intervals = [0, 2, 4, 5, 7, 9, 11];
  return intervals.map(i => noteAtInterval(tonic, i));
}

export function getMajorTriad(tonic) {
  const intervals = [0, 4, 7];
  return intervals.map(i => noteAtInterval(tonic, i));
}

export const MODE_INTERVALS = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

export function getModeNotes(tonic, modeName) {
  const intervals = MODE_INTERVALS[modeName];
  if (!intervals) return [];
  return intervals.map(i => noteAtInterval(tonic, i));
}

export function noteAtInterval(tonic, semitones) {
  const rootIndex = CHROMATIC.indexOf(normalizeNote(tonic));
  if (rootIndex === -1) return tonic;
  const idx = (rootIndex + semitones) % 12;
  return CHROMATIC[idx];
}

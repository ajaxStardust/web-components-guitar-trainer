// assets/js/music-theory.js

export const CHROMATIC = [
  "C","C#","D","D#","E","F",
  "F#","G","G#","A","A#","B"
];

export function getMajorScale(tonic) {
  const intervals = [0,2,4,5,7,9,11];
  const rootIndex = CHROMATIC.indexOf(tonic);
  return intervals.map(i => CHROMATIC[(rootIndex + i) % 12]);
}

export function getMajorTriad(tonic) {
  const rootIndex = CHROMATIC.indexOf(tonic);
  return [
    CHROMATIC[rootIndex],
    CHROMATIC[(rootIndex + 4) % 12],
    CHROMATIC[(rootIndex + 7) % 12]
  ];
}
// note-circle.js

import { NOTE_NAMES, FILL_LIT, FILL_INSIDE_POSITION, TONE_DOT_ALPHA } from "./constants.js";

export function renderNoteCircle({
  x,
  y,
  r,
  semitone,
  allowed,
  posKey,
  isLit,
  inPosition,
  revealOnClick,
  flashSemi
}) {
  if (!allowed.has(semitone)) return "";

  const note = NOTE_NAMES[semitone];
  const visible = !revealOnClick || isLit;

  // Default fill = semi-transparent (TONE_DOT_ALPHA) unless clicked/lit
  let fill;
  if (visible) {
    if (isLit) {
      fill = FILL_LIT;
    } else if (inPosition) {
      fill = FILL_INSIDE_POSITION;
    } else {
      fill = `rgba(255, 215, 0, ${TONE_DOT_ALPHA})`; // semi-transparent gold
    }
  } else {
    fill = "transparent";
  }

  const stroke = visible ? "#333" : "transparent";

  let svg = `
    <g data-note="${note}" data-string="${posKey.split("-")[0]}" data-fret="${posKey.split("-")[1]}">
      <circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}"/>
    </g>
  `;

  // Flash overlay (bright ring)
  if (flashSemi === semitone) {
    svg += `
      <circle cx="${x}" cy="${y}" r="${r * 1.27}" fill="none"
        stroke="#ff0000" stroke-width="2"/>
    `;
  }

  return svg;
}
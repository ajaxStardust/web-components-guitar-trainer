// chord-diagram.js
//
// Renders a standard chord-diagram view from the same selections as the theory table:
// vertical strings (6th left, 1st right), horizontal frets, colored dots by degree.
// Tones "behind" the tonic (same fret, higher string index) are hidden — index is on the root.
// Built automatically as the user clicks the fretboard.

const FLAT_ALIASES = { "D#": "Eb", "G#": "Ab", "A#": "Bb" };
const DEGREE_FILL = { 1: "#ffc107", 3: "#5b5b9e", 5: "#5a8c5a", 7: "#4a7a9e" };
const FILL_OTHER = "#9a9a9a";

function normalizeNote(note) {
  return FLAT_ALIASES[note] || note;
}

export class ChordDiagram extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.answerKey = [];
    this.context = null;
    this._selections = [];
  }

  setAnswerKey(answerKey, context) {
    this.answerKey = answerKey || [];
    this.context = context || null;
    this._selections = [];
    this.render();
  }

  setActiveNote(note, fromFretboard, position) {
    if (!note) return;
    const normalized = normalizeNote(note);
    if (fromFretboard && position != null && Number.isInteger(position.stringIndex) && Number.isInteger(position.fret)) {
      const already = this._selections.some(
        (s) => s.stringIndex === position.stringIndex && s.fret === position.fret
      );
      if (!already) {
        this._selections.push({
          stringIndex: position.stringIndex,
          fret: position.fret,
          note: normalized
        });
      }
    }
    this.render();
  }

  getNoteToDegreeMap() {
    const map = new Map();
    for (const entry of this.answerKey) {
      if (entry.note != null && entry.degree != null) map.set(entry.note, entry.degree);
    }
    return map;
  }

  /** Chord tones only (no grey): from type/chordForm in context, same as the view. */
  getAllowedDegrees() {
    const type = this.context && this.context.type;
    const chordForm = this.context && this.context.chordForm;
    if (type === "chord" && chordForm === "7th") return new Set([1, 3, 5, 7]);
    return new Set([1, 3, 5]);
  }

  /**
   * Index finger is on the tonic (degree 1). Find that position: lowest string that has the root.
   * Returns { stringIndex, fret } or null if no root in selections.
   */
  getTonicPosition(noteToDegree, allowedDegrees, minFret, maxFret) {
    let tonic = null;
    this._selections.forEach((sel) => {
      const { stringIndex, fret, note } = sel;
      if (fret < minFret || fret > maxFret) return;
      if (noteToDegree.get(note) !== 1) return;
      if (!allowedDegrees.has(1)) return;
      if (tonic == null || stringIndex < tonic.stringIndex) tonic = { stringIndex, fret };
    });
    return tonic;
  }

  /** True if this (stringIndex, fret) is behind the barre: one fret below the tonic, higher string index. Same fret as tonic is legal (the barre itself). */
  isBehindTonic(stringIndex, fret, tonicPosition) {
    if (tonicPosition == null) return false;
    return fret === tonicPosition.fret - 1 && stringIndex > tonicPosition.stringIndex;
  }

  render() {
    const noteToDegree = this.getNoteToDegreeMap();
    const allowedDegrees = this.getAllowedDegrees();
    const minFret = this.context?.positionFretRange?.minFret ?? 0;
    const maxFret = this.context?.positionFretRange?.maxFret ?? 4;
    const numFrets = Math.max(1, maxFret - minFret + 1);
    const numStrings = 6;

    const width = 140;
    const height = 100;
    const pad = 12;
    const gridW = width - 2 * pad;
    const gridH = height - 2 * pad;
    const colW = gridW / (numStrings - 1);
    const rowH = gridH / numFrets;

    const svgParts = [];
    svgParts.push(`<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="chord-svg">`);

    for (let s = 0; s < numStrings; s++) {
      const x = pad + s * colW;
      svgParts.push(`<line x1="${x}" y1="${pad}" x2="${x}" y2="${height - pad}" stroke="#444" stroke-width="1.5"/>`);
    }
    for (let r = 0; r <= numFrets; r++) {
      const y = pad + r * rowH;
      svgParts.push(`<line x1="${pad}" y1="${y}" x2="${width - pad}" y2="${y}" stroke="#444" stroke-width="1.5"/>`);
    }

    const firstFretLabel = minFret > 0 ? minFret : "";
    if (firstFretLabel) {
      svgParts.push(`<text x="4" y="${pad + rowH * 0.5}" font-size="9" fill="#555" text-anchor="start" dominant-baseline="central">${firstFretLabel}fr</text>`);
    }

    const tonicPosition = this.getTonicPosition(noteToDegree, allowedDegrees, minFret, maxFret);
    const r = Math.min(colW, rowH) * 0.35;
    this._selections.forEach((sel) => {
      const { stringIndex, fret, note } = sel;
      if (stringIndex < 0 || stringIndex >= numStrings) return;
      if (fret < minFret || fret > maxFret) return;
      const degree = noteToDegree.get(note);
      if (degree == null || !allowedDegrees.has(degree)) return;
      if (this.isBehindTonic(stringIndex, fret, tonicPosition)) return;
      const fill = DEGREE_FILL[degree] || FILL_OTHER;
      const cx = pad + stringIndex * colW;
      const cy = pad + (fret - minFret) * rowH + rowH / 2;
      svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#333" stroke-width="1"/>`);
    });

    svgParts.push(`</svg>`);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, sans-serif; }
        .chord-svg { background: #fafafa; border-radius: 6px; border: 1px solid #ddd; }
        .label { font-size: 0.85rem; color: #555; margin-bottom: 0.25rem; font-weight: 600; }
      </style>
      <div class="label">Chord shape</div>
      <div class="diagram-wrap">${svgParts.join("")}</div>
    `;
  }
}

customElements.define("chord-diagram", ChordDiagram);

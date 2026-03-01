// guitar-fretboard.js
//
// THIS CUSTOM ELEMENT IS <guitar-fretboard> IN THE HTML.
// main.js calls setAnswerKey(answerKey, context). answerKey = array of note objects from music-theory.js.

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const FLAT_ALIASES = { "D#": "Eb", "G#": "Ab", "A#": "Bb" };
const STRING_OPEN_SEMITONES = [4, 9, 2, 7, 11, 4];
const DEFAULT_FRETS = 15;
const POSITION_FRET_SPAN = 4;

function getPositionFretRange(degree, frets) {
  const deg = Number(degree) || 1;
  const minFret = Math.max(0, 2 + (deg - 1) * 2);
  const maxFret = Math.min(frets, minFret + POSITION_FRET_SPAN - 1);
  return { minFret, maxFret };
}

const FLASH_RING_STROKE = "#0066cc";
const FLASH_RING_STROKE_WIDTH = 4;
const DEGREE_FILL = { 1: "#ffc107", 3: "#5b5b9e", 5: "#5a8c5a" };
const FILL_OTHER = "#9a9a9a";
const FILL_LIT_OPACITY = 0.55;
const UNLIT_OPACITY = 0.35;
const OCTAVE_LIGHTNESS_STEP = 14;

function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  let r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function withOctaveLightness(hex, octave, minOctave, maxOctave) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const range = Math.max(1, maxOctave - minOctave);
  const boost = ((octave - minOctave) / range) * OCTAVE_LIGHTNESS_STEP;
  const l = Math.min(95, Math.max(20, hsl.l + boost));
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(l)}%)`;
}

export class GuitarFretboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.answerKey = [];
    this.context = null;
    this._clickHandlerAttached = false;
    this._flashTarget = null;
    this._flashTimeoutId = null;
    this._litPositions = new Set();
  }

  flashNote(noteName, position) {
    if (!noteName) return;
    const normalized = FLAT_ALIASES[noteName] || noteName;
    if (!NOTE_NAMES.includes(normalized)) return;
    if (position != null && Number.isInteger(position.stringIndex) && Number.isInteger(position.fret)) {
      this._litPositions.add(`${position.stringIndex}-${position.fret}`);
    }
    this._flashTarget = normalized;
    if (this._flashTimeoutId) clearTimeout(this._flashTimeoutId);
    this.render();
    this._flashTimeoutId = setTimeout(() => {
      this._flashTarget = null;
      this._flashTimeoutId = null;
      this.render();
    }, 500);
  }

  setAnswerKey(answerKey, context) {
    this.answerKey = Array.isArray(answerKey) ? answerKey : [];
    this.context = context || null;
    this._litPositions.clear();
    this.render();
  }

  render() {
    const fretsAttr = Number(this.getAttribute("frets"));
    const frets = Number.isFinite(fretsAttr) && fretsAttr > 0 ? fretsAttr : DEFAULT_FRETS;

    const showOnlyDegreeRoot = !!(this.context && this.context.showOnlyDegreeRoot);
    const allowed = showOnlyDegreeRoot && this.answerKey.length
      ? new Set([this.answerKey[0].semitones])
      : new Set(this.answerKey.map((n) => n.semitones));
    const flashSemi =
      this._flashTarget && NOTE_NAMES.includes(this._flashTarget)
        ? NOTE_NAMES.indexOf(this._flashTarget)
        : -1;

    const width = 1000;
    const height = 260;
    const numSegments = frets + 1;
    const fretWidth = width / numSegments;
    const stringHeight = height / (STRING_OPEN_SEMITONES.length + 1);
    const stringCount = STRING_OPEN_SEMITONES.length;
    const yForStringIndex = (sIdx) => (stringCount - sIdx) * stringHeight;
    const yMapleTop = yForStringIndex(stringCount - 1);
    const yMapleBottom = yForStringIndex(0);
    const litFretsByString = Array.from({ length: STRING_OPEN_SEMITONES.length }, () => []);
    this._litPositions.forEach((key) => {
      const dash = key.indexOf("-");
      if (dash < 0) return;
      const sIdx = parseInt(key.slice(0, dash), 10);
      const fret = parseInt(key.slice(dash + 1), 10);
      if (sIdx >= 0 && sIdx < litFretsByString.length && Number.isFinite(fret)) litFretsByString[sIdx].push(fret);
    });
    const fingerRangeByString = litFretsByString.map((frets) => {
      if (frets.length === 0) return null;
      const minF = Math.min(...frets);
      const maxF = Math.max(...frets);
      return maxF - minF + 1 === 4 ? { minFret: minF, maxFret: maxF } : null;
    });

    const svgParts = [];
    svgParts.push(`<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">`);

    const nutX = fretWidth;
    const headstockWidth = nutX;
    const nutStripWidth = 8;
    svgParts.push(
      `<rect x="0" y="${yMapleTop}" width="${headstockWidth}" height="${yMapleBottom - yMapleTop}" fill="#6b5344" stroke="#5a4a3a" stroke-width="1"/>`
    );
    svgParts.push(
      `<rect x="${nutX - nutStripWidth / 2}" y="${yMapleTop}" width="${nutStripWidth}" height="${yMapleBottom - yMapleTop}" fill="#e8e0d5" stroke="#c9bfb5" stroke-width="1"/>`
    );

    for (let f = 0; f <= frets; f++) {
      const x = (f + 1) * fretWidth;
      const strokeWidth = f === 0 ? 4 : 1;
      const stroke = f === 0 ? "#e8e0d5" : "#999";
      svgParts.push(
        `<line x1="${x}" y1="${yMapleTop}" x2="${x}" y2="${yMapleBottom}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      );
    }

    STRING_OPEN_SEMITONES.forEach((_, i) => {
      const y = yForStringIndex(i);
      svgParts.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#666" stroke-width="2"/>`);
    });

    const semToDegree = new Map();
    this.answerKey.forEach((n) => { if (n.semitones != null && n.degree != null) semToDegree.set(n.semitones, n.degree); });

    let minOctave = 99, maxOctave = 0;
    STRING_OPEN_SEMITONES.forEach((openSemi, sIdx) => {
      for (let f = 0; f <= frets; f++) {
        if (!allowed.has((openSemi + f) % 12)) continue;
        const o = Math.floor((openSemi + f) / 12);
        if (o < minOctave) minOctave = o;
        if (o > maxOctave) maxOctave = o;
      }
    });
    if (minOctave > maxOctave) minOctave = maxOctave;

    STRING_OPEN_SEMITONES.forEach((openSemi, sIdx) => {
      const y = yForStringIndex(sIdx);
      for (let f = 0; f <= frets; f++) {
        const x = (f + 0.5) * fretWidth;
        const sem = (openSemi + f) % 12;
        if (allowed.has(sem)) {
          const note = NOTE_NAMES[sem];
          const r = stringHeight * 0.3;
          const posKey = `${sIdx}-${f}`;
          const isLit = this._litPositions.has(posKey);
          const degree = semToDegree.get(sem);
          const litFill = degree != null && DEGREE_FILL[degree] ? DEGREE_FILL[degree] : FILL_OTHER;
          let fill = isLit ? litFill : "#ffdd66";
          if (isLit && litFill) {
            const octave = Math.floor((openSemi + f) / 12);
            fill = withOctaveLightness(litFill, octave, minOctave, maxOctave);
          }
          const isChordTone = degree === 1 || degree === 3 || degree === 5;
          const fillOpacity = isLit ? (isChordTone ? "1" : FILL_LIT_OPACITY) : UNLIT_OPACITY;
          const stroke = "#333";
          const strokeOpacity = isLit ? "1" : "0.5";
          const range = fingerRangeByString[sIdx];
          const finger = range && f >= range.minFret && f <= range.maxFret ? f - range.minFret + 1 : null;
          const showFinger = isLit && finger != null;
          const fingerFill = (degree === 3 || degree === 5) ? "#fff" : "#222";
          const fingerText = showFinger
            ? `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${Math.max(10, r * 1.2)}" font-weight="700" fill="${fingerFill}" pointer-events="none">${finger}</text>`
            : "";
          svgParts.push(
            `<g data-note="${note}" data-string="${sIdx}" data-fret="${f}"><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-opacity="${strokeOpacity}"/>${fingerText}</g>`
          );
        }
      }
    });

    if (flashSemi >= 0) {
      STRING_OPEN_SEMITONES.forEach((openSemi, sIdx) => {
        const y = yForStringIndex(sIdx);
        for (let f = 0; f <= frets; f++) {
          const x = (f + 0.5) * fretWidth;
          const sem = (openSemi + f) % 12;
          if (sem !== flashSemi) continue;
          svgParts.push(
            `<circle cx="${x}" cy="${y}" r="${stringHeight * 0.38}" fill="none" stroke="${FLASH_RING_STROKE}" stroke-width="${FLASH_RING_STROKE_WIDTH}"/>`
          );
        }
      });
    }

    svgParts.push(`</svg>`);

    const qualitySuffix = this.context && this.context.quality ? ` (${this.context.quality})` : "";
    const ctxLabel = this.context
      ? this.context.type === "chord"
        ? `Key of ${this.context.tonic}, Triad degree ${this.context.degree} (${this.context.modeName || ""})${qualitySuffix}`
        : `Key of ${this.context.tonic}, Mode: ${this.context.modeName || this.context.degree}${qualitySuffix}`
      : "No context";

    this.shadowRoot.innerHTML = `
      <style>:host{display:block;min-height:220px} svg{background:transparent} .ctx{color:#222;font-family:system-ui,sans-serif;margin-bottom:0.5rem;font-size:0.9rem}</style>
      ${ctxLabel}
      ${svgParts.join("")}
    `;

    if (!this._clickHandlerAttached) {
      this._clickHandlerAttached = true;
      this.shadowRoot.addEventListener("click", (evt) => {
        const group = evt.target.closest("g[data-note]");
        if (!group) return;
        const noteName = group.getAttribute("data-note");
        const stringIndex = group.getAttribute("data-string");
        const fret = group.getAttribute("data-fret");
        if (!noteName) return;
        const sIdx = stringIndex != null ? parseInt(stringIndex, 10) : null;
        const f = fret != null ? parseInt(fret, 10) : null;
        const detail = { note: noteName };
        if (sIdx != null && f != null) {
          detail.stringIndex = sIdx;
          detail.fret = f;
          detail.octave = Math.floor((STRING_OPEN_SEMITONES[sIdx] + f) / 12);
        }
        this.dispatchEvent(new CustomEvent("fret-note-click", { detail, bubbles: true, composed: true }));
      });
    }
  }
}

customElements.define("guitar-fretboard", GuitarFretboard);

// assets/js/guitar-fretboard.js

import { DEFAULT_STRINGS, ABSOLUTE_SCALE_MAP } from "./fretboard-data.js";
import { PIANO_KEYS } from "./piano-data.js";
import {
  getMajorScale,
  getMajorTriad,
  MODE_INTERVALS,
  intervalBetween,
  normalizeNote,
  getDegreeRoot
} from "./music-theory.js";
import { flashMatchingNotes } from "./note-flashing.js";

const MODE_NAMES = [
  "ionian",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian"
];

export class GuitarFretboard extends HTMLElement {
  static get observedAttributes() { return ["frets"]; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.strings = DEFAULT_STRINGS;
    this.frets = parseInt(this.getAttribute("frets"), 10) || 12;

    this.viewMode = "scale";     // "scale" | "chord" | mode-name
    this.currentTonic = "C";
    this.currentDegree = "I";    // for chord mode
    this.viewDetail = "mode";    // "mode" | "chord"

    this.scaleMap = ABSOLUTE_SCALE_MAP;
    this.pianoKeys = PIANO_KEYS;

    this.highlighted = new Set();
    this.activePerString = new Map();
    this.wrongIndicators = new Map();

    for (let s = 1; s <= this.strings; s++) {
      this.activePerString.set(s, new Set());
      this.wrongIndicators.set(s, new Set());
    }

    this.tempFlashNotes = new Set();
    this.tempFlashPitches = new Set();
  }

  connectedCallback() {
    this.recomputeHighlights();
    this.render();
    this.emitNoteChange();
  }

  // ============================================================
  // NEW: Unified API for controller
  // ============================================================
  setStructure({ type, mode, tonic }) {
    this.currentTonic = normalizeNote(tonic);

    if (type === "scale") {
      this.viewMode = "scale";
    }

    else if (type === "mode") {
      this.viewMode = mode; // ionian, dorian, etc.
    }

    else if (type === "chord") {
      this.viewMode = "chord";
      this.currentDegree = mode; // I, ii, iii, etc.
    }

    this.clearActive();
    this.recomputeHighlights();
    this.render();
    this.emitNoteChange();
  }

  // ============================================================
  // Legacy API (still used internally)
  // ============================================================
  setViewMode(mode) {
    this.viewMode = mode;
    this.clearActive();
    this.recomputeHighlights();
    this.render();
    this.emitNoteChange();
  }

  setViewDetail(detail) {
    this.viewDetail = detail === "chord" ? "chord" : "mode";
    this.render();
  }

  setTonic(note) {
    this.currentTonic = normalizeNote(note);
    this.clearActive();
    this.recomputeHighlights();
    this.render();
    this.emitNoteChange();
  }

  clearActive() {
    this.activePerString.forEach(set => set.clear());
  }

  // ============================================================
  // Highlight computation
  // ============================================================
  recomputeHighlights() {
    this.highlighted.clear();

    const tonic = this.currentTonic;

    // ---------------------------
    // SCALE VIEW
    // ---------------------------
    if (this.viewMode === "scale") {
      const notes = getMajorScale(tonic);
      this.applyHighlightList(notes);
      return;
    }

    // ---------------------------
    // CHORD VIEW (functional)
    // ---------------------------
    if (this.viewMode === "chord") {
      const root = getDegreeRoot(tonic, this.currentDegree);
      const notes = getMajorTriad(root);
      this.applyHighlightList(notes);
      return;
    }

    // ---------------------------
    // MODE VIEW
    // ---------------------------
    if (MODE_NAMES.includes(this.viewMode)) {
      const modeIntervals = MODE_INTERVALS[this.viewMode];
      if (!modeIntervals) return;

      let tonicFret = null;
      for (let f = 0; f <= this.frets; f++) {
        if (normalizeNote(this.scaleMap[6]?.[f]) === tonic) {
          tonicFret = f;
          break;
        }
      }
      if (tonicFret === null) return;

      const WINDOW = 4;

      for (let s = 1; s <= this.strings; s++) {
        for (let f = 0; f <= this.frets; f++) {
          if (Math.abs(f - tonicFret) > WINDOW) continue;

          const note = this.scaleMap[s]?.[f];
          if (!note) continue;

          const interval = intervalBetween(note, tonic);
          if (interval === null) continue;

          if (modeIntervals.includes(interval)) {
            this.highlighted.add(`${s}-${f}`);
          }
        }
      }
    }
  }

  // ============================================================
  // Helper: highlight all notes in list
  // ============================================================
  applyHighlightList(notes) {
    for (let s = 1; s <= this.strings; s++) {
      for (let f = 0; f <= this.frets; f++) {
        if (notes.includes(this.scaleMap[s]?.[f])) {
          this.highlighted.add(`${s}-${f}`);
        }
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "frets" && oldValue !== newValue) {
      const parsed = parseInt(newValue, 10);
      this.frets = Number.isFinite(parsed) ? parsed : 12;
      this.render();
      this.emitNoteChange();
    }
  }

  emitNoteChange() {
    const active = {};
    for (let s = 1; s <= this.strings; s++) {
      active[s] = [...this.activePerString.get(s)].sort((a, b) => a - b);
    }

    const detail = {
      activePerString: active,
      scaleMap: this.scaleMap,
      strings: this.strings,
      viewMode: this.viewMode,
      tonic: this.currentTonic,
      degree: this.currentDegree
    };

    window.dispatchEvent(new CustomEvent("notechange", { detail }));
  }

  // ============================================================
  // Interval-aware degree info
  // ============================================================
  getDegreeInfo(note) {
    const tonic = this.currentTonic;
    const modeIntervals =
      MODE_INTERVALS[this.viewMode] || MODE_INTERVALS["ionian"];

    const interval = intervalBetween(note, tonic);
    if (interval === null) return null;

    const idx = modeIntervals.indexOf(interval);
    if (idx === -1) return null;

    const degree = idx + 1;
    let quality = null;

    if (degree === 3) {
      if (interval === 4) quality = "major";
      if (interval === 3) quality = "minor";
    }

    return { degree, quality };
  }

  // ============================================================
  // Rendering
  // ============================================================
  render() {
    const width = 720;
    const height = 180;
    const svgNS = "http://www.w3.org/2000/svg";

    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; width: 100%; min-height: 200px; }
      svg { width: 100%; height: auto; background: #f9f3e8; border: 2px solid #a67c52; border-radius: 6px; user-select: none; }
      line.string { stroke: #555; stroke-width: 2; }
      line.fret { stroke: #777; stroke-width: 2; }
      line.nut { stroke: #000; stroke-width: 6; }

      circle.note-scale { fill: rgba(0,120,220,0.65); stroke: #222; stroke-width: 1.5; }
      circle.note-chord { fill: #cc6a00; stroke: #222; stroke-width: 1.5; }
      circle.note-tonic { fill: #d4a017; stroke: #222; stroke-width: 1.5; }

      circle.flash-dot { fill: #ff8c00; stroke: #222; stroke-width: 1.5; animation: flashBlink 0.5s ease-in-out; }

      circle.note-degree-1 { fill: #FFB000; stroke: #222; stroke-width: 1.5; }
      circle.note-degree-3-major { fill: #4CAF50; stroke: #222; stroke-width: 1.5; }
      circle.note-degree-3-minor { fill: #8BC34A; stroke: #222; stroke-width: 1.5; }
      circle.note-degree-5 { fill: #4A90E2; stroke: #222; stroke-width: 1.5; }
      circle.note-degree-greyed { fill: #CCCCCC; stroke: #666; stroke-width: 1.2; opacity: 0.7; }

      @keyframes flashBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
    `;
    this.shadowRoot.appendChild(style);

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const stringSpacing = height / (this.strings + 1);
    const fretSpacing = width / (this.frets + 1);

    for (let s = 1; s <= this.strings; s++) {
      const y = stringSpacing * s;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", 0);
      line.setAttribute("y1", y);
      line.setAttribute("x2", width);
      line.setAttribute("y2", y);
      line.setAttribute("class", "string");
      svg.appendChild(line);
    }

    for (let f = 0; f <= this.frets; f++) {
      const x = fretSpacing * (f + 1);
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", stringSpacing);
      line.setAttribute("x2", x);
      line.setAttribute("y2", height - stringSpacing);
      line.setAttribute("class", f === 0 ? "nut" : "fret");
      svg.appendChild(line);
    }

    for (let s = 1; s <= this.strings; s++) {
      for (let f = 0; f <= this.frets; f++) {
        const key = `${s}-${f}`;
        const cx = fretSpacing * (f + 0.5);
        const cy = stringSpacing * s;

        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 10);

        const note = this.scaleMap[s]?.[f];

        if (this.tempFlashNotes.has(key)) {
          circle.setAttribute("class", "flash-dot");
        }

        else if (this.activePerString.get(s).has(f)) {
          circle.setAttribute("class", "note-chord");
        }

        else if (this.highlighted.has(key)) {
          if (this.viewDetail === "chord" && MODE_NAMES.includes(this.viewMode)) {
            const info = note ? this.getDegreeInfo(note) : null;
            if (!info) {
              circle.setAttribute("class", "note-degree-greyed");
            } else {
              const { degree, quality } = info;
              if (degree === 1) circle.setAttribute("class", "note-degree-1");
              else if (degree === 3) {
                if (quality === "minor") circle.setAttribute("class", "note-degree-3-minor");
                else circle.setAttribute("class", "note-degree-3-major");
              }
              else if (degree === 5) circle.setAttribute("class", "note-degree-5");
              else circle.setAttribute("class", "note-degree-greyed");
            }
          } else {
            if (normalizeNote(note) === this.currentTonic) {
              circle.setAttribute("class", "note-tonic");
            } else {
              circle.setAttribute("class", "note-scale");
            }
          }
        }

        else {
          circle.setAttribute("fill", "transparent");
          circle.setAttribute("stroke", "transparent");
        }

        circle.addEventListener("click", () => {
          if (!this.highlighted.has(key)) return;

          const set = this.activePerString.get(s);
          set.has(f) ? set.delete(f) : set.add(f);

          flashMatchingNotes(this, note);
          this.emitNoteChange();
        });

        svg.appendChild(circle);
      }
    }

    this.shadowRoot.appendChild(svg);
  }
}

customElements.define("guitar-fretboard", GuitarFretboard);

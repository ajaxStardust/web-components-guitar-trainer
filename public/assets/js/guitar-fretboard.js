// assets/js/guitar-fretboard.js

import { DEFAULT_STRINGS, ABSOLUTE_SCALE_MAP } from "./fretboard-data.js";
import { PIANO_KEYS } from "./piano-data.js";
import { getMajorScale, getMajorTriad } from "./music-theory.js";

export class GuitarFretboard extends HTMLElement {
  static get observedAttributes() { return ["frets"]; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.strings = DEFAULT_STRINGS;
    this.frets = parseInt(this.getAttribute("frets"), 10) || 12;

    this.viewMode = "mode";
    this.currentTonic = "C";

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

    this.recomputeHighlights();
    this.render();
    this.emitNoteChange();
  }

  // ---------- PUBLIC API ----------

  setViewMode(mode) {
    this.viewMode = mode;
    this.clearActive();
    this.recomputeHighlights();
    this.render();
    this.emitNoteChange();
  }

  setTonic(note) {
    this.currentTonic = note;
    this.clearActive();
    this.recomputeHighlights();
    this.render();
    this.emitNoteChange();
  }

  // ---------- STATE ----------

  clearActive() {
    this.activePerString.forEach(set => set.clear());
  }

  recomputeHighlights() {
    const notes =
      this.viewMode === "chord"
        ? getMajorTriad(this.currentTonic)
        : getMajorScale(this.currentTonic);

    this.highlighted.clear();

    for (let s = 1; s <= this.strings; s++) {
      for (let f = 0; f <= this.frets; f++) {
        if (notes.includes(this.scaleMap[s]?.[f])) {
          this.highlighted.add(`${s}-${f}`);
        }
      }
    }
  }

  // ---------- LIFECYCLE ----------

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
      active[s] = [...this.activePerString.get(s)].sort((a,b)=>a-b);
    }

    this.dispatchEvent(new CustomEvent("notechange", {
      detail: {
        activePerString: active,
        scaleMap: this.scaleMap,
        strings: this.strings
      },
      bubbles: true,
      composed: true
    }));
  }

  // ---------- RENDER ----------

// ---------- RENDER ----------
render() {
  const { strings, frets, highlighted } = this;

  // Generate HTML for each string
  let html = `<style>
    :host { display: inline-block; font-family: sans-serif; }
    .string { display: flex; margin-bottom: 2px; }
    .fret { width: 30px; height: 30px; border: 1px solid #aaa; display: flex; 
            align-items: center; justify-content: center; cursor: pointer; }
    .highlight { background-color: yellow; }
  </style>`;

  for (let s = 1; s <= strings; s++) {
    html += `<div class="string">`;
    for (let f = 0; f <= frets; f++) {
      const id = `${s}-${f}`;
      const isHighlighted = highlighted.has(id) ? 'highlight' : '';
      html += `<div class="fret ${isHighlighted}" data-string="${s}" data-fret="${f}">
                 ${this.scaleMap[s][f]}
               </div>`;
    }
    html += `</div>`;
  }

  this.shadowRoot.innerHTML = html;
}
}

customElements.define("guitar-fretboard", GuitarFretboard);
// assets/js/guitar-fretboard.js

import { DEFAULT_STRINGS, ABSOLUTE_SCALE_MAP } from "./fretboard-data.js";
import { PIANO_KEYS } from "./piano-data.js";
import { getMajorScale, getMajorTriad } from "./music-theory.js";
import { flashMatchingNotes } from "./note-flashing.js";

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
  }

  connectedCallback() {
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
    this.currentTonic = note.toUpperCase();   // FIXED
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

  // ---------- RENDER (SVG VERSION) ----------

  render() {
    const width = 720;
    const height = 180;
    const svgNS = "http://www.w3.org/2000/svg";

    // Reset shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }

        svg {
          background: #f9f3e8;              /* light maple */
          border: 2px solid #a67c52;        /* darker outline */
          border-radius: 6px;
          user-select: none;
        }

        line.string {
          stroke: #555;
          stroke-width: 2;
        }

        line.fret {
          stroke: #777;
          stroke-width: 2;
        }

        line.nut {
          stroke: #000;
          stroke-width: 6;
        }

        circle.note-scale {
          fill: rgba(0,120,220,0.65);
          stroke: #222;
          stroke-width: 1.5;
        }

        circle.note-chord {
          fill: #cc6a00;
          stroke: #222;
          stroke-width: 1.5;
        }

        circle.note-tonic {
          fill: #d4a017;
          stroke: #222;
          stroke-width: 1.5;
        }

        circle.flash-dot {
          fill: #ff8c00;
          stroke: #222;
          stroke-width: 1.5;
          animation: flashBlink 0.5s ease-in-out;
        }

        @keyframes flashBlink {
          0%,100% { opacity: 1; }
          50% { opacity: 0; }
        }
      </style>
    `;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const stringSpacing = height / (this.strings + 1);
    const fretSpacing = width / (this.frets + 1);

    // --- STRINGS ---
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

    // --- FRETS ---
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

    // --- NOTES ---
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

        // Flashing
        if (this.tempFlashNotes.has(key)) {
          circle.setAttribute("class", "flash-dot");
        }
        // Active (selected)
        else if (this.activePerString.get(s).has(f)) {
          circle.setAttribute("class", "note-chord");
        }
        // Highlighted scale/chord tones
        else if (this.highlighted.has(key)) {
          if (note === this.currentTonic) {
            circle.setAttribute("class", "note-tonic");
          } else {
            circle.setAttribute("class", this.viewMode === "chord" ? "note-chord" : "note-scale");
          }
        }
        // Default (transparent)
        else {
          circle.setAttribute("fill", "transparent");
          circle.setAttribute("stroke", "transparent");
        }

        // Click handler
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

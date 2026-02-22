// assets/js/piano-keyboard.js

import {
  normalizeNote,
  CHROMATIC,
  getMajorScale,
  getMajorTriad,
  MODE_INTERVALS,
  getDegreeRoot
} from "./music-theory.js";

export class PianoKeyboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.highlighted = new Set();
    this.tempFlash = new Set();
  }

  connectedCallback() {
    this.render();
  }

  // Unified API: updateHighlights({ type, mode, tonic })
  updateHighlights({ type, mode, tonic }) {
    tonic = normalizeNote(tonic);
    const allowed = new Set();

    if (type === "scale") {
      const notes = getMajorScale(tonic);
      notes.forEach(n => allowed.add(n));
    }

    else if (type === "mode") {
      const intervals = MODE_INTERVALS[mode] || MODE_INTERVALS["ionian"];
      const tonicIndex = CHROMATIC.indexOf(tonic);
      if (tonicIndex >= 0) {
        intervals.forEach(i => {
          const idx = (tonicIndex + i) % 12;
          allowed.add(CHROMATIC[idx]);
        });
      }
    }

    else if (type === "chord") {
      const root = getDegreeRoot(tonic, mode);
      const notes = getMajorTriad(root);
      notes.forEach(n => allowed.add(n));
    }

    this.highlighted = allowed;
    this.render();
  }

  flash(note) {
    const key = normalizeNote(note);
    this.tempFlash.add(key);
    this.render();

    setTimeout(() => {
      this.tempFlash.clear();
      this.render();
    }, 250);
  }

  render() {
    const style = `
      .keyboard {
        position: relative;
        width: max-content;
        height: 140px;
        display: flex;
        background: #ccc;
        padding: 10px;
        border-radius: 6px;
      }

      .white-key {
        position: relative;
        width: 40px;
        height: 140px;
        background: #fff;
        border: 1px solid #333;
        box-sizing: border-box;
        margin-right: -1px;
      }

      .black-key {
        position: absolute;
        width: 28px;
        height: 90px;
        background: #000;
        border: 1px solid #222;
        top: 0;
        z-index: 10;
        border-radius: 0 0 3px 3px;
      }

      .highlight {
        background: #4aa3ff !important;
      }

      .flash {
        background: #ff8c00 !important;
      }
    `;

    const wrapper = document.createElement("div");
    wrapper.className = "keyboard";

    const whiteOrder = ["C", "D", "E", "F", "G", "A", "B"];
    const whitePos = {};

    // WHITE KEYS
    whiteOrder.forEach((note, i) => {
      const div = document.createElement("div");
      div.className = "white-key";

      if (this.tempFlash.has(note)) div.classList.add("flash");
      else if (this.highlighted.has(note)) div.classList.add("highlight");

      wrapper.appendChild(div);
      whitePos[note] = i * 40;
    });

    // BLACK KEYS
    const blackMap = {
      "C#": "C",
      "D#": "D",
      "F#": "F",
      "G#": "G",
      "A#": "A"
    };

    Object.entries(blackMap).forEach(([black, white]) => {
      const x = whitePos[white] + 28;

      const div = document.createElement("div");
      div.className = "black-key";
      div.style.left = `${x}px`;

      if (this.tempFlash.has(black)) div.classList.add("flash");
      else if (this.highlighted.has(black)) div.classList.add("highlight");

      wrapper.appendChild(div);
    });

    this.shadowRoot.innerHTML = `<style>${style}</style>`;
    this.shadowRoot.appendChild(wrapper);
  }
}

customElements.define("piano-keyboard", PianoKeyboard);

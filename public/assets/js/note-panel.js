// assets/js/note-panel.js

import {
  CHROMATIC,
  MODE_INTERVALS,
  getMajorTriad,
  getMajorScale,
  getDegreeRoot
} from "./music-theory.js";

export class NotePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.notes = [];
    this.tonic = "C";
    this.mode = "ionian";
    this.type = "scale";
  }

  connectedCallback() {
    this.render();
  }

  // Unified API: update(tonic, mode, type)
  update(tonic, mode, type) {
    this.tonic = tonic;
    this.mode = mode;
    this.type = type;

    if (type === "chord") {
      const root = getDegreeRoot(tonic, mode);
      this.notes = getMajorTriad(root);
    } else if (type === "scale") {
      this.notes = getMajorScale(tonic);
    } else if (type === "mode") {
      const intervals = MODE_INTERVALS[mode];
      const rootIndex = CHROMATIC.indexOf(tonic);
      if (intervals && rootIndex >= 0) {
        this.notes = intervals.map(i => CHROMATIC[(rootIndex + i) % 12]);
      } else {
        this.notes = [];
      }
    } else {
      this.notes = [];
    }

    this.render();
  }

  render() {
    const style = `
      :host {
        display: block;
        padding: 0.5rem 1rem;
        background: #fff8e6;
        border: 1px solid #d2b48c;
        border-radius: 6px;
        font-family: system-ui, sans-serif;
        margin-top: 0.5rem;
      }
      .title {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }
      .notes {
        display: flex;
        gap: 0.5rem;
        font-size: 1.1rem;
      }
    `;

    let title;
    if (this.type === "chord") {
      title = `Chord Tones (1–3–5 of ${this.mode} degree):`;
    } else if (this.type === "scale") {
      title = "Major Scale Notes:";
    } else if (this.type === "mode") {
      const name = this.mode[0].toUpperCase() + this.mode.slice(1);
      title = `${name} Mode Notes:`;
    } else {
      title = "Notes:";
    }

    const notesHTML = this.notes.map(n => `<span>${n}</span>`).join("");

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <div class="title">${title}</div>
      <div class="notes">${notesHTML}</div>
    `;
  }
}

customElements.define("note-panel", NotePanel);

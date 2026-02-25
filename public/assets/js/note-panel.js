// note-panel.js
//
// LLM NOTE (QUIZ / HANGMAN STYLE):
// This panel is degree-first. The Note column is HIDDEN until the student
// selects a fret coordinate that sounds that degree. Only then do we "reveal"
// the note name next to that degree. Reveals persist until key/mode/degree
// changes. Only fretboard clicks reveal; piano clicks do not (quiz = pick on neck).
// Keep the Degree column always visible; note names appear only after selection.

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const FLAT_ALIASES = { "D#": "Eb", "G#": "Ab", "A#": "Bb" };

function normalizeNote(note) {
  return FLAT_ALIASES[note] || note;
}

export class NotePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.answerKey = [];
    this.context = null;
    // LLM NOTE: Degrees the student has "revealed" by clicking that note on the fretboard.
    // Cleared on setAnswerKey (new key/mode = fresh quiz).
    this._revealedDegrees = new Set();
    // LLM NOTE: Degree of the note they just clicked = "currently selected" row.
    this._activeDegree = null;
    // LLM NOTE: When they click a note whose degree was already revealed (e.g. past the
    // octave), we flash this degree so they see "already guessed." Cleared after REPEAT_FLASH_MS.
    this._flashedDegree = null;
    this._flashTimeoutId = null;
  }

  setAnswerKey(answerKey, context) {
    this.answerKey = answerKey || [];
    this.context = context || null;
    this._revealedDegrees.clear();
    this._activeDegree = null;
    this._flashedDegree = null;
    if (this._flashTimeoutId) {
      clearTimeout(this._flashTimeoutId);
      this._flashTimeoutId = null;
    }
    this.render();
  }

  // LLM NOTE:
  // When the student clicks a note we set _activeDegree (current row highlight).
  // If fromFretboard we reveal that degree. If that degree was already revealed
  // (e.g. they passed the octave and hit the same tone again), we flash that row
  // so they see "already guessed" (different color for REPEAT_FLASH_MS).
  setActiveNote(note, fromFretboard) {
    if (!note) return;
    const normalized = normalizeNote(note);
    const found = this.answerKey.length ? this.answerKey.find((n) => n.note === normalized) : null;
    if (found) {
      this._activeDegree = found.degree;
      if (fromFretboard) {
        const alreadyRevealed = this._revealedDegrees.has(found.degree);
        this._revealedDegrees.add(found.degree);
        if (alreadyRevealed) {
          this._flashedDegree = found.degree;
          if (this._flashTimeoutId) clearTimeout(this._flashTimeoutId);
          this.render();
          this._flashTimeoutId = setTimeout(() => {
            this._flashedDegree = null;
            this._flashTimeoutId = null;
            this.render();
          }, 500);
        }
      }
    }
    this.render();
  }

  render() {
    const rows = this.answerKey.map((n) => {
      const revealed = this._revealedDegrees.has(n.degree);
      const isActive = this._activeDegree === n.degree;
      const isRepeatedFlash = this._flashedDegree === n.degree;
      const noteDisplay = revealed ? n.note : "?";
      const cls = [
        revealed && "revealed-row",
        isActive && "active-row",
        isRepeatedFlash && "repeated-flash"
      ].filter(Boolean).join(" ");
      return `<tr class="${cls}">
                <td>${n.degree}</td>
                <td>${noteDisplay}</td>
              </tr>`;
    }).join("");

    const qualitySuffix = this.context && this.context.quality ? ` (${this.context.quality})` : "";
    const ctxLabel = this.context
      ? this.context.type === "chord"
        ? `Key of ${this.context.tonic}, Triad degree ${this.context.degree} (${this.context.modeName || ""})${qualitySuffix}`
        : `Key of ${this.context.tonic}, Mode: ${this.context.modeName || this.context.degree}${qualitySuffix}`
      : "No context";

    this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: system-ui, sans-serif;
                    color: #222;              /* dark text on light card from outer CSS */
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 0.5rem;
                    background: #ffffff;      /* ensure strong contrast */
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 0.35rem 0.6rem;
                    text-align: center;
                    font-size: 0.9rem;
                }
                th {
                    background: #333;
                    color: #f5f5f5;
                    font-weight: 600;
                }
                tbody tr:nth-child(even):not(.revealed-row) {
                    background: #f5f5f5;
                }
                .revealed-row {
                    background: #e8f0e8;     /* subtle "lit" for revealed (solved) row */
                    color: #222;
                    font-weight: 600;
                }
                .active-row {
                    background: #0074D9;     /* current selection highlight (note panel) */
                    color: #fff;
                    font-weight: 600;
                }
                .repeated-flash {
                    background: #c9762e;      /* already guessed (e.g. past octave) – flash */
                    color: #fff;
                    font-weight: 600;
                }
            </style>
            <div>${ctxLabel}</div>
            <table>
                <thead>
                    <tr>
                        <th>Degree</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
  }
}

customElements.define("note-panel", NotePanel);

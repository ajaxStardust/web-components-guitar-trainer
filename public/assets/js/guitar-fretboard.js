// guitar-fretboard.js
//
// ─────────────────────────────────────────────────────────────
//  LLM-FRIENDLY NOTE — READ THIS BEFORE TOUCHING ANYTHING
// ─────────────────────────────────────────────────────────────
//
//  THIS CUSTOM ELEMENT IS <guitar-fretboard> IN THE HTML.
//
//  CONTRACT WITH THE REST OF THE APP:
//
//    • main.js WILL CALL:
//          guitarElement.setAnswerKey(answerKey, context)
//
//    • answerKey IS AN ARRAY OF NOTE OBJECTS FROM music-theory.js:
//          {
//              degree: <1–7>,
//              relSemitones: <0–11>,
//              semitones: <0–11>,
//              note: <string>
//          }
//
//    • context IS AN OBJECT:
//          {
//              type: "mode" | "chord",
//              degree: <number>,
//              tonic: <string>
//          }
//
//  DO NOT:
//    • Rename setAnswerKey
//    • Change its parameter order
//    • Expect any other shape for answerKey or context
//
//  RENDERING RULE:
//
//    • Highlight any fret whose semitone is in answerKey.semitones
//    • Show NOTE NAMES on highlighted frets
//
//  If you change this behavior, the trainer stops being predictable.
//
// ─────────────────────────────────────────────────────────────

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
// LLM NOTE (flashNote): NOTE_NAMES uses flats for 3, 8, 10 (Eb, Ab, Bb). If the
// UI or piano sends sharp spellings (D#, G#, A#), flashNote would reject them.
// FLAT_ALIASES normalizes to the form in NOTE_NAMES so the flash overlay always
// runs. Do not remove or flash-on-click will fail for those enharmonics.
const FLAT_ALIASES = { "D#": "Eb", "G#": "Ab", "A#": "Bb" };

// LLM NOTE: Standard tuning E A D G B E (low to high).
// Values are absolute semitone classes relative to C.
const STRING_OPEN_SEMITONES = [4, 9, 2, 7, 11, 4]; // E A D G B E

// LLM NOTE: This is the visual fret range. You can change it via attribute if needed.
const DEFAULT_FRETS = 15;

// LLM NOTE (PEDAGOGY / POSITION):
// "Position" = the fret window where the student's eyes should focus for this degree
// (e.g. G Ionian in "the box" = frets 2–5). We use rsync-style include logic:
// we draw ALL dots that are in the mode/triad; we then INCLUDE (for focus styling)
// only those dots that also lie inside the position window. So: full set first,
// then a subset gets the focus hue — we never exclude dots from being drawn.
const POSITION_FRET_SPAN = 4;

function getPositionFretRange(degree, frets) {
  const deg = Number(degree) || 1;
  const minFret = Math.max(0, 2 + (deg - 1) * 2);
  const maxFret = Math.min(frets, minFret + POSITION_FRET_SPAN - 1);
  return { minFret, maxFret };
}

// Idle in-scale dots (outside position): normal yellow. Inside position: focus (brighter).
const FILL_OUTSIDE_POSITION = "#ffbb33";
const FILL_INSIDE_POSITION = "#ffdd66";

// LLM NOTE (PEDAGOGY — "path up the neck"): Only the exact fret coordinate the
// user clicked stays "lit" (filled dot, not an outline). Dim red-grey, not pink.
const FILL_LIT = "#8a7575";

// LLM NOTE: Transient flash = bright ring on all occurrences of the clicked note.
const FLASH_RING_STROKE = "#0066cc";
const FLASH_RING_STROKE_WIDTH = 4;

export class GuitarFretboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.answerKey = [];
    this.context = null;
    this._clickHandlerAttached = false; // LLM NOTE: ensure we only wire events once.
    // LLM NOTE: _flashTarget = note currently "flashing" (bright ring); cleared after
    // ~500ms. _litPositions = Set of "stringIndex-fret" for the exact dots the user
    // clicked; those dots stay filled with FILL_LIT until setAnswerKey. Only fretboard
    // clicks add to _litPositions; piano clicks only flash.
    this._flashTarget = null;
    this._flashTimeoutId = null;
    this._litPositions = new Set();
  }

  // ─────────────────────────────────────────────────────────
  //  OPTIONAL PUBLIC API — flashNote(noteName)
  // ─────────────────────────────────────────────────────────
  //
  //  LLM NOTE (PEDAGOGY — flash + path up the neck):
  //  • This method is OPTIONAL and purely visual; it does NOT change answerKey or context.
  //  • On click: (1) the note FLASHES (bright ring on all occurrences, ~500ms). (2) only
  //    when position is provided (fretboard click), that exact coordinate is added to
  //    _litPositions and stays "lit" (dim red-grey filled dot). Piano clicks only flash.
  //  • position: optional { stringIndex, fret } from fret-note-click detail.
  //  • _litPositions is cleared only when setAnswerKey runs (new key/mode/degree).
  //
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

  // ─────────────────────────────────────────────────────────
  //  PUBLIC API — DO NOT RENAME
  // ─────────────────────────────────────────────────────────
  //
  //  main.js calls:
  //      guitar.setAnswerKey(answerKey, context)
  //
  setAnswerKey(answerKey, context) {
    this.answerKey = Array.isArray(answerKey) ? answerKey : [];
    this.context = context || null;
    // LLM NOTE: New key/mode/degree = fresh "path"; clear lit positions.
    this._litPositions.clear();
    this.render();
  }

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  render() {
    const fretsAttr = Number(this.getAttribute("frets"));
    const frets = Number.isFinite(fretsAttr) && fretsAttr > 0 ? fretsAttr : DEFAULT_FRETS;

    // LLM NOTE:
    // allowed = semitone classes to show. When context.showOnlyDegreeRoot (Display:
    // "Degree only"), only the root of the current mode is shown (rsync-include style).
    const showOnlyDegreeRoot = !!(this.context && this.context.showOnlyDegreeRoot);
    const allowed = showOnlyDegreeRoot && this.answerKey.length
      ? new Set([this.answerKey[0].semitones])
      : new Set(this.answerKey.map((n) => n.semitones));
    // LLM NOTE: flashSemi = transient bright ring for the note just clicked.
    const flashSemi =
      this._flashTarget && NOTE_NAMES.includes(this._flashTarget)
        ? NOTE_NAMES.indexOf(this._flashTarget)
        : -1;

    const width = 1000;
    const height = 260;
    // Cosmetic: nut is drawn one fret-width in, so the board starts at 0 and the nut
    // doesn't imply a "-1" fret (open is segment 0, nut is its right edge).
    const numSegments = frets + 1; // open + frets 1..N
    const fretWidth = width / numSegments;
    const stringHeight = height / (STRING_OPEN_SEMITONES.length + 1);
    const stringCount = STRING_OPEN_SEMITONES.length;

    // LLM NOTE (PEDAGOGY / ORIENTATION):
    // The tuning array above is ordered LOW → HIGH (6th string to 1st string).
    // Visually, we MUST draw lower tones closer to the bottom of the viewport.
    // Therefore: string index 0 (low E) is drawn at the BOTTOM, not the top.
    const yForStringIndex = (sIdx) => (stringCount - sIdx) * stringHeight;

    // Vertical extent of the imaginary maple: frets run only between top and bottom string.
    const yMapleTop = yForStringIndex(stringCount - 1);
    const yMapleBottom = yForStringIndex(0);

    // Position window for "include" focus: only dots inside this fret range get focus fill.
    const degree = this.context && this.context.degree != null ? this.context.degree : 1;
    const { minFret, maxFret } = getPositionFretRange(degree, frets);

    const svgParts = [];
    svgParts.push(`<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">`);

    // LLM NOTE (NUT COSMETICS): Headstock + nut like a real guitar (e.g. Martin). The area
    // where the fretboard meets the nut is a distinct headstock zone and a nut strip,
    // not a dot color change. Dots stay the same; the nut/headstock is visually separate.
    const nutX = fretWidth; // nut is the first segment boundary
    const headstockWidth = nutX;
    const nutStripWidth = 8;
    svgParts.push(
      `<rect x="0" y="${yMapleTop}" width="${headstockWidth}" height="${yMapleBottom - yMapleTop}" fill="#6b5344" stroke="#5a4a3a" stroke-width="1"/>`
    );
    svgParts.push(
      `<rect x="${nutX - nutStripWidth / 2}" y="${yMapleTop}" width="${nutStripWidth}" height="${yMapleBottom - yMapleTop}" fill="#e8e0d5" stroke="#c9bfb5" stroke-width="1"/>`
    );

    // Frets: nut at first segment boundary (one fret over), then fret 1..N.
    // Frets do not extend beyond the maple (string band); they stay between top and bottom string.
    for (let f = 0; f <= frets; f++) {
      const x = (f + 1) * fretWidth;
      const strokeWidth = f === 0 ? 4 : 1;
      const stroke = f === 0 ? "#e8e0d5" : "#999";
      svgParts.push(
        `<line x1="${x}" y1="${yMapleTop}" x2="${x}" y2="${yMapleBottom}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
      );
    }

    // Strings
    STRING_OPEN_SEMITONES.forEach((_, i) => {
      const y = yForStringIndex(i);
      svgParts.push(
        `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#666" stroke-width="2"/>`
      );
    });

    // Notes
    // LLM NOTE (PEDAGOGY):
    // We do NOT print note names on the fretboard itself. The student should
    // discover note identities by cross‑referencing the piano + table. We
    // still encode the note name as data-note for click handling, but keep
    // the visual dots anonymous.
    // LLM NOTE (revealOnClick): When context.revealOnClick is true, dots are hidden until
    // the user clicks that fret; we still draw transparent clickable circles so they can select.
    const revealOnClick = !!(this.context && this.context.revealOnClick);

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
          const inPosition = f >= minFret && f <= maxFret;
          const visible = !revealOnClick || isLit;
          const fill = visible
            ? (isLit ? FILL_LIT : (inPosition ? FILL_INSIDE_POSITION : FILL_OUTSIDE_POSITION))
            : "transparent";
          const stroke = visible ? "#333" : "transparent";

          svgParts.push(`
                        <g data-note="${note}" data-string="${sIdx}" data-fret="${f}">
                            <circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}"/>
                        </g>
                    `);
        }
      }
    });

    // LLM NOTE (FLASH OVERLAY): Transient bright ring for the note just clicked.
    if (flashSemi >= 0) {
      STRING_OPEN_SEMITONES.forEach((openSemi, sIdx) => {
        const y = yForStringIndex(sIdx);
        for (let f = 0; f <= frets; f++) {
          const x = (f + 0.5) * fretWidth;
          const sem = (openSemi + f) % 12;
          if (sem !== flashSemi) continue;
          svgParts.push(`
                        <circle cx="${x}" cy="${y}" r="${stringHeight * 0.38}"
                                fill="none" stroke="${FLASH_RING_STROKE}" stroke-width="${FLASH_RING_STROKE_WIDTH}"/>
                    `);
        }
      });
    }

    svgParts.push(`</svg>`);

    const qualitySuffix = this.context && this.context.quality ? ` (${this.context.quality})` : "";
    const ctxLabel = this.context
      ? this.context.type === "chord"
        ? `<div class="ctx">Key of ${this.context.tonic}, Triad degree ${this.context.degree} (${this.context.modeName || ""})${qualitySuffix}</div>`
        : `<div class="ctx">Key of ${this.context.tonic}, Mode: ${this.context.modeName || this.context.degree}${qualitySuffix}</div>`
      : `<div class="ctx">No context</div>`;

    this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    min-height: 220px;
                }
                /* LLM NOTE:
                   The SVG background is transparent on purpose.
                   The "fretboard" is defined by strings + frets only.
                   Fret markers live beneath this region for clear pedagogy. */
                svg {
                    background: transparent;
                }
                text {
                    font-family: system-ui, sans-serif;
                }
                .ctx {
                    color: #222;
                    font-family: system-ui, sans-serif;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }
            </style>
            ${ctxLabel}
            ${svgParts.join("")}
        `;

    // LLM NOTE:
    // Click handling: event delegation on the shadow root. We pass note plus
    // stringIndex and fret so main.js can call flashNote(note, { stringIndex, fret })
    // and only that coordinate stays "lit" (dim red-grey dot).
    if (!this._clickHandlerAttached) {
      this._clickHandlerAttached = true;
      this.shadowRoot.addEventListener("click", (evt) => {
        const target = evt.target;
        if (!target) return;

        const group = target.closest("g[data-note]");
        if (!group) return;

        const noteName = group.getAttribute("data-note");
        const stringIndex = group.getAttribute("data-string");
        const fret = group.getAttribute("data-fret");
        if (!noteName) return;

        const detail = { note: noteName };
        if (stringIndex !== null && stringIndex !== undefined && fret !== null && fret !== undefined) {
          detail.stringIndex = parseInt(stringIndex, 10);
          detail.fret = parseInt(fret, 10);
        }
        this.dispatchEvent(
          new CustomEvent("fret-note-click", {
            detail,
            bubbles: true,
            composed: true
          })
        );
      });
    }
  }
}

customElements.define("guitar-fretboard", GuitarFretboard);

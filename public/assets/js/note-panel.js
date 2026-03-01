// note-panel.js
//
// Renders selected fretboard tones as a table: one row per string (6→1),
// columns String + Tone(s) in fret order. Built as HTML directly.

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const FLAT_ALIASES = { "D#": "Eb", "G#": "Ab", "A#": "Bb" };
const DEGREE_FILL = { 1: "#ffc107", 3: "#5b5b9e", 5: "#5a8c5a" };
const FILL_OTHER = "#6e6e6e";
const FILL_OTHER_BORDER = "#5a7a9e";
const OCTAVE_LIGHTNESS_STEP = 14;

function normalizeNote(note) {
  return FLAT_ALIASES[note] || note;
}

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
  const r = Math.max(1, maxOctave - minOctave);
  const boost = ((octave - minOctave) / r) * OCTAVE_LIGHTNESS_STEP;
  const l = Math.min(95, Math.max(20, hsl.l + boost));
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(l)}%)`;
}

function stringDisplay(stringIndex) {
  return 6 - Number(stringIndex);
}

function escapeHtml(text) {
  const s = String(text);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export class NotePanel extends HTMLElement {
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
          note: normalized,
          octave: typeof position.octave === "number" ? position.octave : undefined
        });
      }
    }
    this.render();
  }

  /** Map normalized note -> scale degree (1–7) from answerKey. */
  getNoteToDegreeMap() {
    const map = new Map();
    for (const entry of this.answerKey) {
      if (entry.note != null && entry.degree != null) map.set(entry.note, entry.degree);
    }
    return map;
  }

  /** Recommended finger (1–4) for a fret in the current 4-fret position. 1=index, 2=middle, 3=ring, 4=pinky. */
  getFingerForFret(fret) {
    const range = this.context && this.context.positionFretRange;
    if (!range || range.minFret == null || range.maxFret == null) return null;
    const { minFret, maxFret } = range;
    if (fret < minFret || fret > maxFret) return null;
    return fret - minFret + 1;
  }

  buildTableHtml() {
    const noteToDegree = this.getNoteToDegreeMap();
    const byString = [];
    for (let i = 0; i < 6; i++) byString[i] = [];
    for (const s of this._selections) {
      if (s.stringIndex >= 0 && s.stringIndex < 6) byString[s.stringIndex].push(s);
    }
    for (let i = 0; i < 6; i++) {
      byString[i].sort((a, b) => a.fret - b.fret);
    }
    const maxTones = Math.max(1, ...byString.map((arr) => arr.length));

    const octaves = this._selections.filter((s) => typeof s.octave === "number").map((s) => s.octave);
    const minOctave = octaves.length ? Math.min(...octaves) : 0;
    const maxOctave = octaves.length ? Math.max(...octaves) : 0;

    let html = "<table><thead><tr><th>String</th>";
    for (let c = 0; c < maxTones; c++) html += "<th>Tone</th>";
    html += "</tr></thead><tbody>";

    for (let si = 0; si < 6; si++) {
      const cells = byString[si];
      html += "<tr><td>" + escapeHtml(stringDisplay(si)) + "</td>";
      for (let c = 0; c < maxTones; c++) {
        const sel = cells[c];
        const note = sel ? sel.note : null;
        const degree = note ? noteToDegree.get(note) : null;
        const degreeClass = degree != null ? " degree-" + degree : "";
        let style = "";
        if (note && degree != null && DEGREE_FILL[degree] && typeof sel.octave === "number") {
          const baseHex = DEGREE_FILL[degree];
          const bg = withOctaveLightness(baseHex, sel.octave, minOctave, maxOctave);
          const textColor = (degree === 3 || degree === 5) ? "#fff" : "#222";
          style = ` style="--cell-bg: ${bg}; background: var(--cell-bg) !important; color: ${textColor};"`;
        } else if (note && degree != null && DEGREE_FILL[degree]) {
          const textColor = (degree === 3 || degree === 5) ? "#fff" : "#222";
          style = ` style="background: ${DEGREE_FILL[degree]} !important; color: ${textColor};"`;
        }
        const content = note ? escapeHtml(note) : "";
        html += "<td class=\"tone-cell" + degreeClass + "\"" + style + ">" + content + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
  }

  render() {
    const ctx = this.context;
    const isPentatonic = ctx && ctx.type === "pentatonic";

    let headerHtml, legendHtml;
    if (isPentatonic) {
      const key = ctx && ctx.tonic != null ? escapeHtml(ctx.tonic) : "—";
      const fiveTones = this.answerKey.length
        ? this.answerKey.map((n) => escapeHtml(n.note)).join(" ")
        : "—";
      headerHtml =
        "<div class=\"theory-header\">" +
        "<span class=\"theory-label\">Key</span> " + key + " <span class=\"theory-sep\">·</span> " +
        "<span class=\"theory-label\">Pentatonic</span> (5 notes)" +
        "</div>" +
        "<div class=\"pentatonic-tones\">" + fiveTones + "</div>" +
        "<div class=\"pentatonic-degrees\">Scale degrees: 1, 2, 3, 5, 6</div>";
      legendHtml = "<div class=\"finger-legend\">Fingers (when lit tones span 4 frets): 1 = index, 2 = middle, 3 = ring, 4 = pinky</div>";
    } else {
      const key = ctx && ctx.tonic != null ? escapeHtml(ctx.tonic) : "—";
      const mode = ctx && (ctx.modeName || ctx.degree != null) ? escapeHtml(ctx.modeName || "Degree " + ctx.degree) : "—";
      const degree = ctx && ctx.degree != null ? String(ctx.degree) : "—";
      const quality = ctx && ctx.quality ? escapeHtml(ctx.quality) : "—";
      headerHtml =
        "<div class=\"theory-header\">" +
        "<div class=\"theory-mode-title\">" + mode + "</div>" +
        "<div class=\"theory-meta\">Key of " + key + " <span class=\"theory-sep\">·</span> Degree " + escapeHtml(degree) + " <span class=\"theory-sep\">·</span> " + quality + "</div>" +
        "</div>";
      legendHtml =
        "<div class=\"legend\">" +
        "<span class=\"legend-chip first\">First</span>" +
        "<span class=\"legend-chip third\">third</span>" +
        "<span class=\"legend-chip fifth\">fifth</span>" +
        "</div>" +
        "<div class=\"finger-legend\">Fingers (when lit tones span 4 frets): 1 = index, 2 = middle, 3 = ring, 4 = pinky</div>";
    }

    const tableHtml =
      this._selections.length > 0
        ? this.buildTableHtml()
        : '<p class="placeholder">Click frets on the neck to build the table.</p>';

    this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; font-family: system-ui, sans-serif; color: #222; }
                .theory-header { margin-bottom: 0.5rem; }
                .theory-mode-title { font-size: 1.35rem; font-weight: 700; color: #1a1a1a; letter-spacing: 0.03em; font-family: Georgia, "Palatino Linotype", Palatino, serif; margin-bottom: 0.2rem; }
                .theory-meta { font-size: 0.8rem; color: #555; font-weight: 500; }
                .theory-label { font-weight: 600; color: #444; }
                .theory-sep { color: #999; margin: 0 0.2rem; font-weight: 400; }
                .legend { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; font-size: 0.85rem; }
                .legend-chip { padding: 0.2rem 0.5rem; border-radius: 4px; color: #fff; font-weight: 600; }
                .legend-chip.first { background: #ffc107; color: #222; }
                .legend-chip.third { background: #5b5b9e; }
                .legend-chip.fifth { background: #5a8c5a; }
                .finger-legend { font-size: 0.8rem; color: #555; margin-bottom: 0.35rem; }
                .table-wrap { overflow-x: auto; }
                .table-wrap table { width: 100%; border-collapse: collapse; margin-top: 0.25rem; font-size: 0.9rem; }
                .table-wrap th, .table-wrap td { border: 1px solid #ccc; padding: 0.35rem 0.6rem; text-align: center; }
                .table-wrap th { background: #333; color: #f5f5f5; }
                .placeholder { color: #666; margin-top: 0.5rem; font-family: Georgia, "Palatino Linotype", "Book Antiqua", Palatino, serif; font-style: italic; letter-spacing: 0.02em; }
                .tone-cell.degree-1 { background: #ffc107; color: #222; font-weight: 600; }
                .tone-cell.degree-3 { background: #5b5b9e; color: #fff; font-weight: 600; }
                .tone-cell.degree-5 { background: #5a8c5a; color: #fff; font-weight: 600; }
                .tone-cell.degree-2, .tone-cell.degree-4, .tone-cell.degree-6, .tone-cell.degree-7 { color: #666; }
                .pentatonic-tones { font-size: 1rem; font-weight: 600; color: #333; margin: 0.35rem 0 0.15rem 0; letter-spacing: 0.05em; }
                .pentatonic-degrees { font-size: 0.8rem; color: #555; margin-bottom: 0.5rem; }
            </style>
            ${headerHtml}
            ${legendHtml}
            <div class="table-wrap">${tableHtml}</div>
        `;
  }
}

customElements.define("note-panel", NotePanel);

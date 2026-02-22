// assets/js/note-flashing.js

export function flashMatchingNotes(fretboard, note) {
  if (!note) return;

  const keyNote = note.toUpperCase();
  const toFlash = new Set();

  // collect all matching notes for flash animation
  for (let s = 1; s <= fretboard.strings; s++) {
    for (let f = 0; f <= fretboard.frets; f++) {
      const n = fretboard.scaleMap[s]?.[f];
      if (n && n.toUpperCase() === keyNote) {
        toFlash.add(`${s}-${f}`);
      }
    }
  }

  // flash dots on fretboard
  fretboard.tempFlashNotes = toFlash;
  fretboard.render();

  // update note panel grouped by string (pedagogical layout)
  const panel = document.getElementById("note-panel-content");
  if (panel) {
    let output = [];

    // highest string first (6 → 1)
    for (let s = fretboard.strings; s >= 1; s--) {
      const activeFrets = [...fretboard.activePerString.get(s)].sort((a, b) => a - b);

      if (activeFrets.length === 0) {
        output.push(`${s}:`);
        continue;
      }

      const notes = activeFrets.map(f => fretboard.scaleMap[s][f]).join("  ");

      output.push(`${s}:  ${notes}`);
    }

    panel.textContent = output.join("\n");
  }

  // flash piano
  const piano = document.querySelector("piano-keyboard");
  if (piano) {
    piano.flash(note);
  }

  // clear flash after animation
  setTimeout(() => {
    fretboard.tempFlashNotes.clear();
    fretboard.render();
  }, 250);
}

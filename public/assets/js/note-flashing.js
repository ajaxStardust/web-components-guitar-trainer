// note-flashing.js
export function flashMatchingNotes(fretboard, note) {
  fretboard.tempFlashNotes.clear();
  fretboard.tempFlashPitches.clear();
  fretboard.tempFlashPitches.add(note);

  for (let s = 1; s <= fretboard.strings; s++) {
    for (let f = 0; f <= fretboard.frets; f++) {
      if (fretboard.scaleMap[s]?.[f] === note) {
        fretboard.tempFlashNotes.add(`${s}-${f}`);
      }
    }
  }

  fretboard.render();
  setTimeout(() => {
    fretboard.tempFlashNotes.clear();
    fretboard.tempFlashPitches.clear();
    fretboard.render();
  }, 500);
}
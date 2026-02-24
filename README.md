# web-components-guitar-trainer

A learning tool for guitar students: displays the tones of a given mode or chord with interactive visual cues.

**Preview live:** [https://transformative.click/public/guitar-interactive-base.php](https://transformative.click/public/guitar-interactive-base.php)

## Why it’s built this way: relative pitch & derivation

Nothing in this app is hardcoded to a key. **Everything is derived from the student’s choices:**

- **Tonic-relative engine** — You pick the tonic (e.g. G). The same degree (e.g. 2) always means the same *interval* from that tonic. So “Dorian” and “minor” aren’t stored in a table; they fall out of the intervals (e.g. minor third → Minor).
- **One source of truth** — A single rotation of the scale template + tonic drives the fretboard, piano, note panel, and chord quality. Mode names and Major/Minor/Diminished are **derived** from the actual notes, not looked up.
- **Degree-first, not shape-first** — The UI emphasizes *which degree* you’re on and *where that lives* on the neck and keyboard, so students build a mental model of relative pitch instead of memorizing fixed shapes.

That derivation engine is what makes the trainer both flexible and pedagogically consistent: change tonic or degree and the whole picture updates from one place.

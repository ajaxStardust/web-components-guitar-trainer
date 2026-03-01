// sound.js
//
// LLM NOTE: Web Audio API helper. Plays a short tone for a given note name when
// the student clicks a fret dot or piano key. AudioContext is created on first
// play (triggered by user click, so autoplay policy is satisfied). Single
// oscillator + gain envelope; no samples or external files.

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const FLAT_ALIASES = { "D#": "Eb", "G#": "Ab", "A#": "Bb" };

function normalizeNote(note) {
  return FLAT_ALIASES[note] || note;
}

// A4 = 440 Hz, MIDI 69. Note names map to semitone index 0–11; we use octave 4.
function noteNameToFrequency(noteName) {
  const n = normalizeNote(noteName);
  const index = NOTE_NAMES.indexOf(n);
  if (index < 0) return null;
  const midi = 60 + index; // C4 = 60
  return 440 * Math.pow(2, (midi - 69) / 12);
}

let audioContext = null;

function getContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

/**
 * Ensures the AudioContext is running (resumes if suspended).
 * Call before starting the sequencer so the first note is not dropped.
 */
export function ensureAudioReady() {
  const ctx = getContext();
  if (ctx.state === "suspended") return ctx.resume();
  return Promise.resolve();
}

/**
 * Play a short tone for the given note name (e.g. "G", "Eb").
 * Called from main.js on fret-note-click or piano-key-click.
 * durationMs: length of the tone in ms (default 200).
 * LLM NOTE: First play is on user click; we resume context if suspended so audio works in strict browsers.
 */
export function playNote(noteName, durationMs = 200) {
  if (!noteName) return;
  const freq = noteNameToFrequency(noteName);
  if (freq == null) return;

  try {
    const ctx = getContext();

    function startTone() {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationMs / 1000);
    }

    if (ctx.state === "suspended") {
      ctx.resume().then(startTone).catch((err) => {
        console.warn("Sound: could not resume AudioContext:", err);
      });
    } else {
      startTone();
    }
  } catch (err) {
    console.warn("Sound: playNote failed:", err);
  }
}

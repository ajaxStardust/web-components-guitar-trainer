// sound.js
//
// LLM NOTE: Web Audio API helper. Plays a short tone for a given note name when
// the student clicks a fret dot or piano key. AudioContext is created on first
// play (triggered by user click, so autoplay policy is satisfied). Single
// oscillator + gain envelope; no samples or external files.

const FLAT_ALIASES = { "D#": "Eb", "G#": "Ab", "A#": "Bb" };

function normalizeNote(note) {
  return FLAT_ALIASES[note] || note;
}

// Explicit note name → semitone (0–11), C=0. Matches music-theory.js so playback matches display.
const NOTE_TO_SEMITONE = {
  C: 0, "C#": 1, Db: 1,
  D: 2, "D#": 3, Eb: 3,
  E: 4, Fb: 4, "E#": 5,
  F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10,
  B: 11, Cb: 11
};

// A4 = 440 Hz, MIDI 69.
function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function noteNameToFrequency(noteName) {
  const n = normalizeNote(noteName);
  const semitone = NOTE_TO_SEMITONE[n];
  if (semitone === undefined) return null;
  const midi = 60 + semitone; // C4 = 60, single octave
  return midiToFrequency(midi);
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
 * Play a short tone at the given MIDI note (e.g. 60 = C4).
 * Used by the sequencer so the scale can ascend (no B→C drop to lower octave).
 */
export function playNoteAtMidi(midi, durationMs = 200) {
  const freq = midiToFrequency(midi);
  if (!Number.isFinite(freq) || freq <= 0) return;
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
      ctx.resume().then(startTone).catch((err) => console.warn("Sound: could not resume AudioContext:", err));
    } else {
      startTone();
    }
  } catch (err) {
    console.warn("Sound: playNoteAtMidi failed:", err);
  }
}

/**
 * Play a short tone for the given note name (e.g. "G", "Eb") in octave 4.
 * Called from main.js on fret-note-click or piano-key-click.
 * durationMs: length of the tone in ms (default 200).
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

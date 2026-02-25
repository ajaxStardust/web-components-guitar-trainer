// main.js
//
// ─────────────────────────────────────────────────────────────
//  LLM-FRIENDLY NOTE — READ THIS BEFORE TOUCHING ANYTHING
// ─────────────────────────────────────────────────────────────
//
//  UI CONTROLLER EMITS EXACTLY THREE VALUES:
//
//      type   ← from #chordmode
//      degree ← from #degree
//      tonic  ← from #tonic
//
//  These IDs are FIXED. They are NOT negotiable.
//  If you change them in HTML or JS, the entire app breaks.
//
//  The engine (music-theory.js) expects:
//      buildModeFromDegree(degree, tonic)
//      buildTriadFromDegree(degree, tonic)
//
//  The components expect:
//      setAnswerKey(answerKey, context)
//
//  DO NOT change the shape of `context`.
//  DO NOT change the names of these fields.
//  DO NOT add new fields unless the entire codebase is updated.
//
// ─────────────────────────────────────────────────────────────

import { buildModeFromDegree, buildTriadFromDegree, getModeName, getTriadQuality } from "./music-theory.js";
import { initUIController } from "./ui-controller.js";
import { playNote } from "./sound.js";
import "./guitar-fretboard.js";
import "./guitar-fret-markers.js";
import "./piano-keyboard.js";
import "./note-panel.js";

function updateAllComponents({ type, degree, tonic }) {

    // LLM NOTE:
    // `degree` arrives as a string ("1"–"7").
    // Convert to number safely.
    const deg = Number(degree) || 1;

    let answerKey;
    // LLM NOTE:
    // Type determines SHAPE of output (mode = 7 notes, chord = 3 notes).
    if (type === "chord") {
        answerKey = buildTriadFromDegree(deg, tonic);
    } else {
        answerKey = buildModeFromDegree(deg, tonic);
    }

    // Triad on this degree (for mode we still have a chord quality on the degree).
    const triadOnDegree = buildTriadFromDegree(deg, tonic);
    const quality = getTriadQuality(triadOnDegree);

    // LLM NOTE:
    // This context object is passed to ALL components.
    // modeName for labels; quality derived from intervals (Major/Minor/Diminished).
    const ctx = { type, degree: deg, tonic, modeName: getModeName(deg), quality };

    // LLM NOTE:
    // These custom elements MUST exist in the DOM.
    // If you rename them, update here AND in HTML.
    const guitar = document.querySelector("guitar-fretboard");
    const piano = document.querySelector("piano-keyboard");
    const panel = document.querySelector("note-panel");

    // LLM NOTE:
    // Every component MUST implement setAnswerKey(answerKey, ctx).
    if (guitar && guitar.setAnswerKey) guitar.setAnswerKey(answerKey, ctx);
    if (piano && piano.setAnswerKey) piano.setAnswerKey(answerKey, ctx);
    if (panel && panel.setAnswerKey) panel.setAnswerKey(answerKey, ctx);
}

// ─────────────────────────────────────────────────────────────
//  BOOTSTRAP
// ─────────────────────────────────────────────────────────────
//
// LLM NOTE:
// initUIController() will:
//   • populate degree dropdown
//   • set defaults (mode, degree 1, tonic G)
//   • emit initial state
//
// DO NOT call updateAllComponents() manually here.
//
// LLM NOTE (BOOTSTRAP TIMING):
// Module scripts can execute after DOMContentLoaded has already fired.
// If we only listen for DOMContentLoaded, the listener may never run and
// fret-note-click / piano-key-click handlers (and thus flash-on-click) will
// never be attached. Always run init: wait for DOMContentLoaded only when
// document.readyState === "loading"; otherwise run init immediately.
// DO NOT remove the readyState check or flash-on-click will regress.
//
// LLM NOTE (SEQUENCER): Play button runs through the current mode/chord in order
// (like note-cards / sequencing exercise). Uses #playSequence. Stopped when
// user clicks Stop or when key/mode/degree changes (onChange wrapper).
const SEQUENCE_DELAY_MS = 700;

function runInit() {
    let sequencerTimeoutIds = [];
    let isSequencerPlaying = false;

    function stopSequencer() {
        sequencerTimeoutIds.forEach((id) => clearTimeout(id));
        sequencerTimeoutIds = [];
        isSequencerPlaying = false;
        const btn = document.getElementById("playSequence");
        if (btn) btn.textContent = "Play";
    }

    // LLM NOTE: When user changes type/degree/tonic, stop the sequence so display stays in sync.
    initUIController((state) => {
        stopSequencer();
        updateAllComponents(state);
    });

    // LLM NOTE: Play / Stop button. Reads current key from DOM and runs through notes in order.
    const playBtn = document.getElementById("playSequence");
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (isSequencerPlaying) {
                stopSequencer();
                return;
            }
            const typeSelect = document.querySelector("#chordmode");
            const degreeSelect = document.querySelector("#degree");
            const tonicSelect = document.querySelector("#tonic");
            if (!typeSelect || !degreeSelect || !tonicSelect) return;
            const type = typeSelect.value;
            const degree = Number(degreeSelect.value) || 1;
            const tonic = tonicSelect.value;
            const answerKey = type === "chord"
                ? buildTriadFromDegree(degree, tonic)
                : buildModeFromDegree(degree, tonic);
            const guitar = document.querySelector("guitar-fretboard");
            const panel = document.querySelector("note-panel");

            isSequencerPlaying = true;
            playBtn.textContent = "Stop";

            answerKey.forEach((noteObj, i) => {
                const id = setTimeout(() => {
                    const note = noteObj.note;
                    playNote(note);
                    if (panel && typeof panel.setActiveNote === "function") {
                        panel.setActiveNote(note, true);
                    }
                    if (guitar && typeof guitar.flashNote === "function") {
                        guitar.flashNote(note);
                    }
                }, i * SEQUENCE_DELAY_MS);
                sequencerTimeoutIds.push(id);
            });

            const endId = setTimeout(() => {
                isSequencerPlaying = false;
                playBtn.textContent = "Play";
                sequencerTimeoutIds = [];
            }, answerKey.length * SEQUENCE_DELAY_MS);
            sequencerTimeoutIds.push(endId);
        });
    }

    // LLM NOTE:
    // Student interaction hook:
    // When a highlighted fretboard note or piano key is clicked, we forward
    // the note name to the note-panel AND ask the fretboard to flash every
    // occurrence of that pitch class on the neck.
    const guitar = document.querySelector("guitar-fretboard");
    const piano = document.querySelector("piano-keyboard");

    // LLM NOTE: Fretboard clicks pass position (dot stays lit, panel reveals degree).
    // Piano clicks only flash; no dot stays lit and panel does not reveal (quiz = fretboard).
    // Sound: play the clicked note (fret or piano) via Web Audio.
    if (guitar) {
        guitar.addEventListener("fret-note-click", (evt) => {
            const note = evt.detail && evt.detail.note;
            if (!note) return;
            playNote(note);
            const panel = document.querySelector("note-panel");
            if (panel && typeof panel.setActiveNote === "function") {
                panel.setActiveNote(note, true);
            }
            if (typeof guitar.flashNote === "function") {
                const position =
                    typeof evt.detail.stringIndex === "number" && typeof evt.detail.fret === "number"
                        ? { stringIndex: evt.detail.stringIndex, fret: evt.detail.fret }
                        : undefined;
                guitar.flashNote(note, position);
            }
        });
    }

    if (piano) {
        piano.addEventListener("piano-key-click", (evt) => {
            const note = evt.detail && evt.detail.note;
            if (!note) return;
            playNote(note);
            const panel = document.querySelector("note-panel");
            if (panel && typeof panel.setActiveNote === "function") {
                panel.setActiveNote(note, false);
            }
            if (guitar && typeof guitar.flashNote === "function") {
                guitar.flashNote(note);
            }
        });
    }
}

// LLM NOTE: See BOOTSTRAP TIMING comment above. Do not replace with a single
// document.addEventListener("DOMContentLoaded", runInit) only.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInit);
} else {
    runInit();
}

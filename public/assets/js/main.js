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

import { buildModeFromDegree, buildTriadFromDegree, buildPentatonicFromDegree, buildSeventhFromDegree, getModeName, getTriadQuality, getSeventhQuality } from "./music-theory.js";
import { initUIController } from "./ui-controller.js";
import { playNote, ensureAudioReady } from "./sound.js";
import "./guitar-fretboard.js";
import "./guitar-fret-markers.js";
import "./piano-keyboard.js";
import "./note-panel.js";
import "./chord-diagram.js";

function updateAllComponents({ type, degree, tonic, chordForm }) {

    let deg = Number(degree) || 1;
    const isPentatonic = type === "pentatonic";
    if (isPentatonic) deg = 1;
    const useSeventh = type === "chord" && chordForm === "7th";

    let answerKey;
    if (type === "chord") {
        answerKey = useSeventh ? buildSeventhFromDegree(deg, tonic) : buildTriadFromDegree(deg, tonic);
    } else if (type === "pentatonic") {
        answerKey = buildPentatonicFromDegree(deg, tonic);
    } else {
        answerKey = buildModeFromDegree(deg, tonic);
    }

    const quality = type === "chord"
        ? (useSeventh ? getSeventhQuality(answerKey) : getTriadQuality(buildTriadFromDegree(deg, tonic)))
        : getTriadQuality(buildTriadFromDegree(deg, tonic));

    const displayModeEl = document.querySelector("#displayMode");
    const displayMode = displayModeEl ? displayModeEl.value : "show";
    const modeName = getModeName(deg);
    const frets = 15;
    const geometryDeg = isPentatonic ? 1 : deg;
    const minFret = Math.max(0, 2 + (geometryDeg - 1) * 2);
    const maxFret = Math.min(frets, minFret + 3);
    const ctx = {
        type,
        degree: deg,
        tonic,
        modeName,
        quality,
        chordForm: type === "chord" ? (chordForm === "7th" ? "7th" : "triad") : undefined,
        revealOnClick: displayMode === "reveal",
        showOnlyDegreeRoot: displayMode === "degreeOnly",
        positionFretRange: { minFret, maxFret }
    };

    const guitar = document.querySelector("guitar-fretboard");
    const piano = document.querySelector("piano-keyboard");
    const panel = document.querySelector("note-panel");
    const chordDiagram = document.querySelector("chord-diagram");

    if (guitar && guitar.setAnswerKey) guitar.setAnswerKey(answerKey, ctx);
    if (piano && piano.setAnswerKey) piano.setAnswerKey(answerKey, ctx);
    if (panel && panel.setAnswerKey) panel.setAnswerKey(answerKey, ctx);
    if (chordDiagram && chordDiagram.setAnswerKey) chordDiagram.setAnswerKey(answerKey, ctx);

    const chordDiagramRow = document.querySelector("#chord-diagram-row");
    if (chordDiagramRow) chordDiagramRow.style.display = isPentatonic ? "none" : "";
}

// LLM NOTE (BOOTSTRAP TIMING): Module scripts can run after DOMContentLoaded.
// Run init when DOM is ready; initUIController emits once and components render immediately.
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

    initUIController((state) => {
        stopSequencer();
        updateAllComponents(state);
    });

    const displayModeEl = document.getElementById("displayMode");
    if (displayModeEl) {
        displayModeEl.addEventListener("change", () => {
            const typeSelect = document.querySelector("#chordmode");
            const degreeSelect = document.querySelector("#degree");
            const tonicSelect = document.querySelector("#tonic");
            if (typeSelect && degreeSelect && tonicSelect) {
                updateAllComponents({
                    type: typeSelect.value,
                    degree: degreeSelect.value,
                    tonic: tonicSelect.value
                });
            }
        });
    }

    const testSoundBtn = document.getElementById("testSound");
    if (testSoundBtn) testSoundBtn.addEventListener("click", () => playNote("A"));

    const resetBtn = document.getElementById("reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            stopSequencer();
            const typeSelect = document.querySelector("#chordmode");
            const degreeSelect = document.querySelector("#degree");
            const tonicSelect = document.querySelector("#tonic");
            const chordFormSelect = document.querySelector("#chordForm");
            if (!typeSelect || !degreeSelect || !tonicSelect) return;
            updateAllComponents({
                type: typeSelect.value,
                degree: degreeSelect.value,
                tonic: tonicSelect.value,
                chordForm: chordFormSelect ? chordFormSelect.value : "triad"
            });
        });
    }

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
                ? (document.querySelector("#chordForm")?.value === "7th"
                    ? buildSeventhFromDegree(degree, tonic)
                    : buildTriadFromDegree(degree, tonic))
                : type === "pentatonic"
                    ? buildPentatonicFromDegree(degree, tonic)
                    : buildModeFromDegree(degree, tonic);
            const guitar = document.querySelector("guitar-fretboard");
            const piano = document.querySelector("piano-keyboard");
            const panel = document.querySelector("note-panel");

            isSequencerPlaying = true;
            playBtn.textContent = "Stop";

            const SEQUENCE_START_DELAY_MS = 120;

            ensureAudioReady().then(() => {
                answerKey.forEach((noteObj, i) => {
                    const id = setTimeout(() => {
                        const note = noteObj.note;
                        playNote(note);
                        if (panel && typeof panel.setActiveNote === "function") panel.setActiveNote(note, true);
                        if (guitar && typeof guitar.flashNote === "function") guitar.flashNote(note);
                        if (piano && typeof piano.flashNote === "function") piano.flashNote(note);
                    }, SEQUENCE_START_DELAY_MS + i * SEQUENCE_DELAY_MS);
                    sequencerTimeoutIds.push(id);
                });

                const endId = setTimeout(() => {
                    isSequencerPlaying = false;
                    playBtn.textContent = "Play";
                    sequencerTimeoutIds = [];
                }, SEQUENCE_START_DELAY_MS + answerKey.length * SEQUENCE_DELAY_MS);
                sequencerTimeoutIds.push(endId);
            });
        });
    }

    const guitar = document.querySelector("guitar-fretboard");
    const piano = document.querySelector("piano-keyboard");

    if (guitar) {
        guitar.addEventListener("fret-note-click", (evt) => {
            const note = evt.detail && evt.detail.note;
            if (!note) return;
            playNote(note);
            const panel = document.querySelector("note-panel");
            const chordDiagram = document.querySelector("chord-diagram");
            const position =
                typeof evt.detail.stringIndex === "number" && typeof evt.detail.fret === "number"
                    ? {
                        stringIndex: evt.detail.stringIndex,
                        fret: evt.detail.fret,
                        octave: typeof evt.detail.octave === "number" ? evt.detail.octave : undefined
                      }
                    : undefined;
            if (panel && typeof panel.setActiveNote === "function") panel.setActiveNote(note, true, position);
            if (chordDiagram && typeof chordDiagram.setActiveNote === "function") chordDiagram.setActiveNote(note, true, position);
            if (typeof guitar.flashNote === "function") guitar.flashNote(note, position);
            if (piano && typeof piano.flashNote === "function") piano.flashNote(note);
        });
    }

    if (piano) {
        piano.addEventListener("piano-key-click", (evt) => {
            const note = evt.detail && evt.detail.note;
            if (!note) return;
            playNote(note);
            const panel = document.querySelector("note-panel");
            if (panel && typeof panel.setActiveNote === "function") panel.setActiveNote(note, false);
            if (guitar && typeof guitar.flashNote === "function") guitar.flashNote(note);
            if (typeof piano.flashNote === "function") piano.flashNote(note);
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInit);
} else {
    runInit();
}

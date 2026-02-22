// assets/js/ui-controller.js
//
// Central UI orchestrator for the Interactive Guitar + Piano Trainer.
// Handles:
//   • TYPE selector (scale / mode / chord)
//   • MODE/DEGREE selector (dynamic meaning)
//   • TONIC selector
//   • Dispatching updates to guitar-fretboard
//   • Dispatching updates to piano-keyboard
//   • Updating the legacy note panel
//
// This file is future‑proofed with clear extension points for:
//   • Pentatonics
//   • 7th chords
//   • Harmonic/Melodic minor modes
//   • Custom interval sets
//   • Additional instruments
//   • Analysis engines
//

import "./guitar-fretboard.js";
import "./piano-keyboard.js";
import "./note-panel.js";

document.addEventListener("DOMContentLoaded", () => {

  const typeSelect = document.getElementById("structure-type");
  const modeDegreeSelect = document.getElementById("mode-degree");
  const tonicSelect = document.getElementById("tonic");

  const fretboard = document.querySelector("guitar-fretboard");
  const piano = document.querySelector("piano-keyboard");
  const notePanel = document.querySelector("note-panel");

  if (!fretboard) {
    console.error("ERROR: <guitar-fretboard> not found.");
    return;
  }

  const MODE_OPTIONS = [
    { value: "ionian", label: "Ionian (I)" },
    { value: "dorian", label: "Dorian (ii)" },
    { value: "phrygian", label: "Phrygian (iii)" },
    { value: "lydian", label: "Lydian (IV)" },
    { value: "mixolydian", label: "Mixolydian (V)" },
    { value: "aeolian", label: "Aeolian (vi)" },
    { value: "locrian", label: "Locrian (vii°)" }
  ];

  const DEGREE_OPTIONS = [
    { value: "I", label: "I (Major)" },
    { value: "ii", label: "ii (minor)" },
    { value: "iii", label: "iii (minor)" },
    { value: "IV", label: "IV (Major)" },
    { value: "V", label: "V (Major)" },
    { value: "vi", label: "vi (minor)" },
    { value: "vii°", label: "vii° (dim)" }
  ];

  const PENTATONIC_OPTIONS = [];
  const SEVENTH_CHORD_OPTIONS = [];

  function populateSelect(selectEl, options) {
    selectEl.innerHTML = "";
    for (const opt of options) {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      selectEl.appendChild(o);
    }
  }

  function handleTypeChange() {
    const type = typeSelect.value;

    if (type === "scale") {
      modeDegreeSelect.disabled = true;
      populateSelect(modeDegreeSelect, MODE_OPTIONS);
    }
    else if (type === "mode") {
      modeDegreeSelect.disabled = false;
      populateSelect(modeDegreeSelect, MODE_OPTIONS);
    }
    else if (type === "chord") {
      modeDegreeSelect.disabled = false;
      populateSelect(modeDegreeSelect, DEGREE_OPTIONS);
    }

    dispatchUpdate();
  }

  function dispatchUpdate() {
    const type = typeSelect.value;
    const mode = modeDegreeSelect.value;
    const tonic = tonicSelect.value;

    fretboard.setStructure({ type, mode, tonic });

    if (piano?.updateHighlights)
      piano.updateHighlights({ type, mode, tonic });

    if (notePanel?.update)
      notePanel.update(tonic, mode, type);
  }

  typeSelect.addEventListener("change", handleTypeChange);
  modeDegreeSelect.addEventListener("change", dispatchUpdate);
  tonicSelect.addEventListener("change", dispatchUpdate);

  handleTypeChange();
});

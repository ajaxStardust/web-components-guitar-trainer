// assets/js/ui-controller.js
import { GuitarFretboard } from "./guitar-fretboard.js";
import { flashMatchingNotes } from "./note-flashing.js";

document.addEventListener("DOMContentLoaded", () => {
  const fretboard = document.querySelector("guitar-fretboard");
  const modeSelect = document.getElementById("view-mode");
  const tonicSelect = document.getElementById("tonic");

  if (!fretboard) return;

  if (tonicSelect) {
    tonicSelect.addEventListener("change", () => {
      fretboard.setTonic(tonicSelect.value);
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener("change", () => {
      const value = modeSelect.value; // "scale" | "chord" | "dorian" | ...
      fretboard.setViewMode(value);
    });
  }
});

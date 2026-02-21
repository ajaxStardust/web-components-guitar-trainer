// assets/js/ui-controller.js

import "./guitar-fretboard.js";
import "./note-panel.js";

document.addEventListener("DOMContentLoaded", () => {
  const viewSelect = document.getElementById("view-select");
  const tonicSelect = document.getElementById("parent-key-select");
  const fretboard = document.querySelector("guitar-fretboard");

  if (!fretboard) return;

  viewSelect.addEventListener("change", () => {
    fretboard.setViewMode(viewSelect.value);
  });

  tonicSelect.addEventListener("change", () => {
    fretboard.setTonic(tonicSelect.value);
  });
});
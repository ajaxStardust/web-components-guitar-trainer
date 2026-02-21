// test.js
const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><body><guitar-fretboard frets="12"></guitar-fretboard></body>`, {
  runScripts: "outside-only"
});

global.window = dom.window;
global.document = dom.window.document;

// Now you can import modules and simulate DOM interactions
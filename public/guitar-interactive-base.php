<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Interactive Guitar Fretboard + Piano Trainer</title>
    <link rel="stylesheet" href="assets/css/guitarstyle.css" />
</head>

<body>
    <h2>Interactive Guitar Fretboard + Piano Trainer</h2>
    <div id="controls"> <label for="view-select"><strong>View:</strong></label> <select id="view-select"
            aria-label="Select view">
            <option value="mode">Mode</option>
            <option value="chord">Chord</option>
        </select> <label for="parent-key-select"><strong>Tonic:</strong></label> <select id="parent-key-select"
            aria-label="Select tonic">
            <option>C</option>
            <option>C#</option>
            <option>D</option>
            <option>D#</option>
            <option>E</option>
            <option>F</option>
            <option>F#</option>
            <option>G</option>
            <option>G#</option>
            <option>A</option>
            <option>A#</option>
            <option>B</option>
        </select> </div>
    <div id="guitarboard" class="row">
        <guitar-fretboard frets="12"></guitar-fretboard>
        <div id="note-panel" aria-live="polite">
            <div class="hint">Click a highlighted note to toggle it.</div>
            <div id="note-panel-content"></div>
        </div>
    </div>
    <script type="module" src="assets/js/guitar.js"></script>
</body>

</html>
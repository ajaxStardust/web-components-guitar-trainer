<!-- guitar-interactive-base.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Interactive Guitar Fretboard + Piano Trainer</title>
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" href="assets/css/guitarstyle.css" />
</head>
<body>

    <div style="text-align: center; margin-bottom: 0.5rem;">
        <a href="https://statecollegeguitarlessons.site/"><img src="https://statecollegeguitarlessons.site/themes/basix-rwguitar/assets/images/logo@2x.png" alt="State College Guitar Lessons" style="max-width: 315px; height: auto; display: inline-block;" /></a>
    </div>
    <h2>Interactive Guitar Fretboard + Piano Trainer</h2>

    <div id="controls">
        <label>Type:</label>
        <select id="chordmode">
            <option value="mode">Mode</option>
            <option value="chord">Chord</option>
            <option value="pentatonic">Pentatonic</option>
        </select>

        <span id="chordFormWrap" style="display: none;">
            <label>Chord form:</label>
            <select id="chordForm" aria-label="Chord form">
                <option value="triad">Triad</option>
                <option value="7th">7th</option>
            </select>
        </span>

        <label>Display:</label>
        <select id="displayMode" aria-label="Display mode">
            <option value="show">Show scale</option>
            <option value="degreeOnly">Degree only</option>
            <option value="reveal">Reveal on click</option>
        </select>

        <label>Degree:</label>
        <select id="degree"></select>

        <label for="tonic"><strong>Tonic:</strong></label>
        <select id="tonic" aria-label="Select tonic">
            <option value="C">C</option>
            <option value="C#">C#</option>
            <option value="D">D</option>
            <option value="D#">D#</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="F#">F#</option>
            <option value="G">G</option>
            <option value="G#">G#</option>
            <option value="A">A</option>
            <option value="A#">A#</option>
            <option value="B">B</option>
        </select>

        <span class="sequence-control">
            <button type="button" id="playSequence" aria-label="Play sequence">Play</button>
        </span>
        <button type="button" id="testSound" aria-label="Test sound">Test sound</button>
    </div>

    <div class="row" id="fretboard-and-panel">
        <div id="guitarboard" class="row">
            <guitar-fretboard frets="15"></guitar-fretboard>
            <guitar-fret-markers frets="15"></guitar-fret-markers>
        </div>
        <note-panel></note-panel>
    </div>

    <div id="chord-diagram-row" class="row">
        <chord-diagram></chord-diagram>
    </div>

    <div id="theory-row" class="row">
        <piano-keyboard></piano-keyboard>
    </div>

    <script type="module" src="assets/js/main.js"></script>
</body>
</html>

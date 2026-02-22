<!DOCTYPE html>
<html lang="en">

<head>
    <!-- ========================= -->
    <!-- CORE METADATA (UNCHANGED) -->
    <!-- ========================= -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Interactive Guitar Fretboard + Piano Trainer</title>

    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="shortcut icon" type="image/png" href="favicon.png">

    <meta name="description"
        content="Single Page Application (SPA) browser for developers. Visit: GitHub.com/ajaxstardust/AnnieDeBrowsa">

    <!-- Open Graph Meta Tags -->
    <meta property="og:url" content="https://transformative.click">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Transformative.Click">
    <meta property="og:description"
        content="Unicode Misc Symbols and Pictographs in Single Page Application (SPA) browser for developers. Visit: GitHub.com/ajaxstardust/AnnieDeBrowsa">
    <meta property="og:image" content="https://transformative.click/favicon.png">
    <meta property="og:image:width" content="680">
    <meta property="og:image:height" content="680">

    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:domain" content="transformative.click">
    <meta property="twitter:url" content="https://transformative.click">
    <meta name="twitter:title" content="Transformative.Click">
    <meta name="twitter:description"
        content="Unicode Misc Symbols and Pictographs in Single Page Application (SPA) browser for developers. Visit: GitHub.com/ajaxstardust/AnnieDeBrowsa">
    <meta name="twitter:image" content="https://transformative.click/favicon.png">

    <link rel="stylesheet" href="assets/css/guitarstyle.css" />
</head>

<body>
    <h2>Interactive Guitar Fretboard + Piano Trainer</h2>

    <!-- ========================================================= -->
    <!--  THREE‑SELECTOR CONTROL BAR (FUTURE‑PROOFED WITH COMMENTS) -->
    <!-- ========================================================= -->
    <div id="controls">

        <!-- 1) TYPE SELECTOR -->
        <label for="structure-type"><strong>Type:</strong></label>
        <select id="structure-type" aria-label="Select structure type">
            <option value="scale">Major Scale</option>
            <option value="mode">Mode</option>
            <option value="chord">Chord (Triad)</option>

            <!-- ========================= -->
            <!-- FUTURE TYPES (PLACEHOLDERS) -->
            <!-- ========================= -->
            <!-- <option value="pentatonic">Pentatonic</option> -->
            <!-- <option value="seventh">7th Chords</option> -->
            <!-- <option value="harmonic-minor">Harmonic Minor</option> -->
            <!-- <option value="melodic-minor">Melodic Minor</option> -->
            <!-- <option value="custom">Custom Interval Set</option> -->
        </select>

        <!-- 2) MODE / DEGREE SELECTOR -->
        <label for="mode-degree"><strong>Mode / Degree:</strong></label>
        <select id="mode-degree" aria-label="Select mode or degree">
            <!-- Default: Mode list -->
            <option value="ionian">Ionian (I)</option>
            <option value="dorian">Dorian (ii)</option>
            <option value="phrygian">Phrygian (iii)</option>
            <option value="lydian">Lydian (IV)</option>
            <option value="mixolydian">Mixolydian (V)</option>
            <option value="aeolian">Aeolian (vi)</option>
            <option value="locrian">Locrian (vii°)</option>

            <!-- ========================= -->
            <!-- FUTURE DEGREE SETS (PLACEHOLDERS) -->
            <!-- ========================= -->
            <!-- For Chords: I, ii, iii, IV, V, vi, vii° -->
            <!-- For Pentatonics: Major / Minor -->
            <!-- For 7th chords: IMaj7, ii7, V7, etc. -->
            <!-- For Harmonic Minor Modes -->
            <!-- For Melodic Minor Modes -->
        </select>

        <!-- 3) TONIC SELECTOR -->
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

        <!-- ========================= -->
        <!-- FUTURE ACCIDENTAL TOGGLE -->
        <!-- ========================= -->
        <!-- <label><input type="checkbox" id="accidental-toggle"> Use Flats</label> -->

        <!-- ========================= -->
        <!-- FUTURE CONTROL BAR EXPANSION -->
        <!-- ========================= -->
        <!-- <div id="advanced-controls"></div> -->
        <!-- <div id="quiz-controls"></div> -->
        <!-- <div id="analysis-controls"></div> -->
    </div>

    <!-- ========================= -->
    <!-- GUITAR + NOTE PANEL AREA -->
    <!-- ========================= -->
    <div id="guitarboard" class="row">

        <!-- Guitar Fretboard Component -->
        <guitar-fretboard frets="12"></guitar-fretboard>

        <!-- Legacy Note Panel -->
        <div id="note-panel" aria-live="polite">
            <div class="hint">Click a highlighted note to toggle it.</div>
            <div id="note-panel-content"></div>
        </div>

        <!-- ========================= -->
        <!-- FUTURE MODULE PLACEHOLDERS -->
        <!-- ========================= -->
        <!-- <interval-trainer></interval-trainer> -->
        <!-- <scale-degree-analyzer></scale-degree-analyzer> -->
        <!-- <chord-quality-view></chord-quality-view> -->
    </div>

    <!-- ========================= -->
    <!-- PIANO KEYBOARD -->
    <!-- ========================= -->
    <piano-keyboard></piano-keyboard>

    <!-- ========================= -->
    <!-- FUTURE INSTRUMENT MODULES -->
    <!-- ========================= -->
    <!-- <bass-fretboard></bass-fretboard> -->
    <!-- <ukulele-fretboard></ukulele-fretboard> -->
    <!-- <keyboard-extended></keyboard-extended> -->

    <!-- ========================= -->
    <!-- JAVASCRIPT MODULE LOADER -->
    <!-- ========================= -->
    <script type="module" src="assets/js/ui-controller.js"></script>

    <!-- ========================= -->
    <!-- FUTURE SCRIPT HOOKS -->
    <!-- ========================= -->
    <!-- <script type="module" src="assets/js/quiz-controller.js"></script> -->
    <!-- <script type="module" src="assets/js/analysis-engine.js"></script> -->
</body>

</html>
<!DOCTYPE html>
<html lang="en">

<head>
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

    <div id="controls">
    <!-- TYPE SELECTOR (mode vs chord)
         JS expects: #chordmode
    -->
    <label>Type:</label>
    <select id="chordmode">
        <option value="mode">Mode</option>
        <option value="chord">Chord</option>
    </select>

    <!-- DEGREE / MODE SELECTOR
         JS expects: #degree
         This dropdown is dynamically populated by ui-controller.js.
    -->
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
    </div>

    <div id="theory-row" class="row">
        <piano-keyboard></piano-keyboard>
        <note-panel></note-panel>
    </div>

    <div id="guitarboard" class="row">
        <guitar-fretboard frets="15"></guitar-fretboard>
    </div>

    <div id="fretmarkers" class="row">
        <guitar-fret-markers frets="15"></guitar-fret-markers>
    </div>

    <!-- Load JavaScript Modules -->
    <script type="module" src="assets/js/main.js"></script>
</body>

</html>

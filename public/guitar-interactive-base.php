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
        <label for="view-select"><strong>View:</strong></label>
        <select id="view-select" aria-label="Select view">
            <option value="mode">Mode</option>
            <option value="chord">Chord</option>
        </select>

        <label for="parent-key-select"><strong>Tonic:</strong></label>
        <select id="parent-key-select" aria-label="Select tonic">
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
        </select>
    </div>

    <div id="guitarboard" class="row">
        <guitar-fretboard frets="12"></guitar-fretboard>
        <div id="note-panel" aria-live="polite">
            <div class="hint">Click a highlighted note to toggle it.</div>
            <div id="note-panel-content"></div>
        </div>
    </div>

    <!-- Load JavaScript Modules -->
    <script type="module" src="assets/js/ui-controller.js"></script>
</body>

</html>
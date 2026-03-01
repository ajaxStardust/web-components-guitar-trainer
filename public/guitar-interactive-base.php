<!-- guitar-interactive-base.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Interactive Guitar Fretboard + Piano Trainer</title>
    <meta name="description" content="Explore modes, chords, and pentatonics on an interactive fretboard and piano. Pick tonic and degree—everything is derived from your choices." />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://training.statecollegeguitarlessons.site/" />
    <meta property="og:title" content="Interactive Guitar Fretboard + Piano Trainer" />
    <meta property="og:description" content="Explore modes, chords, and pentatonics on an interactive fretboard and piano. Pick tonic and degree—everything is derived from your choices." />
    <meta property="og:image" content="https://statecollegeguitarlessons.site/themes/basix-rwguitar/assets/images/logo@2x.png" />
    <meta property="og:site_name" content="State College Guitar Lessons" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://training.statecollegeguitarlessons.site/" />
    <meta name="twitter:title" content="Interactive Guitar Fretboard + Piano Trainer" />
    <meta name="twitter:description" content="Explore modes, chords, and pentatonics on an interactive fretboard and piano. Pick tonic and degree—everything is derived from your choices." />
    <meta name="twitter:image" content="https://statecollegeguitarlessons.site/themes/basix-rwguitar/assets/images/logo@2x.png" />

    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" href="assets/css/guitarstyle.css" />
</head>
<body>

    <header class="trainer-header" role="banner">
        <div class="trainer-header-bg">
            <img src="assets/footer-headstock-morph.png" alt="" class="trainer-header-img" width="1200" height="400" />
        </div>
        <div class="trainer-header-overlay">
            <a href="https://statecollegeguitarlessons.site/"><img src="https://statecollegeguitarlessons.site/themes/basix-rwguitar/assets/images/logo@2x.png" alt="State College Guitar Lessons" class="logo-img" /></a>
            <h1 class="trainer-header-title">Interactive Guitar Fretboard + Piano Trainer</h1>
            <div class="header-links">
                <a href="https://app.tango.us/app/workflow/Guitar-Modes--Chords--and-Pentatonic-Scales-Trainer-3780d3c0c45445aea094b5f028075237" target="_blank" rel="noopener noreferrer" class="instructions-link">To instructions</a>
                <a href="https://www.buymeacoffee.com/ajaxstardust" target="_blank" rel="noopener noreferrer" class="bmc-link" aria-label="Buy me a coffee">Buy me a coffee</a>
            </div>
        </div>
    </header>
    <div class="support-blurb">
        <p>This trainer is free and built from the <a href="https://statecollegeguitarlessons.site/pedagogy" target="_blank" rel="noopener noreferrer">pedagogy</a> behind <a href="https://statecollegeguitarlessons.site/about" target="_blank" rel="noopener noreferrer">State College Guitar Lessons</a>. Please buy me a $5.00 coffee if it helped you. It's super easy to do by clicking the link above.</p>
    </div>

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
        <span id="pentatonicHint" class="control-hint" style="display: none;" aria-live="polite">5 notes (degree = parent mode)</span>

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
        <button type="button" id="reset" aria-label="Reset">Reset</button>
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

    <footer class="trainer-footer" role="contentinfo">
        <div class="trainer-footer-bg">
            <img src="assets/footer-headstock-morph.png" alt="" class="trainer-footer-img" width="1200" height="400" />
        </div>
        <div class="trainer-footer-overlay">
            <p class="trainer-footer-quote">Music is a structured, expressive system. The goal is to build real musical fluency, not just memorized shapes.</p>
            <p class="trainer-footer-attribution"><a href="https://statecollegeguitarlessons.site/pedagogy" target="_blank" rel="noopener noreferrer">Pedagogy</a> · State College Guitar Lessons</p>
        </div>
    </footer>

    <script type="module" src="assets/js/main.js"></script>
</body>
</html>

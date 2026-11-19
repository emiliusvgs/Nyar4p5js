<div align="center">
  <img width="514" height="514" alt="nyar4p5js" src="https://github.com/user-attachments/assets/81142a0c-2b13-46c9-9921-115c09ce8b79" />
</div>

# Nyar4p5js

**[Leer en español](README.es.md)**

NyARToolkit (augmented reality) now running in p5.js (web augmented reality).
Pronounced: *Nyar-for-p5js*.

**Square-marker augmented reality for p5.js**, with an API that continues the one from
[NyAR4psg](https://github.com/nyatla/NyARToolkit-for-Processing) (NyARToolkit for Processing).

Nyar4p5js is a tribute to the work of **nyatla** (Ryo Iizuka): NyARToolkit brought marker-based AR to
Processing and to a whole generation of artists and creators. This project brings that way of working
(`addARMarker`, `addNyIdMarker`, `detect`, `isExist`, `beginTransform`…) to p5.js in the browser.

- **Pattern markers (`.patt`)**: Hiro, Kanji or your own, converted from any image.
- **NyId markers**: nyatla's numeric ID markers. The reader is a **JavaScript port of the original
  NyARToolkit code**, and it reads exactly the same markers.
- Under the hood, square detection and pose estimation are done by **ARToolKit5 compiled to WebAssembly**.

> NFT (natural feature tracking) and PsARPlayCard are not included yet.

## Important: work in the p5.js Web Editor

The recommended way to use Nyar4p5js is the **[p5.js Web Editor](https://editor.p5js.org)**: nothing to install,
you can test right away on your laptop and on your phone, and whatever works there works the same when you export it
to your own server. DEMO: https://editor.p5js.org/emiliusvgs/sketches/OWuMlg6e8

<div align="center">
  <img width="1028" height="752" alt="index.html in the p5.js Web Editor with the ARToolKit and nyar4p5.js script tags" src="https://github.com/user-attachments/assets/46b0ce28-733a-4821-811d-a9d249010aeb" />
</div>

1. Create a new sketch and **upload `nyar4p5.js`** (Sketch Files → `+`). Together with `index.html` and `sketch.js`,
   these are the only three files you need.
2. In `index.html`, before `sketch.js`, add the ARToolKit and `nyar4p5.js` script tags, as shown in the image.
3. Paste the `sketch.js` of the example you want and press **Play**.
4. To test on your phone: **Share → Fullscreen** and open that link on your phone (it uses the rear camera).
5. To publish it: **File → Download** and upload the folder to your server (HTTPS).

When you update the library, replace **both files at the same time** (`nyar4p5.js` and `sketch.js`): mixing
versions is the most common cause of errors. More details in [In the p5.js Web Editor](#in-the-p5js-web-editor).

---
### TUTORIAL (in Spanish)

[![TUTORIAL](https://img.youtube.com/vi/373RJQ-1e64/maxresdefault.jpg)](https://youtu.be/373RJQ-1e64 "Watch the TUTORIAL on YouTube")

## Quick start

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.13/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ar-js-org/artoolkit5-js@0.3.2/dist/ARToolkit.js"></script>
<script src="nyar4p5.js"></script>
```

```js
let cam, ar;

function setup() {
  NyAR.createARCanvas(this);    // WEBGL canvas: portrait on phones, landscape on laptops
  cam = NyAR.createCamera(this); // rear camera on phones, webcam on laptops
  ar = new NyAR.MultiMarker(this, width, height);
  ar.addARMarker('hiro', 80);   // marker 0: Hiro (bundled with the library), 80 mm wide
}

function draw() {
  if (!ar.ready) return;
  ar.detect(cam);
  ar.applyCamera();       // real camera projection (alias: setARPerspective)
  ar.drawBackground();    // video background
  if (ar.isExist(0)) {
    ar.beginTransform(0);
    translate(0, 0, 20);  // +Z comes out of the paper towards the camera
    normalMaterial();
    box(40);
    ar.endTransform();
  }
}
```
<img width="1440" height="1080" alt="A p5.js cube rendered on top of a Hiro marker" src="https://github.com/user-attachments/assets/766d6585-1f6e-4956-b2fb-2e6e397dd303" />

Designed **phone first**: it opens the rear camera, sets the canvas to portrait and fits it to the
screen. On a laptop it uses the webcam and the usual landscape canvas. See [Phone first](#phone-first).

Works the same with **p5 1.x and 2.x** (tested with 1.11.13 and 2.3.4). For p5 2.x, replace the first `<script>` with
`https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.min.js`.

## Examples

| Folder | What it shows |
|---|---|
| `examples/00_p5editor` | **Ready for the p5.js Web Editor**: you only need to upload `nyar4p5.js` |
| `examples/00_p5editor_tu_imagen` | **Your own image as a marker, in the p5.js Web Editor**: upload your image, the camera recognizes it, and press S to download the printable marker |
| `examples/01_simpleLite` | Cube on Hiro, diagnostics (contour, axes), manual and automatic threshold |
| `examples/02_multiMarker` | **Hiro + Kanji at the same time**: different objects, line and distance in mm between them, HTML labels that follow each marker, found/lost events, 2D drawing on the paper |
| `examples/03_mirror` | **Mirrored front webcam** (M key) and front/rear camera switch (F key) |
| `examples/04_patternMaker` | **Image → .patt converter**: drag an image or capture a square from the camera, test it live and download the `.patt` and the printable marker |
| `examples/05_nyId` | **NyId markers**: NyId 0 and 1 with their own objects, any other ID from 2 to 511 with its number on top, and a printable NyId generator |
| `examples/06_arPlusNyIdMarker` | Direct port of nyatla's example of the same name: Hiro, Kanji, NyId 0 and NyId 1 at the same time |
| `examples/07_cohete` | **The 2009 cube turned into a rocket**: basic p5.js shapes with white faces and yellow edges. Taps only: the 1st tap turns the cube into a rocket, the 2nd makes it lift off |

**How to open them**

- **Local server** (recommended): from the `nyar4p5js/` folder run `python3 -m http.server` and go to
  `http://localhost:8000/examples/02_multiMarker/`.
- **Single file**: the `standalone/` folder has each example as a single `.html` with the library and data
  embedded. Open it with a double click in Chrome (it needs internet to load p5 and ARToolKit from a CDN).
  Rebuild them with `python3 tools/build-standalone.py`.
- **p5.js Web Editor**: use `examples/00_p5editor` (see the "In the p5.js Web Editor" section).
- **On a phone** the camera only works over **HTTPS** (or `localhost`).

Printable markers: `data/hiro.png`, `data/kanji.png` and `data/nyid-0.png`, `nyid-1.png`, `nyid-2.png`,
`nyid-3.png`, `nyid-42.png`. Measure them without the white margin: that is the width in mm you pass to `addARMarker` or
`addNyIdMarker`. The white margin around the black border is required.

---

## API

### `new NyAR.MultiMarker(p, width, height, [cameraPara], [options])`

- `p`: `this` in global mode, or the instance in instance mode.
- `width`, `height`: size of the processing image (640×480 recommended). The source is
  center-cropped to keep the 4:3 aspect ratio.
- `cameraPara` (optional, advanced): not needed. The library includes ARToolKit's standard camera data,
  which works well with webcams and phones. Only if you calibrated your camera can you pass your own
  `camera_para.dat` here (URL or bytes).
- `options` (all optional):

| Option | Default | What it's for |
|---|---|---|
| `mirror` | `false` | Horizontal mirror for front webcams |
| `lostDelay` | `3` | Frames a marker keeps "existing" after it's lost (less flicker) |
| `minConfidence` | `0.5` | Minimum confidence (0–1) to accept a pattern |
| `threshold` | `100` | Binarization threshold (0–255) |
| `thresholdMode` | `'manual'` | `'manual'`, `'otsu'`, `'adaptive'`, `'median'`, `'bracketing'` |
| `patternRatio` | `0.5` | Ratio of the inner drawing (0.5 = black border of 25% per side) |
| `patternMode` | `'color'` | Pattern matching `'color'` or `'mono'` |
| `near`, `far` | `10`, `10000` | Clipping planes in mm |

Useful properties: `ready`, `error`, `whenReady` (promise), `detectMs`, `markersInFrame`, `sourceSize`.

### Markers

| Method | Description |
|---|---|
| `addARMarker(src, widthMM, {name, edge})` | Registers a marker and returns its index. `src` can be a `.patt` URL, the text of a `.patt`, an image URL (`.png`, `.jpg`…) or an already loaded image (`p5.Image`, `p5.Graphics`, `<img>`, `<canvas>`). Images are converted to `.patt` automatically |
| `addARMarker('hiro', 80)` / `addARMarker('kanji', 80)` | Classic markers bundled with the library (also in `NyAR.PATT.hiro` / `NyAR.PATT.kanji`) |
| `addARMarker(img, 16, 25, widthMM)` | Four-argument form, NyAR4psg style: image, resolution (always 16 in ARToolKit5), border %, mm |
| `addNyIdMarker(nyid, widthMM)` | Registers a specific NyId (same as in NyAR4psg) |
| `addNyIdMarker(from, to, widthMM)` | Registers a range of NyIds: any one that appears inside the range. `getNyId(index)` tells you which one |
| `getNyId(id)` | Numeric ID detected on a NyId marker (-1 if never seen) |
| `getMarkerCount()`, `getMarkerName(id)`, `getMarkerType(id)`, `getMarkerWidth(id)`, `getPattern(id)` | Data about the registered markers (`getMarkerType` returns `'patt'` or `'nyid'`; `getPattern`, the `.patt` text) |

All markers, `.patt` and NyId, share the same numbering: the index returned by `addARMarker` or
`addNyIdMarker` is the one you use in `isExist`, `beginTransform`, etc.

### Detection and queries

| Method | Description |
|---|---|
| `detect(source)` | Processes a frame (`createCapture`, `createVideo`, `p5.Image`, `p5.Graphics`, `<video>`, `<canvas>`, `<img>`). Returns `false` if there is no image yet |
| `isExist(id)` | Is it visible (or within `lostDelay`)? |
| `isDetected(id)` | Was it detected in this exact frame? |
| `getExistMarkers()` | Indices of the visible markers |
| `getConfidence(id)`, `getLife(id)`, `getLostCount(id)` | Confidence, consecutive frames visible, consecutive frames lost |
| `getMarkerPosition(id)` | Marker center relative to the camera `[x, y, z]` in mm (`z` = distance) |
| `getDistance(a, b)` | Distance in mm between two markers |
| `getMarkerMatrix(id)` | 4×4 matrix ready for `applyMatrix()` |
| `getTransMat(id)` | Raw 3×4 ARToolKit matrix |
| `getMarkerVertex2D(id)` | Corners in pixels of the processing image |
| `marker2Screen(id, x, y, z)` | Marker point (mm) → canvas pixel. Respects the mirror. Useful for placing HTML on top |
| `screen2MarkerCoordSystem(id, sx, sy)` | Canvas pixel → point on the marker plane (mm). Useful for "touching" the paper |
| `getSquares()` | Every square the detector saw, known or not. Each one has `nyid` (≥ 0 if a NyId was read) and `marker` (assigned index or -1) |
| `on('found' \| 'lost', fn)`, `off(...)` | Events when a marker appears or is lost: `fn(id)` |

### Drawing

| Method | Description |
|---|---|
| `applyCamera()` / `setARPerspective()` | Real camera projection. Call it at the start of `draw()` |
| `drawBackground()` | Video background aligned with the projection |
| `beginTransform(id)` … `endTransform()` | Draw in marker space (mm). X to the right, Y towards the top of the pattern, Z out of the paper |
| `beginSurface(id)` … `endTransform()` | Same, but with Y flipped: the paper works as a 2D canvas, so `text()`, `image()` and `rect()` read the right way up |
| `drawContour(id, color)`, `drawSquares()`, `drawMarkerFrame(id)` | Diagnostics: detected contour; all squares (green = registered, light blue = NyId out of range, yellow = unknown); marker border and axes |

### Settings

`setThreshold(n)`, `setThresholdMode(mode)`, `getThreshold()`, `setConfidenceThreshold(c)`,
`setLostDelay(frames)`, `setMirror(bool)`, `toggleMirror()`.

---

## Image → .patt converter

Built into the library. Works without a server or external tools.

```js
const patt = NyAR.makePattern(img);          // img: p5.Image, <img>, <canvas>, p5.Graphics…
NyAR.savePattern(patt, 'my-marker.patt');    // downloads the file
ar.addARMarker(patt, 80);                    // or use it right away
```

- **`edge: 'auto'`** (default) detects whether the image is the **full marker** (black border, with or without
  white margin) or **only the inner drawing**. You can also force it: `{ edge: 0 }` (the whole image is the
  inner drawing) or `{ edge: 25 }` (full marker with a 25% border per side, no margin).
- `NyAR.makePattern.lastRegion` tells you which area was used and how it was interpreted.
- `NyAR.makePattern.lastInfo` tells you whether the image will work: `{ ok, warnings, contrast, detail, symmetry }`.
- `NyAR.comparePatterns(a, b)` measures how similar two `.patt` are (1 = identical); useful to avoid markers
  the camera would confuse.
- Contrast is boosted automatically, both in the `.patt` and in the printable marker.
- `NyAR.pattToImage(patt)` returns the 16×16 preview (what ARToolKit "sees").
- `NyAR.makeMarkerImage(innerDrawing, { size: 1024 })` generates the printable marker (`p5.Graphics`).
- `NyAR.saveMarkerImage(img, 'my-marker.png')` does it all in one step: generates the printable marker and downloads it.
- From the camera: `ar.capturePattern(ar.getLargestUnknownSquare())` creates a `.patt` from what is inside
  a black square that isn't a known marker yet. `ar.pickupMarkerImage(id)` returns the rectified image
  of a marker.

The output format is the same ARToolKit `.patt` (16×16, BGR, 4 orientations) produced by AR.js and the
classic `mk_patt` tool, so it also works in other projects.

## Does any image work as a marker?

**Almost any, as long as you print it with the black border the page generates.** Eight types of image were tested,
each seen from the front, rotated, tilted and far away:

| Image | Result |
|---|---|
| Real photo, text, drawing, color logo | Detected in all 4 positions |
| Low-contrast or very dark image | Detected thanks to automatic contrast boost (without it, they failed) |
| Symmetric shape (a circle) | Detected, but the object may appear rotated: there's no clear "up" |
| Very fine-detail texture (noise) | **Doesn't work**: at the pattern resolution (16×16) it looks like flat gray |

Good to know:

- The converter page (example 04) **warns you** if an image won't work, if it's symmetric, or if it looks
  too much like another marker that's already registered.
- Print **the marker generated by the page** (with black border and boosted contrast), not the original image.
- Two images with the same drawing, even if the color or contrast changes, are seen by the camera as the same marker.
- If you use your own markers alongside others (Hiro, Kanji…), raise the confidence threshold to avoid mix-ups:
  `ar.setConfidenceThreshold(0.7)`. In testing, a custom drawing was confused with Kanji at 0.64.

## In the p5.js Web Editor

The editor only allows certain file types to be uploaded (code, images, sound, fonts, text…). That's why the
library doesn't need any extra file: the camera data and the Hiro and Kanji markers are built into
`nyar4p5.js`.

**All examples work the same in the editor.** Each folder in `examples/` has its three files
(`index.html`, `sketch.js` and `nyar4p5.js`), and the `index.html` is the same one the editor uses; each example's
panels and styles are created from `sketch.js`. To use one:

1. Create a new sketch in the editor and replace `index.html` and `sketch.js` with the ones from the example folder.
2. Upload `nyar4p5.js` (it's a `.js`, the editor accepts it).
3. Optional (`00_p5editor`): upload your marker as an image (`mi-marcador.png`). It can be the one generated by example 04.
4. Press play and allow the camera.

If you keep the editor's default `index.html`, just add these two lines before `sketch.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/@ar-js-org/artoolkit5-js@0.3.2/dist/ARToolkit.js"></script>
<script src="nyar4p5.js"></script>
```

```js
ar = new NyAR.MultiMarker(this, width, height);
ar.addARMarker('hiro', 80);
```

To try it on your phone, open the sketch on the phone with the editor's **Share → Fullscreen** link
(it's HTTPS, which the camera needs).

### Export and upload to your server

What works in the editor works the same outside it: **File → Download** gives you a zip with `index.html`,
`sketch.js`, `nyar4p5.js` and your images. Upload that folder as is to your server (or upload an
`examples/` folder directly). Two conditions:

- The server must be **HTTPS**: without it, phones won't give access to the camera.
- If you update `nyar4p5.js`, reload without cache (or change the name to `nyar4p5.js?v=2` in `index.html`),
  because the browser may keep using the previous version.

### Turn your image into a marker (in the editor too)

No external tools needed: `nyar4p5.js` does the conversion. Use `examples/00_p5editor_tu_imagen`:

1. Upload your image to the editor (PNG or JPG): a logo, a drawing or a photo with clear shapes. **It doesn't need a border.**
2. Press Play and then **S**: `mi-marcador.png` is downloaded — your image with the black border and boosted contrast.
3. Print `mi-marcador.png` (or open it on another screen) and show it to the camera.

The camera only recognizes the image **with that black border**: it's the first thing it looks for to know where the paper is.
Your original image, without the border, won't be recognized. The console tells you if your image won't work.

```js
loadImage('mi-imagen.png', img => {
  ar.addARMarker(img, 80);                       // the camera now recognizes it
  NyAR.saveMarkerImage(img, 'mi-marcador.png');  // downloads the printable marker
});
```

## NyId markers

NyIds are nyatla's ID marker system: a one-cell black border and, inside, a grid
that encodes a number. Nothing to train and no files to load: you print them and register them by number.

```js
ar.addNyIdMarker(0, 80);                  // index 0: NyId 0, 80 mm wide (black border included)
const ANY = ar.addNyIdMarker(1, 511, 80); // index 1: any NyId from 1 to 511
// in draw():
if (ar.isExist(ANY)) console.log('I see NyId', ar.getNyId(ANY));
```

| Model | Inner cells | IDs |
|---|---|---|
| 2 (the classic) | 5×5 | 0 – 511 |
| 3 | 7×7 | 0 – 33,554,431 |

- **Generating markers**: `NyAR.makeNyIdMarkerImage(id, { size: 1024 })` returns the printable marker
  (`p5.Graphics`, or draws into a `<canvas>` with `{ canvas }`). It uses model 2 up to 511 and model 3 from 512;
  you can force it with `{ model: 3 }`. `NyAR.nyIdCells(id)` gives you the 0/1 grid in case you want to draw it yourself.
- **Orientation**: a NyId is "upright" when the alternating cells (the sync mark) are on the
  left and bottom, as in the NyARToolkit template. That side defines +Y up, just like Hiro.
- **How they're read**: ARToolKit finds the square; then the reader ported from NyARToolkit
  (`NyIdMarkerPickup` and friends) rectifies the image, computes its own threshold from the marker's pixels,
  measures the sync mark, reads the cells, checks the control code and returns the number and orientation.
- **Verification**: compared against nyatla's original Java library, compiled and run on the same
  images (including NyARToolkit's test photo `320x240NyId.raw`). The IDs and the top-left corner
  match in every case. Markers generated by Nyar4p5js are also read by the Java version.
- A registered NyId takes priority over `.patt` markers on the same square, as in NyARToolkit.
- The confidence (`getConfidence`) of a NyId is always 1: either the full, valid code is read, or it isn't detected.

## Multiple markers at once

- Register each marker with its own `addARMarker`: the index it returns is the one you use in `isExist`,
  `beginTransform`, etc. There's no practical limit for a handful of markers.
- Use **clearly different, non-symmetric** drawings. Hiro and Kanji are the classic pair.
- Each square in the video is assigned to the best-matching pattern. If you register **the same drawing twice**
  (for example `'hiro'` and a marker generated from `hiro.png`), only one of the two will be detected.
- If there are two printed copies of the same marker, the one with the highest confidence is used.

## Phone first

```js
NyAR.createARCanvas(this);            // 480×640 on a phone in portrait, 640×480 everywhere else
cam = NyAR.createCamera(this);        // rear camera; on a laptop, the webcam
ar = new NyAR.MultiMarker(this, width, height);
```

| Function | What it does |
|---|---|
| `NyAR.createCamera(p, [{ facing }])` | Opens the rear camera. On phones it requests it strictly (`facingMode: { exact }`); if the phone doesn't support that or still returns the front camera, it looks for the rear one by name among the cameras. On laptops it uses the webcam. `facing: 'user'` requests the front camera. On phones it doesn't force 640×480 (that would crop or distort the portrait image) |
| `NyAR.createARCanvas(p, [options])` | Creates the WEBGL canvas at the right size, centers it and scales it to the screen without distortion. Works with the `index.html` that comes with the p5.js Web Editor (adds the `viewport` tag if missing). `fit: 'cover'` fills the whole screen by cropping edges; `maxScale: 1` prevents enlarging it; `parent` places it inside an element. Disables zoom and scrolling on touch |
| `NyAR.isMobile()` | `true` on phones and tablets |
| `NyAR.size()` | `[480, 640]` on a phone in portrait, `[640, 480]` everywhere else |

With a portrait canvas, the library rotates the camera parameters (designed for 640×480 landscape) so the
3D pose isn't distorted. The examples are controlled with **taps** (`touchStarted` / `mousePressed`); the remaining
keys are extra diagnostics for laptops.

If you position HTML elements over the canvas with `marker2Screen`, multiply by
`drawingContext.canvas.clientWidth / width`: the canvas may be scaled on screen.

## Mirror for front webcams

```js
ar = new NyAR.MultiMarker(this, width, height, { mirror: true });
// or at any time: ar.setMirror(true) / ar.toggleMirror()
```

The detector always works on the **un-mirrored** image, because patterns aren't symmetric and a mirrored
pattern wouldn't be recognized. The mirror is applied when drawing: background, contours and 3D objects are flipped
together and stay aligned. `marker2Screen` and `screen2MarkerCoordSystem` already take it into account.
Don't use the `{ flipped: true }` option of `createCapture`: Nyar4p5js reads the video directly.

## Notes and limits

- Units are millimeters (decimal widths are allowed). Origin at the center of the marker.
- Defaults that differ from NyAR4psg: `lostDelay` 3 (10 there) and `minConfidence` 0.5 (0.51 there).
- The processing image is 4:3 (3:4 on a phone in portrait). If the camera delivers another ratio, it's center-cropped.
- If you rotate the phone with the sketch open, reload the page: the size is decided at startup.
- In p5 2.x global mode, avoid function names that clash with p5 (`log`, `random`…).
- Camera on phones: requires HTTPS.

## Structure

```
nyar4p5js/
  nyar4p5.js        the library (a single file, no dependencies other than p5 and ARToolkit.js)
  data/             printable markers: hiro.png, kanji.png, nyid-*.png
  examples/         00_p5editor … 07_cohete (each folder ready for the editor or a server)
  standalone/       the same examples, one .html each
  tools/            build-standalone.py (only for maintaining the library: copies nyar4p5.js into each example and builds standalone/)
  LICENSE           GNU LGPL v3
```

---

## Credits

- **nyatla (Ryo Iizuka)**: author of NyARToolkit and NyARToolkit for Processing (NyAR4psg), whose API this
  library follows. Nyar4p5js's NyId reader is a JavaScript port of his code
  (`NyIdMarkerPickup`, `MarkerPattEncoder`, `NyIdMarkerDataEncoder_RawBit/RawBitId`, `NyIdList`,
  `NyARPerspectiveParamGenerator_O1`), Copyright (C) 2008-2012 Ryo Iizuka, LGPLv3. Example 06 is a port of
  his `arPlusNyIdMarker` sketch.
  NyARToolkit: <https://github.com/nyatla/NyARToolkit> · NyAR4psg: <https://github.com/nyatla/NyARToolkit-for-Processing>
- **ARToolKit**: created by Hirokazu Kato at the HIT Lab of the University of Washington, later developed
  by ARToolworks (later part of DAQRI), which released it as ARToolKit5 under LGPLv3 in 2015; today it is continued
  by the **artoolkitX** community.
  <https://github.com/artoolkitx/artoolkit5>
- **artoolkit5-js** (`@ar-js-org/artoolkit5-js`): ARToolKit5 compiled to WebAssembly by the **AR.js**
  organization (based on jsartoolkit5). LGPLv3. Loaded separately from a CDN; Nyar4p5js doesn't modify it.
  <https://github.com/AR-js-org/artoolkit5-js>
- **Hiro and Kanji markers** and the standard camera data (bundled inside `nyar4p5.js`): they come from the
  ARToolKit distribution. The Kanji pattern comes from the AR.js / jsartoolkit5 data; `kanji.png` was generated
  from the ARToolKit5 patterns PDF.
- **p5.js**: the Processing Foundation and its community. <https://p5js.org>

## License

Nyar4p5js is distributed under the **GNU Lesser General Public License v3** (`LICENSE` file), the same license as
NyARToolkit and ARToolKit5, because it includes code ported from NyARToolkit.

Nyar4p5js is a project by [EMILIUSVGS](https://emiliusvgs.com).

// nyar4p5 · 01 simpleLite — cubo sobre el marcador Hiro (el "hola mundo" de NyAR4psg)
// Teclas: D diagnóstico · C cubo · + / − umbral · A umbral automático (otsu) on/off

let cam, ar, hud;
let showDiag = true, showCube = true;

function setup() {
  createCanvas(640, 480, WEBGL).parent('stage');
  cam = createCapture({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  cam.hide();

  ar = new NyAR.MultiMarker(this, 640, 480);
  ar.addARMarker('hiro', 80); // marcador 0: Hiro de 80 mm de lado (sin el margen blanco)

  hud = document.getElementById('hud');
}

function draw() {
  background(12);
  if (ar.error) return status('error', 'Error: ' + ar.error.message);
  if (!ar.ready) return status('wait', 'Cargando motor ARToolKit…');

  const hasFrame = ar.detect(cam);
  ar.applyCamera();
  ar.drawBackground();
  if (!hasFrame) return status('wait', 'Esperando la cámara (acepta el permiso del navegador)…');

  if (ar.isExist(0)) {
    if (showDiag) ar.drawContour(0);
    ar.beginTransform(0);
    if (showDiag) ar.drawMarkerFrame(0);
    if (showCube) {
      push();
      translate(0, 0, 20); // apoyado sobre el papel (+Z sale del marcador)
      stroke(255);
      strokeWeight(1.5);
      normalMaterial();
      box(40);
      pop();
    }
    ar.endTransform();
  }
  updateHud();
}

function status(kind, msg) {
  hud.innerHTML = `<div class="row"><span class="dot ${kind}"></span>${msg}</div>`;
}

let fpsSmooth = 0;
function updateHud() {
  fpsSmooth = fpsSmooth ? fpsSmooth * 0.9 + frameRate() * 0.1 : frameRate();
  const found = ar.isExist(0);
  hud.innerHTML = `
    <div class="row"><span class="dot ${found ? 'ok' : 'search'}"></span>${found ? 'Hiro detectado' : 'Buscando el marcador Hiro…'}</div>
    <div class="grid">
      <span>FPS</span><b>${fpsSmooth.toFixed(0)}</b>
      <span>Detección</span><b>${ar.detectMs.toFixed(1)} ms</b>
      <span>Confianza</span><b>${found ? ar.getConfidence(0).toFixed(2) : '—'}</b>
      <span>Umbral</span><b>${ar.getThreshold()} (${ar.thresholdMode})</b>
      <span>Cámara</span><b>${ar.sourceSize ? ar.sourceSize.join('×') : '—'}</b>
    </div>
    <div class="keys">D diagnóstico · C cubo · +/− umbral · A umbral automático</div>`;
}

function keyPressed() {
  if (key === 'd' || key === 'D') showDiag = !showDiag;
  if (key === 'c' || key === 'C') showCube = !showCube;
  if (key === '+' || key === '=') { ar.setThresholdMode('manual'); ar.setThreshold(ar.threshold + 10); }
  if (key === '-' || key === '_') { ar.setThresholdMode('manual'); ar.setThreshold(ar.threshold - 10); }
  if (key === 'a' || key === 'A') ar.setThresholdMode(ar.thresholdMode === 'otsu' ? 'manual' : 'otsu');
}

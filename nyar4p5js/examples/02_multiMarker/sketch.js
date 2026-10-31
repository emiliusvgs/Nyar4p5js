// nyar4p5 · 02 multiMarker — Hiro y Kanji a la vez
// Hiro: cubo con una flecha dibujada sobre el papel (beginSurface)
// Kanji: toroide girando
// Con los dos a la vista: línea entre ambos y distancia en mm.
// Etiquetas HTML que siguen a cada marcador (marker2Screen).
// Teclas: D diagnóstico · A umbral automático (otsu) on/off

let cam, ar, hud, labels = [];
let showDiag = true;
const events = [];

function setup() {
  createCanvas(640, 480, WEBGL).parent('stage');
  cam = createCapture({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  cam.hide();

  ar = new NyAR.MultiMarker(this, 640, 480, { lostDelay: 5 });
  const HIRO = ar.addARMarker('hiro', 80, { name: 'Hiro' });   // 0
  const KANJI = ar.addARMarker('kanji', 80, { name: 'Kanji' }); // 1

  // eventos: se disparan una vez al aparecer / desaparecer
  ar.on('found', id => logEvent(`${ar.getMarkerName(id)} apareció`));
  ar.on('lost', id => logEvent(`${ar.getMarkerName(id)} se perdió`));

  // una etiqueta HTML por marcador
  for (const id of [HIRO, KANJI]) {
    const el = document.createElement('div');
    el.className = 'tag';
    el.textContent = ar.getMarkerName(id);
    document.getElementById('stage').appendChild(el);
    labels[id] = el;
  }
  hud = document.getElementById('hud');
}

function draw() {
  background(12);
  if (ar.error) return status('error', 'Error: ' + ar.error.message);
  if (!ar.ready) return status('wait', 'Cargando motor ARToolKit…');

  const hasFrame = ar.detect(cam);
  ar.applyCamera();
  ar.drawBackground();
  if (!hasFrame) return status('wait', 'Esperando la cámara…');

  // --- Hiro: cubo + flecha plana que apunta hacia "arriba" del patrón ---
  if (ar.isExist(0)) {
    if (showDiag) ar.drawContour(0);
    ar.beginTransform(0);
    push();
    translate(0, 0, 15);
    normalMaterial();
    stroke(255); strokeWeight(1);
    box(30);
    pop();
    ar.endTransform();

    ar.beginSurface(0); // plano del papel como lienzo 2D (Y hacia abajo, mm)
    push();
    translate(0, 0, 0.5);
    noStroke(); fill(255, 200, 0);
    triangle(0, -38, -10, -22, 10, -22); // flecha hacia arriba del patrón
    pop();
    ar.endTransform();
  }

  // --- Kanji: toroide girando ---
  if (ar.isExist(1)) {
    if (showDiag) ar.drawContour(1, color(0, 200, 255));
    ar.beginTransform(1);
    push();
    translate(0, 0, 30);
    rotateX(frameCount * 0.03);
    rotateY(frameCount * 0.02);
    noStroke();
    ambientLight(80); directionalLight(255, 255, 255, 0.3, 0.5, -1);
    ambientMaterial(0, 180, 255);
    torus(22, 8);
    pop();
    ar.endTransform();
  }

  // --- los dos: línea entre centros (en coordenadas de cámara) ---
  if (ar.isExist(0) && ar.isExist(1)) {
    const a = ar.getMarkerPosition(0), b = ar.getMarkerPosition(1);
    push();
    stroke(255, 0, 200); strokeWeight(3);
    line(a[0], a[1], -a[2], b[0], b[1], -b[2]); // cámara ARToolKit -> ojo de p5: z negativo
    pop();
  }

  updateLabels();
  updateHud();
}

function updateLabels() {
  for (let id = 0; id < labels.length; id++) {
    const el = labels[id];
    const s = ar.isExist(id) ? ar.marker2Screen(id, 0, 0, 60) : null; // 60 mm sobre el marcador
    el.style.display = s ? 'block' : 'none';
    if (s) el.style.transform = `translate(${s[0]}px, ${s[1]}px) translate(-50%, -100%)`;
  }
}

function logEvent(msg) {
  events.unshift(`${new Date().toLocaleTimeString()} · ${msg}`);
  events.length = Math.min(events.length, 4);
}

function status(kind, msg) {
  hud.innerHTML = `<div class="row"><span class="dot ${kind}"></span>${msg}</div>`;
}

function updateHud() {
  const vis = ar.getExistMarkers().map(i => ar.getMarkerName(i));
  const both = ar.isExist(0) && ar.isExist(1);
  const fmt = id => ar.isExist(id) ? `${ar.getConfidence(id).toFixed(2)} · ${ar.getMarkerPosition(id)[2].toFixed(0)} mm` : '—';
  hud.innerHTML = `
    <div class="row"><span class="dot ${vis.length ? 'ok' : 'search'}"></span>${vis.length ? 'Visibles: ' + vis.join(' + ') : 'Buscando Hiro y Kanji…'}</div>
    <div class="grid">
      <span>Hiro (confianza · distancia)</span><b>${fmt(0)}</b>
      <span>Kanji (confianza · distancia)</span><b>${fmt(1)}</b>
      <span>Distancia entre marcadores</span><b>${both ? ar.getDistance(0, 1).toFixed(0) + ' mm' : '—'}</b>
      <span>Cuadrados en imagen</span><b>${ar.markersInFrame}</b>
      <span>Detección</span><b>${ar.detectMs.toFixed(1)} ms</b>
    </div>
    <div class="keys">${events.join('<br>') || 'Eventos: —'}</div>
    <div class="keys">D diagnóstico · A umbral automático (${ar.thresholdMode})</div>`;
}

function keyPressed() {
  if (key === 'd' || key === 'D') showDiag = !showDiag;
  if (key === 'a' || key === 'A') ar.setThresholdMode(ar.thresholdMode === 'otsu' ? 'manual' : 'otsu');
}

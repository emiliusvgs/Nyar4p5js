// nyar4p5 · 01 simpleLite — cubo sobre el marcador Hiro (el "hola mundo" de NyAR4psg)
// Teclas: D diagnóstico · C cubo · + / − umbral · A umbral automático (otsu) on/off

let cam, ar, hud;
let showDiag = true, showCube = true;

function setup() {
  crearInterfaz(); // paneles y estilos (al final del archivo)
  NyAR.createARCanvas(this, { parent: 'stage' }); // vertical en el celular, horizontal en la laptop
  cam = NyAR.createCamera(this);   // cámara trasera en el celular, webcam en la laptop

  ar = new NyAR.MultiMarker(this, width, height);
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

// ---------- interfaz ----------
// Estilos y paneles se crean desde aquí: así el ejemplo funciona con el index.html que trae el
// p5.js Web Editor (y al exportarlo o subirlo a tu servidor) sin tocar nada más.
function crearInterfaz() {
  document.head.insertAdjacentHTML('beforeend', `<style>
    body { margin: 0; overflow: hidden; background: #111; color: #eee; font: 14px system-ui, sans-serif; }
    #stage { position: relative; display: inline-block; line-height: 0; }
    #hud { position: fixed; left: 0; top: 0; padding: 8px 12px; background: rgba(0,0,0,.55); border-bottom-right-radius: 8px; pointer-events: none; }
    .row { display: flex; align-items: center; gap: 8px; font-weight: 600; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #888; flex: none; }
    .dot.ok { background: #2ecc71; } .dot.search { background: #f1c40f; } .dot.error { background: #e74c3c; }
    .grid { display: grid; grid-template-columns: auto auto; gap: 2px 16px; margin-top: 6px; width: max-content; }
    .keys { opacity: .7; margin-top: 6px; }


  </style>`);
  document.body.insertAdjacentHTML('afterbegin', `
    <div id="stage"></div>
    <div id="hud"></div>
    
  `);
}

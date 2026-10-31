// nyar4p5 · 03 mirror — webcam frontal en modo espejo
// El detector siempre trabaja con la imagen sin espejar (los patrones no son simétricos);
// el espejo se aplica solo al dibujar: fondo, contornos y objetos 3D a la vez.
// Teclas: M espejo on/off · F cambiar cámara (frontal/trasera) · D diagnóstico

let cam, ar, hud;
let facing = 'user';
let showDiag = true;

function setup() {
  createCanvas(640, 480, WEBGL).parent('stage');
  openCamera();

  ar = new NyAR.MultiMarker(this, 640, 480, { mirror: true });
  ar.addARMarker('hiro', 80, { name: 'Hiro' });
  ar.addARMarker('kanji', 80, { name: 'Kanji' });

  hud = document.getElementById('hud');
}

function openCamera() {
  if (cam) { cam.elt.srcObject && cam.elt.srcObject.getTracks().forEach(t => t.stop()); cam.remove(); }
  // ojo: no uses la opción { flipped: true } de createCapture; el espejo lo pone nyar4p5
  cam = createCapture({ video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  cam.hide();
}

function draw() {
  background(12);
  if (ar.error) return status('error', 'Error: ' + ar.error.message);
  if (!ar.ready) return status('wait', 'Cargando motor ARToolKit…');

  const hasFrame = ar.detect(cam);
  ar.applyCamera(); // aplica el espejo si ar.mirror es true
  ar.drawBackground();
  if (!hasFrame) return status('wait', 'Esperando la cámara…');

  for (const id of ar.getExistMarkers()) {
    if (showDiag) ar.drawContour(id);
    ar.beginTransform(id);
    if (showDiag) ar.drawMarkerFrame(id);
    push();
    translate(0, 0, 35);
    rotateZ(frameCount * 0.04);
    normalMaterial();
    if (id === 0) { rotateX(HALF_PI); cone(25, 50); } // el cono de p5 va a lo largo de Y: lo ponemos de pie en +Z
    else sphere(25);
    pop();
    ar.endTransform();
  }
  updateHud();
}

function status(kind, msg) {
  hud.innerHTML = `<div class="row"><span class="dot ${kind}"></span>${msg}</div>`;
}

function updateHud() {
  const vis = ar.getExistMarkers().map(i => ar.getMarkerName(i));
  hud.innerHTML = `
    <div class="row"><span class="dot ${vis.length ? 'ok' : 'search'}"></span>${vis.length ? 'Visibles: ' + vis.join(' + ') : 'Muestra Hiro o Kanji a la cámara…'}</div>
    <div class="grid">
      <span>Espejo</span><b>${ar.mirror ? 'on' : 'off'}</b>
      <span>Cámara</span><b>${facing === 'user' ? 'frontal' : 'trasera'} · ${ar.sourceSize ? ar.sourceSize.join('×') : '—'}</b>
    </div>
    <div class="keys">M espejo · F cambiar cámara · D diagnóstico</div>`;
}

function keyPressed() {
  if (key === 'm' || key === 'M') ar.toggleMirror();
  if (key === 'd' || key === 'D') showDiag = !showDiag;
  if (key === 'f' || key === 'F') {
    facing = facing === 'user' ? 'environment' : 'user';
    ar.setMirror(facing === 'user'); // espejo solo con la frontal
    openCamera();
  }
}

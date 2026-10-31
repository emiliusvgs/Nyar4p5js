// nyar4p5 · 03 mirror — webcam frontal en modo espejo
// El detector siempre trabaja con la imagen sin espejar (los patrones no son simétricos);
// el espejo se aplica solo al dibujar: fondo, contornos y objetos 3D a la vez.
// Toca la pantalla (o pulsa F) para cambiar entre cámara frontal y trasera.
// En la laptop, teclas extra: M espejo on/off · D diagnóstico

let cam, ar, hud;
let facing = NyAR.isMobile() ? 'environment' : 'user'; // celular: trasera · laptop: webcam
let showDiag = true;

function setup() {
  crearInterfaz(); // paneles y estilos (al final del archivo)
  NyAR.createARCanvas(this, { parent: 'stage' }); // vertical en el celular, horizontal en la laptop
  openCamera();

  ar = new NyAR.MultiMarker(this, width, height, { mirror: facing === 'user' }); // espejo solo con la frontal
  ar.addARMarker('hiro', 80, { name: 'Hiro' });
  ar.addARMarker('kanji', 80, { name: 'Kanji' });

  hud = document.getElementById('hud');
}

function openCamera() {
  if (cam) { cam.elt.srcObject && cam.elt.srcObject.getTracks().forEach(t => t.stop()); cam.remove(); }
  // ojo: no uses la opción { flipped: true } de createCapture; el espejo lo pone nyar4p5
  cam = NyAR.createCamera(this, { facing });
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
    <div class="keys">Toca para cambiar de cámara · M espejo · D diagnóstico</div>`;
}

function keyPressed() {
  if (key === 'm' || key === 'M') ar.toggleMirror();
  if (key === 'd' || key === 'D') showDiag = !showDiag;
  if (key === 'f' || key === 'F') switchCamera();
}

function switchCamera() {
  facing = facing === 'user' ? 'environment' : 'user';
  ar.setMirror(facing === 'user'); // espejo solo con la frontal
  openCamera();
}

// tap: cambiar de cámara (con freno, porque un tap puede llegar como toque y como clic)
let lastTap = -1e9;
function tap(e) {
  const t = (e && e.timeStamp) || performance.now();
  if (t - lastTap > 350) switchCamera();
  lastTap = t;
  return false;
}
function touchStarted(e) { return tap(e); }
function mousePressed(e) { return tap(e); }

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

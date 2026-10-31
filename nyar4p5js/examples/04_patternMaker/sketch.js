// nyar4p5 · 04 patternMaker — crea marcadores .patt desde una imagen o desde la cámara
//
// 1) Imagen: arrastra un PNG/JPG (o elígelo). Puede ser el marcador completo (con borde negro)
//    o solo el dibujo interior: NyAR.makePattern lo detecta solo (edge: 'auto').
// 2) Cámara: los cuadrados negros que no son marcadores conocidos se ven en amarillo.
//    Pulsa ESPACIO (o el botón) para capturar el más grande como patrón nuevo.
// Cada patrón nuevo se registra al momento con addARMarker() para probarlo en vivo,
// y se puede descargar como .patt y como marcador imprimible (PNG).

let cam, ar;
let current = null; // { name, patt, inner (canvas del dibujo interior) }
const COLORS = [[46, 204, 113], [0, 180, 255], [255, 120, 0], [255, 0, 200], [255, 230, 0], [160, 100, 255]];

function setup() {
  crearInterfaz(); // paneles y estilos (al final del archivo)
  NyAR.createARCanvas(this, { parent: 'stage', maxScale: 1 }); // vertical en el celular
  cam = NyAR.createCamera(this);   // cámara trasera en el celular, webcam en la laptop

  ar = new NyAR.MultiMarker(this, width, height, { lostDelay: 3 });
  ar.addARMarker('hiro', 80, { name: 'Hiro' });
  ar.on('found', refreshList).on('lost', refreshList);

  setupUI();
  refreshList();
}

function draw() {
  background(12);
  if (ar.error) return setStatus('error', 'Error: ' + ar.error.message);
  if (!ar.ready) return setStatus('wait', 'Cargando motor ARToolKit…');
  const hasFrame = ar.detect(cam);
  ar.applyCamera();
  ar.drawBackground();
  if (!hasFrame) return setStatus('wait', 'Esperando la cámara…');

  ar.drawSquares(); // verdes = conocidos, amarillos = candidatos a capturar
  for (const id of ar.getExistMarkers()) {
    const c = COLORS[id % COLORS.length];
    ar.beginTransform(id);
    push();
    translate(0, 0, 15);
    stroke(255); strokeWeight(1); fill(c[0], c[1], c[2], 220);
    box(30);
    pop();
    ar.endTransform();
  }
  const unknown = ar.getLargestUnknownSquare();
  setStatus(unknown ? 'search' : 'ok',
    unknown ? 'Cuadrado desconocido a la vista: pulsa ESPACIO para capturarlo'
            : `Marcadores visibles: ${ar.getExistMarkers().map(i => ar.getMarkerName(i)).join(', ') || '—'}`);
}

// ---------- crear patrones ----------

function fromImage(img, name) {
  const edgeSel = document.getElementById('edge').value;
  const edge = edgeSel === 'auto' ? 'auto' : Number(edgeSel);
  const patt = NyAR.makePattern(img, { edge });
  const r = NyAR.makePattern.lastRegion;
  const inner = cropToCanvas(img, r.x, r.y, r.w, r.h);
  usePattern({ name, patt, inner, info: `Imagen ${img.naturalWidth || img.width}×${img.naturalHeight || img.height} · ${r.mode}` });
}

function fromCamera() {
  const sq = ar.getLargestUnknownSquare();
  if (!sq) return flash('No hay ningún cuadrado desconocido a la vista');
  const patt = ar.capturePattern(sq);
  const cap = ar.lastCapture.canvas; // 128×128, marcador completo rectificado
  const inner = cropToCanvas(cap, 32, 32, 64, 64);
  usePattern({ name: 'captura' + (ar.getMarkerCount()), patt, inner, info: 'Capturado desde la cámara' });
}

function usePattern(p) {
  current = p;
  // ¿servirá como marcador? (contraste, detalle, simetría) y ¿se parece a uno ya registrado?
  const q = NyAR.makePattern.lastInfo || { ok: true, warnings: [] };
  const warnings = q.warnings.slice();
  for (let i = 0; i < ar.getMarkerCount(); i++) {
    const other = ar.getPattern(i);
    if (other && NyAR.comparePatterns(p.patt, other) > 0.75) {
      warnings.push(`Se parece mucho a "${ar.getMarkerName(i)}": la cámara podría confundirlos.`);
    }
  }
  ar.addARMarker(p.patt, Number(document.getElementById('size').value) || 80, { name: p.name });
  // vistas previas
  drawScaled(document.getElementById('pvInner'), p.inner, true);
  drawScaled(document.getElementById('pvPatt'), NyAR.pattToImage(p.patt).canvas, false);
  const head = `${p.name} · ${p.info} · registrado como marcador ${ar.getMarkerCount() - 1}`;
  const verdict = !q.ok ? '<b style="color:#e74c3c">✖ Esta imagen probablemente no funcionará como marcador.</b>'
    : warnings.length ? '<b style="color:#f1c40f">⚠ Funcionará, con cuidado:</b>' : '<b style="color:#2ecc71">✔ Buena imagen para marcador.</b>';
  document.getElementById('info').innerHTML = `${head}<br>${verdict}` + warnings.map(w => `<br>· ${w}`).join('');
  document.getElementById('dlPatt').disabled = false;
  document.getElementById('dlPng').disabled = false;
  refreshList();
}

function cropToCanvas(src, x, y, w, h) {
  const el = src.elt || src.canvas || src;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(el, x, y, w, h, 0, 0, 512, 512);
  return c;
}

function drawScaled(canvas, src, smooth) {
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = smooth;
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.drawImage(src, 0, 0, canvas.width, canvas.height);
}

// ---------- interfaz ----------

function setupUI() {
  const file = document.getElementById('file');
  file.addEventListener('change', () => file.files[0] && loadFile(file.files[0]));
  document.addEventListener('dragover', e => { e.preventDefault(); document.body.classList.add('drag'); });
  document.addEventListener('dragleave', () => document.body.classList.remove('drag'));
  document.addEventListener('drop', e => {
    e.preventDefault();
    document.body.classList.remove('drag');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) loadFile(f);
  });
  document.getElementById('capture').addEventListener('click', fromCamera);
  document.getElementById('dlPatt').addEventListener('click', () => current && NyAR.savePattern(current.patt, current.name + '.patt'));
  document.getElementById('dlPng').addEventListener('click', () => {
    if (!current) return;
    const g = NyAR.makeMarkerImage(current.inner, { size: 1024 });
    const a = document.createElement('a');
    a.href = g.canvas.toDataURL('image/png');
    a.download = current.name + '-marcador.png';
    a.click();
  });
}

function loadFile(f) {
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => fromImage(img, f.name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_') || 'marcador');
  img.src = url;
}

function keyPressed() {
  if (key === ' ') { fromCamera(); return false; }
}

function refreshList() {
  const ul = document.getElementById('list');
  if (!ul || !ar) return;
  ul.innerHTML = '';
  for (let i = 0; i < ar.getMarkerCount(); i++) {
    const c = COLORS[i % COLORS.length];
    const li = document.createElement('li');
    li.innerHTML = `<span class="sw" style="background:rgb(${c})"></span>${i} · ${ar.getMarkerName(i)} ${ar.isExist(i) ? '✔' : ''}`;
    ul.appendChild(li);
  }
}

let flashUntil = 0, flashMsg = '';
function flash(msg) { flashMsg = msg; flashUntil = millis() + 2000; }
function setStatus(kind, msg) {
  if (millis() < flashUntil) { kind = 'error'; msg = flashMsg; }
  document.getElementById('hud').innerHTML = `<div class="row"><span class="dot ${kind}"></span>${msg}</div>`;
}

// ---------- interfaz ----------
// Estilos y paneles se crean desde aquí: así el ejemplo funciona con el index.html que trae el
// p5.js Web Editor (y al exportarlo o subirlo a tu servidor) sin tocar nada más.
function crearInterfaz() {
  document.head.insertAdjacentHTML('beforeend', `<style>
    body { margin: 0; background: #111; color: #eee; font: 14px system-ui, sans-serif; }
    #stage { position: relative; display: inline-block; line-height: 0; }
    #hud { padding: 8px 12px; }
    .row { display: flex; align-items: center; gap: 8px; font-weight: 600; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #888; flex: none; }
    .dot.ok { background: #2ecc71; } .dot.search { background: #f1c40f; } .dot.error { background: #e74c3c; }
    .grid { display: grid; grid-template-columns: auto auto; gap: 2px 16px; margin-top: 6px; width: max-content; }
    .keys { opacity: .7; margin-top: 6px; }
    main { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
    aside { padding: 8px 12px; width: 300px; display: grid; gap: 10px; }
    aside h2 { font-size: 15px; margin: 6px 0 0; }
    .pv { display: flex; gap: 10px; }
    .pv figure { margin: 0; text-align: center; font-size: 12px; opacity: .85; }
    #pvPatt { image-rendering: pixelated; }
    .pv canvas { width: 128px; height: 128px; background: #333; border: 1px solid #444; display: block; }
    button, select, input { font: inherit; }
    button { padding: 6px 10px; border-radius: 6px; border: 1px solid #555; background: #222; color: #eee; cursor: pointer; }
    button:disabled { opacity: .4; cursor: default; }
    #info { font-size: 12px; opacity: .8; min-height: 2.4em; }
    ul { margin: 0; padding-left: 0; list-style: none; }
    li { display: flex; align-items: center; gap: 6px; }
    .sw { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
    body.drag { outline: 3px dashed #f1c40f; outline-offset: -6px; }

  </style>`);
  document.body.insertAdjacentHTML('afterbegin', `
    <main>
      <div>
        <div id="stage"></div>
        <div id="hud"></div>
      </div>
      <aside>
        <h2>1 · Desde una imagen</h2>
        <div>Arrastra un PNG/JPG aquí o <input type="file" id="file" accept="image/*"></div>
        <label>Borde: <select id="edge">
          <option value="auto">automático</option>
          <option value="0">la imagen es solo el dibujo interior</option>
          <option value="25">marcador completo, borde 25%</option>
        </select></label>
        <h2>2 · Desde la cámara</h2>
        <div><button id="capture">Capturar cuadrado amarillo (espacio)</button></div>
        <label>Ancho impreso: <input id="size" type="number" value="80" min="10" style="width:5em"> mm</label>
        <h2>Resultado</h2>
        <div class="pv">
          <figure><canvas id="pvInner" width="256" height="256"></canvas>dibujo interior</figure>
          <figure><canvas id="pvPatt" width="16" height="16"></canvas>.patt (16×16)</figure>
        </div>
        <div id="info">Aún no hay patrón.</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap">
          <button id="dlPatt" disabled>Descargar .patt</button>
          <button id="dlPng" disabled>Descargar marcador PNG</button>
        </div>
        <h2>Marcadores registrados</h2>
        <ul id="list"></ul>
      </aside>
    </main>
    
  `);
}

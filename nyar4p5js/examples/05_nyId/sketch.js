// nyar4p5 · 05 nyId — marcadores de ID numérico de nyatla (NyId)
//
// NyId 0 → cubo · NyId 1 → esfera · cualquier otro NyId de 2 a 511 → su número flotando encima.
// Los NyId se leen con el decodificador de NyARToolkit portado a JavaScript:
// no hay que entrenar ni cargar archivos, basta con imprimirlos.
// Panel lateral: genera el PNG imprimible de cualquier ID.
// Teclas: D diagnóstico

let cam, ar, showDiag = true;
let ANY; // índice del marcador de rango
const tags = {};

function setup() {
  crearInterfaz(); // paneles y estilos (al final del archivo)
  NyAR.createARCanvas(this, { parent: 'stage', maxScale: 1 }); // vertical en el celular
  cam = NyAR.createCamera(this);   // cámara trasera en el celular, webcam en la laptop

  ar = new NyAR.MultiMarker(this, width, height, { lostDelay: 4 });
  ar.addNyIdMarker(0, 80);             // índice 0: solo el NyId 0, de 80 mm (borde negro incluido)
  ar.addNyIdMarker(1, 80);             // índice 1: solo el NyId 1
  ANY = ar.addNyIdMarker(2, 511, 80);  // índice 2: cualquier NyId de 2 a 511

  setupPanel();
}

function draw() {
  background(12);
  if (ar.error) return status('error', 'Error: ' + ar.error.message);
  if (!ar.ready) return status('wait', 'Cargando motor ARToolKit…');
  const hasFrame = ar.detect(cam);
  ar.applyCamera();
  ar.drawBackground();
  if (!hasFrame) return status('wait', 'Esperando la cámara…');

  if (showDiag) ar.drawSquares(); // verde = registrado · celeste = NyId fuera de los rangos · amarillo = otro cuadrado

  if (ar.isExist(0)) {
    ar.beginTransform(0);
    push(); translate(0, 0, 20); normalMaterial(); stroke(255); box(40); pop();
    ar.endTransform();
  }
  if (ar.isExist(1)) {
    ar.beginTransform(1);
    push(); translate(0, 0, 25); noStroke(); ambientLight(90); directionalLight(255, 255, 255, 0.2, 0.4, -1);
    ambientMaterial(255, 140, 0); sphere(22); pop();
    ar.endTransform();
  }
  if (ar.isExist(ANY)) {
    ar.beginSurface(ANY); // el papel como lienzo 2D
    push(); translate(0, 0, 1); noStroke(); fill(0, 200, 255, 150); rect(-28, -28, 56, 56); // placa sobre el papel
    fill(255, 210, 0); triangle(0, -40, -8, -30, 8, -30); pop();                              // flecha hacia "arriba" del NyId
    ar.endTransform();
  }
  updateTags();
  status(ar.getExistMarkers().length ? 'ok' : 'search', hudText());
}

// etiqueta HTML con el número sobre cada marcador visible
function updateTags() {
  for (let i = 0; i < ar.getMarkerCount(); i++) {
    if (!tags[i]) {
      tags[i] = document.createElement('div');
      tags[i].className = 'tag';
      document.getElementById('stage').appendChild(tags[i]);
    }
    const s = ar.isExist(i) ? ar.marker2Screen(i, 0, 0, 55) : null;
    tags[i].style.display = s ? 'block' : 'none';
    if (s) {
      tags[i].textContent = 'NyId ' + ar.getNyId(i);
      const k = drawingContext.canvas.clientWidth / width; // el lienzo puede verse escalado en pantalla
      tags[i].style.transform = `translate(${s[0] * k}px, ${s[1] * k}px) translate(-50%, -100%)`;
    }
  }
}

function hudText() {
  const vis = ar.getExistMarkers().map(i => ar.getNyId(i));
  const others = ar.getSquares().filter(s => s.nyid >= 0 && s.marker < 0).map(s => s.nyid);
  return (vis.length ? 'NyId visibles: ' + vis.join(', ') : 'Muestra un NyId a la cámara (imprime uno desde el panel)') +
    (others.length ? ` · fuera de rango: ${others.join(', ')}` : '');
}

function status(kind, msg) {
  document.getElementById('hud').innerHTML = `<div class="row"><span class="dot ${kind}"></span>${msg}</div>
    <div class="keys">D diagnóstico</div>`;
}

function keyPressed() {
  if (key === 'd' || key === 'D') showDiag = !showDiag;
}

// ---------- generador de marcadores ----------

const preview = document.createElement('canvas'); // 1024×1024 para imprimir
preview.width = preview.height = 1024;
function setupPanel() {
  const input = document.getElementById('nyid');
  const make = () => {
    const id = Number(input.value);
    try {
      NyAR.makeNyIdMarkerImage(id, { canvas: preview });
      const c = document.getElementById('pv');
      c.getContext('2d').drawImage(preview, 0, 0, c.width, c.height);
      document.getElementById('info').textContent =
        `NyId ${id} · modelo ${id <= 511 ? 2 : 3} (${id <= 511 ? '5×5' : '7×7'} celdas interiores)`;
    } catch (e) {
      document.getElementById('info').textContent = e.message;
    }
  };
  input.addEventListener('input', make);
  document.getElementById('dl').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = preview.toDataURL('image/png');
    a.download = `nyid-${input.value}.png`;
    a.click();
  });
  make();
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
    .tag { position: absolute; left: 0; top: 0; line-height: 1; padding: 4px 8px; border-radius: 6px;
    background: rgba(0,0,0,.75); color: #fff; font-weight: 700; pointer-events: none; white-space: nowrap; }
    main { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
    aside { padding: 8px 12px; width: 280px; display: grid; gap: 10px; }
    aside h2 { font-size: 15px; margin: 6px 0 0; }
    #pv { width: 256px; height: 256px; background: #fff; display: block; }
    button, input { font: inherit; }
    button { padding: 6px 10px; border-radius: 6px; border: 1px solid #555; background: #222; color: #eee; cursor: pointer; }
    #info { font-size: 12px; opacity: .8; }

  </style>`);
  document.body.insertAdjacentHTML('afterbegin', `
    <main>
      <div>
        <div id="stage"></div>
        <div id="hud"></div>
      </div>
      <aside>
        <h2>Generar un NyId para imprimir</h2>
        <label>ID: <input id="nyid" type="number" value="0" min="0" max="33554431" style="width:9em"></label>
        <canvas id="pv" width="512" height="512"></canvas>
        <div id="info"></div>
        <div><button id="dl">Descargar PNG</button></div>
        <div id="info2" style="font-size:12px;opacity:.7">0–511: modelo 2 (el clásico). Desde 512: modelo 3.
          Mide el ancho en mm incluyendo el borde negro.</div>
      </aside>
    </main>
    
  `);
}

// nyar4p5 · 07 cohete — el cubo de 2009 convertido en cohete
// Formas básicas de p5.js con el estilo de aquel cubo: caras blancas y líneas amarillas.
// Pensado para el celular: usa la cámara trasera (en la laptop, la webcam) y se controla con un TAP.
//   1er tap: el cubo se transforma en cohete · 2do tap: despega · al volver, aparece otra vez el cubo
// En el p5.js Web Editor: sube nyar4p5.js y en index.html agrega las líneas de ARToolkit.js y nyar4p5.js.
// No hace falta nada más en index.html.

let cam, ar;
let estado = 'cubo';        // 'cubo' → 'transformando' → 'cohete' → 'vuelo' → 'cubo'
let t0 = 0;                 // momento en que empezó la transformación
let alt = 0, vel = 0;       // altura y velocidad del cohete (mm)
const TRANSFORMAR_MS = 900;

function setup() {
  NyAR.createARCanvas(this, { fit: 'cover' }); // vertical en el celular, llena la pantalla
  cam = NyAR.createCamera(this);             // cámara trasera en el celular, webcam en la laptop
  ar = new NyAR.MultiMarker(this, width, height);
  ar.addARMarker('hiro', 80); // marcador Hiro de 80 mm
}

function draw() {
  background(0);
  if (!ar.ready || !ar.detect(cam)) return hud('Acepta el permiso de la cámara…');
  ar.applyCamera();
  ar.drawBackground();
  updateFlight();

  if (!ar.isExist(0)) return hud('Apunta la cámara al marcador Hiro');

  ar.beginTransform(0);
  fill(255);
  stroke(255, 215, 0); // amarillo
  strokeWeight(2);
  if (estado === 'cubo') {
    cubo(1);
  } else if (estado === 'transformando') {
    const k = constrain((millis() - t0) / TRANSFORMAR_MS, 0, 1);
    const e = k * k * (3 - 2 * k);        // suavizado
    push(); rotateZ(e * TWO_PI); cubo(1 - e); pop();
    push(); rotateZ(e * TWO_PI); scale(max(e, 0.001)); drawRocket(0, false); pop();
    if (k >= 1) estado = 'cohete';
  } else {
    drawRocket(alt, estado === 'vuelo');
  }
  ar.endTransform();

  hud({ cubo: 'Toca la pantalla', transformando: '…', cohete: 'Toca para despegar', vuelo: '¡Despegando!' }[estado]);
}

// un tap (o clic) avanza la historia
function tocar() {
  if (estado === 'cubo' && ar.isExist(0)) { estado = 'transformando'; t0 = millis(); }
  else if (estado === 'cohete') { estado = 'vuelo'; alt = 0; vel = 0; }
}
let ultimoTap = -1e9;
function tap(e) {
  const t = (e && e.timeStamp) || performance.now(); // hora del toque (aunque el frame vaya lento)
  if (t - ultimoTap > 350) tocar(); // en algunos celulares un mismo tap llega como toque y como clic
  ultimoTap = t;
  return false;
}
function touchStarted(e) { return tap(e); }
function mousePressed(e) { return tap(e); }

function cubo(s) {
  if (s <= 0.001) return;
  push();
  translate(0, 0, 20 * s);
  box(40 * s); // el cubo de siempre
  pop();
}

// texto de ayuda abajo de la pantalla (se crea aquí: sirve con el index.html del editor tal cual)
let hudDiv;
function hud(msg) {
  if (!hudDiv) {
    hudDiv = createDiv('');
    hudDiv.style('position', 'fixed').style('left', '0').style('right', '0').style('bottom', '24px')
      .style('text-align', 'center').style('color', '#fff').style('font', '700 18px system-ui, sans-serif')
      .style('text-shadow', '0 1px 4px #000').style('pointer-events', 'none');
  }
  hudDiv.html(msg);
}

// Cohete de formas básicas. Origen en el centro del papel; +Z sale del papel.
// Las caras son blancas y solo las aristas van en amarillo, como el cubo original.
const LADOS = 8; // cilindros y conos de 8 lados: se ven facetados, estilo retro

function drawRocket(z, engineOn) {
  push();
  translate(0, 0, z);
  rotateX(HALF_PI); // en p5 los cilindros y conos van a lo largo de Y: así quedan de pie sobre el papel

  prisma(12, 10, 54);        // cuerpo: radio 12, de la altura 10 a la 54
  punta(12, 54, 80);         // punta: de la altura 54 a la 80
  prisma(8, 6, 10);          // tobera
  ventana(5, 40, 12);        // ventana redonda en el cuerpo
  for (let i = 0; i < 4; i++) {   // cuatro aletas
    push();
    rotateY(i * HALF_PI + QUARTER_PI);
    translate(16, 18, 0);
    box(10, 18, 2);          // los box se dibujan con aristas limpias
    pop();
  }
  if (engineOn) fuego();
  pop();
}

// cilindro facetado con caras blancas y aristas amarillas
function prisma(r, y0, y1) {
  push();
  noStroke();
  translate(0, (y0 + y1) / 2, 0);
  cylinder(r, y1 - y0, LADOS, 1);
  pop();
  const a = anillo(r, y0), b = anillo(r, y1);
  beginShape(LINES);
  for (let i = 0; i < LADOS; i++) {
    const j = (i + 1) % LADOS;
    vertex(...a[i]); vertex(...a[j]);   // borde de abajo
    vertex(...b[i]); vertex(...b[j]);   // borde de arriba
    vertex(...a[i]); vertex(...b[i]);   // arista vertical
  }
  endShape();
}

// cono facetado (la punta del cohete)
function punta(r, y0, y1) {
  push();
  noStroke();
  translate(0, (y0 + y1) / 2, 0);
  cone(r, y1 - y0, LADOS, 1);
  pop();
  const a = anillo(r, y0);
  beginShape(LINES);
  for (let i = 0; i < LADOS; i++) {
    vertex(...a[i]); vertex(...a[(i + 1) % LADOS]);
    vertex(...a[i]); vertex(0, y1, 0);
  }
  endShape();
}

function ventana(r, y, salida) {
  push();
  translate(0, y, salida + 0.5);
  fill(255);
  ellipse(0, 0, r * 2, r * 2, LADOS * 2);
  pop();
}

function fuego() {
  const f = 16 + 12 * noise(frameCount * 0.3);
  push();
  translate(0, 6 - f / 2, 0);
  rotateX(PI); // la llama apunta hacia abajo
  fill(255, 215, 0);
  stroke(255, 140, 0);
  cone(7, f, LADOS, 1);
  pop();
}

// puntos de un octágono a la altura y (un poco más grande que la cara, para que la línea se vea encima)
function anillo(r, y) {
  const out = [];
  for (let i = 0; i < LADOS; i++) {
    const t = TWO_PI * i / LADOS;
    out.push([cos(t) * r * 1.01, y, sin(t) * r * 1.01]);
  }
  return out;
}

function updateFlight() {
  if (estado === 'vuelo') {
    const f = min(deltaTime / 16.7, 3); // por tiempo, no por frame: igual de rápido en cualquier celular
    vel += 0.15 * f;      // aceleración
    alt += vel * f;
    if (alt > 600) {      // fuera de cuadro: vuelve el cubo y la historia empieza otra vez
      estado = 'cubo'; alt = 0; vel = 0;
    }
  }
}

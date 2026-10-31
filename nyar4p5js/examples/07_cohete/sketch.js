// nyar4p5 · 07 cohete — el cubo de 2009 convertido en cohete
// Formas básicas de p5.js con el estilo de aquel cubo: caras blancas y líneas amarillas.
// Teclas: ESPACIO despegar · C ver el cubo original
// En el p5.js Web Editor: sube nyar4p5.js y en index.html usa <script src="nyar4p5.js"></script>

let cam, ar;
let alt = 0, vel = 0, flying = false, landedAt = 0;
let showCube = false;

function setup() {
  createCanvas(640, 480, WEBGL).parent('stage');
  cam = createCapture({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  cam.hide();
  ar = new NyAR.MultiMarker(this, 640, 480);
  ar.addARMarker('hiro', 80); // marcador Hiro de 80 mm
}

function draw() {
  background(0);
  if (!ar.ready || !ar.detect(cam)) return;
  ar.applyCamera();
  ar.drawBackground();
  updateFlight();

  if (ar.isExist(0)) {
    ar.beginTransform(0);
    fill(255);
    stroke(255, 215, 0); // amarillo
    strokeWeight(2);
    if (showCube) {
      translate(0, 0, 20);
      box(40); // el cubo de siempre
    } else {
      drawRocket(alt, flying);
    }
    ar.endTransform();
  }
  document.getElementById('hud').textContent = showCube ? 'C: volver al cohete' : 'ESPACIO: despegar · C: ver el cubo original';
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
  if (flying) {
    vel += 0.15;          // aceleración (mm por frame²)
    alt += vel;
    if (alt > 600) {      // fuera de cuadro: vuelve a la plataforma
      flying = false; alt = 0; vel = 0; landedAt = millis();
    }
  }
}

function keyPressed() {
  if (key === ' ' && !flying && !showCube) { flying = true; vel = 0; }
  if (key === 'c' || key === 'C') showCube = !showCube;
  return false;
}

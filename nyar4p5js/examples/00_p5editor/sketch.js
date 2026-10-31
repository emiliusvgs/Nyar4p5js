// nyar4p5 en el p5.js Web Editor
// Solo necesitas subir nyar4p5.js (y, si quieres, tu imagen de marcador en PNG/JPG).
// Los marcadores Hiro y Kanji ya vienen dentro de la librería.

let cam, ar;

function setup() {
  NyAR.createARCanvas(this);       // vertical en el celular, horizontal en la laptop
  cam = NyAR.createCamera(this);   // cámara trasera en el celular, webcam en la laptop

  ar = new NyAR.MultiMarker(this, width, height);   // mismo tamaño que el lienzo
  ar.addARMarker('hiro', 80);                   // 0: Hiro incluido, 80 mm
  ar.addARMarker('kanji', 80);                  // 1: Kanji incluido

  // 2: tu propio marcador. Súbelo al editor (PNG o JPG) y escribe aquí su nombre.
  // Puede ser el marcador imprimible que genera el ejemplo 04_patternMaker.
  loadImage('mi-marcador.png', img => ar.addARMarker(img, 80, { name: 'mío' }), () => {});
}

function draw() {
  background(0);
  if (!ar.ready || !ar.detect(cam)) return;
  ar.applyCamera();
  ar.drawBackground();

  for (const id of ar.getExistMarkers()) {
    ar.beginTransform(id);
    translate(0, 0, 25);
    normalMaterial();
    if (id === 0) box(40);
    else if (id === 1) sphere(25);
    else { rotateX(HALF_PI); cone(25, 50); }
    ar.endTransform();
  }
}

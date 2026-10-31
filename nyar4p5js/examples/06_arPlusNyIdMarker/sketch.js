// nyar4p5 · 06 arPlusNyIdMarker
// Port a p5.js del ejemplo "arPlusNyIdMarker" de NyARToolkit for Processing (c)2008-2017 nyatla.
// Marcadores AR (Hiro, Kanji) y NyId (0 y 1) al mismo tiempo, cada uno con su cubo de color.
// El código sigue línea a línea al original de Processing.

let cam, nya;

function setup() {
  createCanvas(640, 480, WEBGL).parent('stage');
  colorMode(RGB, 100);
  console.log('nyar4p5', NyAR.version);
  cam = createCapture({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  cam.hide();
  nya = new NyAR.MultiMarker(this, width, height);
  nya.addARMarker('hiro', 80);  // id=0
  nya.addARMarker('kanji', 80); // id=1
  nya.addNyIdMarker(0, 80);                 // id=2
  nya.addNyIdMarker(1, 80);                 // id=3
}

function draw() {
  if (!nya.ready || !nya.detect(cam)) return; // equivale a cam.available() + cam.read() + nya.detect(cam)
  background(0);
  nya.setARPerspective();
  nya.drawBackground(cam); // fondo alineado con el frustum
  for (let i = 0; i < 4; i++) {
    if (!nya.isExist(i)) continue;
    nya.beginTransform(i);
    fill(100 * (Math.floor((i + 1) / 4) % 2), 100 * (Math.floor((i + 1) / 2) % 2), 100 * ((i + 1) % 2));
    translate(0, 0, 20);
    box(40);
    nya.endTransform();
  }
  const vis = nya.getExistMarkers().map(i => ['Hiro', 'Kanji', 'NyId 0', 'NyId 1'][i]);
  document.getElementById('hud').textContent = vis.length ? 'Visibles: ' + vis.join(', ') : 'Muestra Hiro, Kanji, NyId 0 o NyId 1';
}

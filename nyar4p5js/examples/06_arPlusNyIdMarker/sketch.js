// nyar4p5 · 06 arPlusNyIdMarker
// Port a p5.js del ejemplo "arPlusNyIdMarker" de NyARToolkit for Processing (c)2008-2017 nyatla.
// Marcadores AR (Hiro, Kanji) y NyId (0 y 1) al mismo tiempo, cada uno con su cubo de color.
// El código sigue línea a línea al original de Processing.

let cam, nya;

function setup() {
  crearInterfaz(); // paneles y estilos (al final del archivo)
  NyAR.createARCanvas(this, { parent: 'stage' }); // vertical en el celular, horizontal en la laptop
  colorMode(RGB, 100);
  console.log('nyar4p5', NyAR.version);
  cam = NyAR.createCamera(this);   // cámara trasera en el celular, webcam en la laptop
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

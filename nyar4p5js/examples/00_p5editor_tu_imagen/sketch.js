// nyar4p5 · Convierte TU imagen en marcador, directamente en el p5.js Web Editor
//
// Antes: en index.html deben estar las líneas de ARToolkit.js y nyar4p5.js, y nyar4p5.js subido al editor.
//
// 1. Sube tu imagen al editor (PNG o JPG) y escribe su nombre en MI_IMAGEN.
//    Puede ser un logo, un dibujo o una foto con formas claras. NO necesita borde.
// 2. Dale Play y pulsa S: se descarga mi-marcador.png, tu imagen con el borde negro que la cámara necesita.
// 3. Imprime mi-marcador.png (o ábrelo en otra pantalla) y muéstraselo a la cámara.
//    La cámara solo reconoce la imagen CON ese borde. Revisa la consola: avisa si la imagen no sirve.

const MI_IMAGEN = 'mi-imagen.png';

let cam, ar, img;

function setup() {
  if (typeof NyAR === 'undefined') {
    throw new Error('Falta nyar4p5: sube nyar4p5.js y agrega en index.html las líneas de ARToolkit.js y nyar4p5.js');
  }
  NyAR.createARCanvas(this);       // vertical en el celular, horizontal en la laptop
  cam = NyAR.createCamera(this);   // cámara trasera en el celular, webcam en la laptop

  ar = new NyAR.MultiMarker(this, width, height);
  ar.setConfidenceThreshold(0.7); // más exigente: evita que otros papeles se confundan con tu imagen
  loadImage(MI_IMAGEN, i => {
    img = i;
    ar.addARMarker(img, 80); // tu imagen convertida en marcador de 80 mm
  });
}

function draw() {
  background(0);
  if (!ar.ready || !ar.detect(cam)) return;
  ar.applyCamera();
  ar.drawBackground();

  if (ar.isExist(0)) {
    ar.beginTransform(0);
    translate(0, 0, 25);
    normalMaterial();
    box(40); // cambia esto por lo que quieras que aparezca
    ar.endTransform();
  }
}

function keyPressed() {
  if ((key === 's' || key === 'S') && img) NyAR.saveMarkerImage(img, 'mi-marcador.png');
}

<img width="2048" height="2048" alt="nyar4p5js" src="https://github.com/user-attachments/assets/81142a0c-2b13-46c9-9921-115c09ce8b79" />


# Nyar4p5js
Nyartoolkit (realidad aumentada) que funciona ahora en p5js (realidad aumentada web)
Se lee: Nyar-for-p5js
# nyar4p5js v0.3.4

**Realidad aumentada con marcadores cuadrados para p5.js**, con una API que continúa la de
[NyAR4psg](https://github.com/nyatla/NyARToolkit-for-Processing) (NyARToolkit for Processing).

nyar4p5js es un homenaje a la obra de **nyatla** (Ryo Iizuka): NyARToolkit acercó la AR con marcadores a
Processing y a toda una generación de artistas y creadores. Este proyecto lleva esa forma de trabajar
(`addARMarker`, `addNyIdMarker`, `detect`, `isExist`, `beginTransform`…) a p5.js en el navegador.

- **Marcadores de patrón (`.patt`)**: Hiro, Kanji o los tuyos, convertidos desde cualquier imagen.
- **Marcadores NyId**: los marcadores de ID numérico de nyatla. El lector es un **port a JavaScript del
  código original de NyARToolkit**, y lee exactamente los mismos marcadores.
- Por debajo, la búsqueda de cuadrados y el cálculo de la pose los hace **ARToolKit5 compilado a WebAssembly**.

> Todavía no incluye NFT (imágenes naturales) ni las PsARPlayCard.

---

## Inicio rápido

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.13/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ar-js-org/artoolkit5-js@0.3.2/dist/ARToolkit.js"></script>
<script src="nyar4p5.js"></script>
```

```js
let cam, ar;

function setup() {
  createCanvas(640, 480, WEBGL);
  cam = createCapture({ video: { width: 640, height: 480 }, audio: false });
  cam.hide();
  ar = new NyAR.MultiMarker(this, 640, 480);
  ar.addARMarker('hiro', 80);   // marcador 0: Hiro (incluido en la librería), 80 mm de lado
}

function draw() {
  if (!ar.ready) return;
  ar.detect(cam);
  ar.applyCamera();       // proyección de la cámara real (alias: setARPerspective)
  ar.drawBackground();    // video de fondo
  if (ar.isExist(0)) {
    ar.beginTransform(0);
    translate(0, 0, 20);  // +Z sale del papel hacia la cámara
    normalMaterial();
    box(40);
    ar.endTransform();
  }
}
```

Funciona igual con ** 1.x y 2.x** (probado con 1.11.13 y 2.3.4). Para p5 2.x cambia el primer `<script>` por
`https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.min.js`.

## Ejemplos

| Carpeta | Qué muestra |
|---|---|
| `examples/00_p5editor` | **Listo para el p5.js Web Editor**: solo hay que subir `nyar4p5.js` |
| `examples/00_p5editor_tu_imagen` | **Tu imagen como marcador, en el p5.js Web Editor**: subes tu imagen, la cámara la reconoce y con la tecla S descargas el marcador para imprimir |
| `examples/01_simpleLite` | Cubo sobre Hiro, diagnóstico (contorno, ejes), umbral manual y automático |
| `examples/02_multiMarker` | **Hiro + Kanji a la vez**: objetos distintos, línea y distancia en mm entre ambos, etiquetas HTML que siguen a cada marcador, eventos de aparición/pérdida, dibujo 2D sobre el papel |
| `examples/03_mirror` | **Webcam frontal en espejo** (tecla M) y cambio de cámara frontal/trasera (tecla F) |
| `examples/04_patternMaker` | **Conversor imagen → .patt**: arrastra una imagen o captura un cuadrado desde la cámara, pruébalo en vivo y descarga el `.patt` y el marcador imprimible |
| `examples/05_nyId` | **Marcadores NyId**: NyId 0 y 1 con objetos propios, cualquier otro ID de 2 a 511 con su número encima, y generador de NyId imprimibles |
| `examples/06_arPlusNyIdMarker` | Port directo del ejemplo de nyatla del mismo nombre: Hiro, Kanji, NyId 0 y NyId 1 a la vez |
| `examples/07_cohete` | **El cubo de 2009 convertido en cohete**: formas básicas de p5.js con caras blancas y aristas amarillas; despega con la barra espaciadora |

**Cómo abrirlos**

- **Servidor local** (recomendado): desde la carpeta `nyar4p5/` ejecuta `python3 -m http.server` y entra a
  `http://localhost:8000/examples/02_multiMarker/`.
- **Archivo único**: la carpeta `standalone/` trae cada ejemplo en un solo `.html` con la librería y los datos
  embebidos. Se abre con doble clic en Chrome (necesita internet para p5 y ARToolKit desde CDN).
  Se regeneran con `python3 tools/build-standalone.py`.
- **p5.js Web Editor**: usa `examples/00_p5editor` (ver la sección "En el p5.js Web Editor").
- **En el celular** la cámara solo funciona por **HTTPS** (o `localhost`).

Marcadores para imprimir: `data/hiro.png`, `data/kanji.png` y `data/nyid-0.png`, `nyid-1.png`, `nyid-2.png`,
`nyid-3.png`, `nyid-42.png`. Mídelos sin el margen blanco: ese es el ancho en mm que va en `addARMarker` o
`addNyIdMarker`. El margen blanco alrededor del borde negro es necesario.

---

## API

### `new NyAR.MultiMarker(p, ancho, alto, [cameraPara], [opciones])`

- `p`: `this` en modo global, o la instancia en modo instancia.
- `ancho`, `alto`: tamaño de la imagen de proceso (640×480 recomendado). La fuente se
  recorta al centro para conservar la proporción 4:3.
- `cameraPara` (opcional, avanzado): no hace falta. La librería trae los datos de cámara estándar de ARToolKit,
  que funcionan bien con webcams y celulares. Solo si calibraste tu cámara puedes pasar aquí tu propio
  `camera_para.dat` (URL o bytes).
- `opciones` (todas opcionales):

| Opción | Por defecto | Para qué |
|---|---|---|
| `mirror` | `false` | Espejo horizontal para webcam frontal |
| `lostDelay` | `3` | Frames que un marcador sigue "existiendo" tras perderse (menos parpadeo) |
| `minConfidence` | `0.5` | Confianza mínima (0–1) para aceptar un patrón |
| `threshold` | `100` | Umbral de binarización (0–255) |
| `thresholdMode` | `'manual'` | `'manual'`, `'otsu'`, `'adaptive'`, `'median'`, `'bracketing'` |
| `patternRatio` | `0.5` | Proporción del dibujo interior (0.5 = borde negro de 25% por lado) |
| `patternMode` | `'color'` | Comparación de patrones `'color'` o `'mono'` |
| `near`, `far` | `10`, `10000` | Planos de recorte en mm |

Propiedades útiles: `ready`, `error`, `whenReady` (promesa), `detectMs`, `markersInFrame`, `sourceSize`.

### Marcadores

| Método | Descripción |
|---|---|
| `addARMarker(src, anchoMM, {name, edge})` | Registra un marcador y devuelve su índice. `src` puede ser una URL `.patt`, el texto de un `.patt`, una URL de imagen (`.png`, `.jpg`…) o una imagen ya cargada (`p5.Image`, `p5.Graphics`, `<img>`, `<canvas>`). Las imágenes se convierten a `.patt` solas |
| `addARMarker('hiro', 80)` / `addARMarker('kanji', 80)` | Marcadores clásicos incluidos en la librería (también en `NyAR.PATT.hiro` / `NyAR.PATT.kanji`) |
| `addARMarker(img, 16, 25, anchoMM)` | Forma de cuatro argumentos al estilo NyAR4psg: imagen, resolución (siempre 16 en ARToolKit5), % de borde, mm |
| `addNyIdMarker(nyid, anchoMM)` | Registra un NyId concreto (igual que en NyAR4psg) |
| `addNyIdMarker(desde, hasta, anchoMM)` | Registra un rango de NyId: cualquiera que aparezca dentro del rango. `getNyId(índice)` dice cuál es |
| `getNyId(id)` | ID numérico detectado en un marcador NyId (-1 si nunca se vio) |
| `getMarkerCount()`, `getMarkerName(id)`, `getMarkerType(id)`, `getMarkerWidth(id)`, `getPattern(id)` | Datos de los marcadores registrados (`getMarkerType` devuelve `'patt'` o `'nyid'`; `getPattern`, el texto `.patt`) |

Todos los marcadores, `.patt` y NyId, comparten la misma numeración: el índice que devuelve `addARMarker` o
`addNyIdMarker` es el que usas en `isExist`, `beginTransform`, etc.

### Detección y consultas

| Método | Descripción |
|---|---|
| `detect(fuente)` | Procesa un frame (`createCapture`, `createVideo`, `p5.Image`, `p5.Graphics`, `<video>`, `<canvas>`, `<img>`). Devuelve `false` si aún no hay imagen |
| `isExist(id)` | ¿Está visible (o dentro de `lostDelay`)? |
| `isDetected(id)` | ¿Se detectó en este frame exacto? |
| `getExistMarkers()` | Índices de los marcadores visibles |
| `getConfidence(id)`, `getLife(id)`, `getLostCount(id)` | Confianza, frames seguidos visible, frames seguidos perdido |
| `getMarkerPosition(id)` | Centro del marcador respecto de la cámara `[x, y, z]` en mm (`z` = distancia) |
| `getDistance(a, b)` | Distancia en mm entre dos marcadores |
| `getMarkerMatrix(id)` | Matriz 4×4 lista para `applyMatrix()` |
| `getTransMat(id)` | Matriz 3×4 cruda de ARToolKit |
| `getMarkerVertex2D(id)` | Esquinas en píxeles de la imagen de proceso |
| `marker2Screen(id, x, y, z)` | Punto del marcador (mm) → píxel del canvas. Respeta el espejo. Útil para poner HTML encima |
| `screen2MarkerCoordSystem(id, sx, sy)` | Píxel del canvas → punto sobre el plano del marcador (mm). Útil para "tocar" el papel |
| `getSquares()` | Todos los cuadrados que vio el detector, conocidos o no. Cada uno trae `nyid` (≥ 0 si se leyó un NyId) y `marker` (índice asignado o -1) |
| `on('found' \| 'lost', fn)`, `off(...)` | Eventos al aparecer o perderse un marcador: `fn(id)` |

### Dibujo

| Método | Descripción |
|---|---|
| `applyCamera()` / `setARPerspective()` | Proyección de la cámara real. Llamar al inicio de `draw()` |
| `drawBackground()` | Video de fondo alineado con la proyección |
| `beginTransform(id)` … `endTransform()` | Dibuja en el espacio del marcador (mm). X a la derecha, Y hacia arriba del patrón, Z sale del papel |
| `beginSurface(id)` … `endTransform()` | Igual, pero con Y invertida: el papel funciona como un lienzo 2D, así `text()`, `image()` y `rect()` se leen derechos |
| `drawContour(id, color)`, `drawSquares()`, `drawMarkerFrame(id)` | Diagnóstico: contorno detectado; todos los cuadrados (verde = registrado, celeste = NyId fuera de rango, amarillo = desconocido); borde del marcador y ejes |

### Ajustes

`setThreshold(n)`, `setThresholdMode(modo)`, `getThreshold()`, `setConfidenceThreshold(c)`,
`setLostDelay(frames)`, `setMirror(bool)`, `toggleMirror()`.

---

## Conversor imagen → .patt

Viene dentro de la librería. Funciona sin servidor ni herramientas externas.

```js
const patt = NyAR.makePattern(img);          // img: p5.Image, <img>, <canvas>, p5.Graphics…
NyAR.savePattern(patt, 'mi-marcador.patt');  // descarga el archivo
ar.addARMarker(patt, 80);                    // o úsalo al momento
```

- **`edge: 'auto'`** (por defecto) detecta si la imagen trae el **marcador completo** (borde negro, con o sin
  margen blanco) o **solo el dibujo interior**. También puedes forzarlo: `{ edge: 0 }` (la imagen entera es el
  dibujo interior) o `{ edge: 25 }` (marcador completo con borde de 25% por lado, sin margen).
- `NyAR.makePattern.lastRegion` indica qué zona se usó y cómo se interpretó.
- `NyAR.makePattern.lastInfo` dice si la imagen servirá: `{ ok, warnings, contrast, detail, symmetry }`.
- `NyAR.comparePatterns(a, b)` mide cuánto se parecen dos `.patt` (1 = iguales); útil para evitar marcadores
  que la cámara confundiría.
- El contraste se refuerza automáticamente, tanto en el `.patt` como en el marcador imprimible.
- `NyAR.pattToImage(patt)` devuelve la vista previa 16×16 (lo que "ve" ARToolKit).
- `NyAR.makeMarkerImage(dibujoInterior, { size: 1024 })` genera el marcador imprimible (`p5.Graphics`).
- `NyAR.saveMarkerImage(img, 'mi-marcador.png')` hace todo en un paso: genera el imprimible y lo descarga.
- Desde la cámara: `ar.capturePattern(ar.getLargestUnknownSquare())` crea un `.patt` con lo que hay dentro
  de un cuadrado negro que aún no es un marcador conocido. `ar.pickupMarkerImage(id)` devuelve la imagen
  rectificada de un marcador.

El formato de salida es el mismo `.patt` de ARToolKit (16×16, BGR, 4 orientaciones) que generan AR.js y la
herramienta clásica `mk_patt`, así que sirve también en otros proyectos.

## ¿Cualquier imagen sirve como marcador?

**Casi cualquiera, si se imprime con el borde negro que genera la página.** Se probó con ocho tipos de imagen,
cada una vista de frente, girada, inclinada y lejos:

| Imagen | Resultado |
|---|---|
| Foto real, texto, dibujo, logo a color | Se detectan en las 4 posiciones |
| Imagen con poco contraste o muy oscura | Se detectan gracias al refuerzo automático de contraste (sin él, fallaban) |
| Figura simétrica (un círculo) | Se detecta, pero el objeto puede aparecer girado: no hay un "arriba" claro |
| Textura de detalle muy fino (ruido) | **No funciona**: a la resolución del patrón (16×16) se ve gris uniforme |

Lo que conviene saber:

- La página del conversor (ejemplo 04) **avisa** si una imagen no va a funcionar, si es simétrica o si se
  parece demasiado a otro marcador ya registrado.
- Se imprime **el marcador que genera la página** (con borde negro y contraste reforzado), no la imagen original.
- Dos imágenes con el mismo dibujo, aunque cambie el color o el contraste, la cámara las ve como el mismo marcador.
- Si usas tus marcadores junto con otros (Hiro, Kanji…), sube el umbral de confianza para evitar confusiones:
  `ar.setConfidenceThreshold(0.7)`. En las pruebas, un dibujo propio llegó a confundirse con Kanji con 0.64.

## En el p5.js Web Editor

El editor solo deja subir ciertos tipos de archivo (código, imágenes, sonido, fuentes, texto…). Por eso la
librería no necesita ningún archivo extra: los datos de cámara y los marcadores Hiro y Kanji vienen dentro de
`nyar4p5.js`. En `examples/00_p5editor`:

1. Crea un sketch nuevo en el editor y reemplaza `index.html` y `sketch.js` por los de esa carpeta.
2. Sube `nyar4p5.js` (es un `.js`, el editor lo acepta).
3. Opcional: sube tu marcador como imagen (`mi-marcador.png`). Puede ser el que genera el ejemplo 04.
4. Dale play y acepta la cámara.

```js
ar = new NyAR.MultiMarker(this, 640, 480);
ar.addARMarker('hiro', 80);
```

### Convertir tu imagen en marcador (también en el editor)

No hace falta ninguna herramienta externa: la conversión la hace `nyar4p5.js`. Usa `examples/00_p5editor_tu_imagen`:

1. Sube tu imagen al editor (PNG o JPG): un logo, un dibujo o una foto con formas claras. **No necesita borde.**
2. Dale Play y pulsa **S**: se descarga `mi-marcador.png`, tu imagen con el borde negro y el contraste reforzado.
3. Imprime `mi-marcador.png` (o ábrelo en otra pantalla) y muéstraselo a la cámara.

La cámara solo reconoce la imagen **con ese borde negro**: es lo primero que busca para saber dónde está el papel.
Tu imagen original, sin borde, no la va a reconocer. La consola avisa si tu imagen no va a funcionar.

```js
loadImage('mi-imagen.png', img => {
  ar.addARMarker(img, 80);                       // la cámara ya la reconoce
  NyAR.saveMarkerImage(img, 'mi-marcador.png');  // descarga el marcador para imprimir
});
```

## Marcadores NyId

Los NyId son el sistema de marcadores de ID de nyatla: un borde negro de una celda y, dentro, una cuadrícula
que codifica un número. No se entrenan ni se cargan archivos: se imprimen y se registran por su número.

```js
ar.addNyIdMarker(0, 80);            // índice 0: el NyId 0, de 80 mm de lado (borde negro incluido)
const ANY = ar.addNyIdMarker(1, 511, 80); // índice 1: cualquier NyId de 1 a 511
// en draw():
if (ar.isExist(ANY)) console.log('veo el NyId', ar.getNyId(ANY));
```

| Modelo | Celdas interiores | IDs |
|---|---|---|
| 2 (el clásico) | 5×5 | 0 – 511 |
| 3 | 7×7 | 0 – 33 554 431 |

- **Generar marcadores**: `NyAR.makeNyIdMarkerImage(id, { size: 1024 })` devuelve el marcador imprimible
  (`p5.Graphics`, o dibuja en un `<canvas>` con `{ canvas }`). Usa el modelo 2 hasta el 511 y el 3 desde el 512;
  se puede forzar con `{ model: 3 }`. `NyAR.nyIdCells(id)` da la cuadrícula de 0/1 por si quieres dibujarlo tú.
- **Orientación**: el NyId está "derecho" cuando las celdas alternadas (la marca de sincronía) quedan a la
  izquierda y abajo, como en la plantilla de NyARToolkit. Ese lado define +Y hacia arriba, igual que en Hiro.
- **Cómo se leen**: ARToolKit encuentra el cuadrado; luego el lector portado de NyARToolkit
  (`NyIdMarkerPickup` y compañía) rectifica la imagen, calcula su propio umbral con los píxeles del marcador,
  mide la marca de sincronía, lee las celdas, comprueba el código de control y devuelve el número y la orientación.
- **Verificación**: se comparó con la biblioteca Java original de nyatla, compilada y ejecutada sobre las mismas
  imágenes (incluida la foto de prueba `320x240NyId.raw` de NyARToolkit). Los ID y la esquina superior izquierda
  coinciden en todos los casos. Los marcadores que genera nyar4p5 también los lee la versión Java.
- Un NyId registrado tiene prioridad sobre los `.patt` en el mismo cuadrado, como en NyARToolkit.
- La confianza (`getConfidence`) de un NyId es siempre 1: o se lee el código completo y válido, o no se detecta.

## Varios marcadores a la vez

- Registra cada marcador con su propio `addARMarker`: el índice que devuelve es el que usas en `isExist`,
  `beginTransform`, etc. No hay un límite práctico para unos pocos marcadores.
- Usa dibujos **claramente distintos y no simétricos**. Hiro y Kanji son el par clásico.
- Cada cuadrado del video se asigna al patrón que mejor coincide. Si registras **el mismo dibujo dos veces**
  (por ejemplo `'hiro'` y un marcador generado de `hiro.png`), solo uno de los dos se detectará.
- Si hay dos copias impresas del mismo marcador, se usa la de mayor confianza.

## Espejo para webcam frontal

```js
ar = new NyAR.MultiMarker(this, 640, 480, { mirror: true });
// o en cualquier momento: ar.setMirror(true) / ar.toggleMirror()
```

El detector siempre trabaja con la imagen **sin espejar**, porque los patrones no son simétricos y un patrón
espejado no se reconocería. El espejo se aplica al dibujar: fondo, contornos y objetos 3D se invierten a la
vez y quedan alineados. `marker2Screen` y `screen2MarkerCoordSystem` ya lo tienen en cuenta.
No uses la opción `{ flipped: true }` de `createCapture`: nyar4p5 lee el video directamente.

## Notas y límites

- Unidades en milímetros (se admiten anchos con decimales). Origen en el centro del marcador.
- Valores por defecto distintos a NyAR4psg: `lostDelay` 3 (allá 10) y `minConfidence` 0.5 (allá 0.51).
- La imagen de proceso es 4:3. En un celular en vertical, la cámara se recorta al centro.
- En modo global de p5 2.x evita nombres de funciones que choquen con p5 (`log`, `random`…).
- Cámara en el celular: requiere HTTPS.

## Estructura

```
nyar4p5.js          librería (un solo archivo, sin dependencias aparte de p5 y ARToolkit.js)
data/               marcadores para imprimir: hiro.png, kanji.png, nyid-*.png
examples/           00_p5editor … 07_cohete
standalone/         los mismos ejemplos en un solo .html cada uno
tools/              build-standalone.py (solo para mantener la librería: arma standalone/; no convierte imágenes)
LICENSE             GNU LGPL v3
```

## Cambios en v0.3.4

- Nuevo ejemplo `07_cohete`: el cubo de 2009 convertido en cohete hecho con formas básicas de p5.js, con caras
  blancas y aristas amarillas; despega con la barra espaciadora (la tecla C muestra el cubo original).

## Cambios en v0.3.3

- Más simple: ya no hacen falta `camera_para.dat` ni `patt.hiro`/`patt.kanji`. Los datos de cámara y los
  marcadores Hiro y Kanji vienen dentro de la librería: `new NyAR.MultiMarker(this, 640, 480)` y
  `addARMarker('hiro', 80)`. Todos los ejemplos usan esta forma, y funciona en el p5.js Web Editor
  (nuevo ejemplo `00_p5editor`).
- `NyAR.saveMarkerImage(img, nombre)`: de cualquier imagen al marcador imprimible en una línea; nuevo ejemplo
  `00_p5editor_tu_imagen` para hacerlo en el p5.js Web Editor.
- Conversor de imágenes: refuerzo automático de contraste y diagnóstico (`makePattern.lastInfo`,
  `comparePatterns`); el ejemplo 04 avisa si una imagen no servirá o se parece a otra.
- Corregido: `makeMarkerImage`, `makeNyIdMarkerImage` y `pattToImage` fallaban en modo instancia de p5.

## Cambios en v0.3

- **Marcadores NyId** (modelos 2 y 3) con el lector portado de NyARToolkit: `addNyIdMarker(id, mm)`,
  `addNyIdMarker(desde, hasta, mm)`, `getNyId`, generador `makeNyIdMarkerImage`, ejemplos 05 y 06.
- `getMarkerVertex2D` devuelve las esquinas desde la superior izquierda del marcador (como NyAR4psg) y
  `pickupMarkerImage` sale derecha con cualquier orientación (en v0.2 dependía de la orientación).
- Pose más estable: si el seguimiento continuo diverge tras un salto brusco, se recalcula desde cero.
- Anchos de marcador con decimales.
- Más nombres de NyAR4psg: `isExistMarker`, `getMatrix`, `getCurrentThreshold`.
- Licencia LGPLv3.

## Cambios en v0.2 (desde el spike v0.1)

- Varios marcadores a la vez, con eventos `found`/`lost`, `lostDelay`, `getExistMarkers`, posición y distancia.
- Conversor imagen → `.patt` integrado (`makePattern`, `addARMarker` con imágenes, captura desde la cámara,
  vista previa, descarga y marcador imprimible).
- Modo espejo para webcam frontal.
- Umbral automático (`otsu`, `adaptive`…), `beginSurface`, `marker2Screen`, `screen2MarkerCoordSystem`.
- Nombres de NyAR4psg donde corresponde (`setARPerspective`, `getLife`, `getLostCount`, `setConfidenceThreshold`,
  `setLostDelay`, `pickupMarkerImage`).

---

## Créditos

- **nyatla (Ryo Iizuka)**: autor de NyARToolkit y de NyARToolkit for Processing (NyAR4psg), cuya API sigue
  esta biblioteca. El lector de NyId de nyar4p5 es un port a JavaScript de su código
  (`NyIdMarkerPickup`, `MarkerPattEncoder`, `NyIdMarkerDataEncoder_RawBit/RawBitId`, `NyIdList`,
  `NyARPerspectiveParamGenerator_O1`), Copyright (C) 2008-2012 Ryo Iizuka, LGPLv3. El ejemplo 06 es un port de
  su sketch `arPlusNyIdMarker`.
  NyARToolkit: <https://github.com/nyatla/NyARToolkit> · NyAR4psg: <https://github.com/nyatla/NyARToolkit-for-Processing>
- **ARToolKit**: creado por Hirokazu Kato en el HIT Lab de la Universidad de Washington, desarrollado después
  por ARToolworks (luego parte de DAQRI), que lo liberó como ARToolKit5 bajo LGPLv3 en 2015; hoy lo continúa
  la comunidad **artoolkitX**.
  <https://github.com/artoolkitx/artoolkit5>
- **artoolkit5-js** (`@ar-js-org/artoolkit5-js`): ARToolKit5 compilado a WebAssembly por la organización
  **AR.js** (a partir de jsartoolkit5). LGPLv3. Se carga aparte desde CDN; nyar4p5 no lo modifica.
  <https://github.com/AR-js-org/artoolkit5-js>
- **Marcadores Hiro y Kanji** y los datos de cámara estándar (incluidos dentro de `nyar4p5.js`): provienen de la
  distribución de ARToolKit. El patrón Kanji
  proviene de los datos de AR.js / jsartoolkit5; `kanji.png` se generó desde el PDF de patrones de ARToolKit5.
- **p5.js**: Processing Foundation y su comunidad. <https://p5js.org>

## Licencia

nyar4p5 se distribuye bajo la **GNU Lesser General Public License v3** (archivo `LICENSE`), la misma de
NyARToolkit y de ARToolKit5, porque incluye código portado de NyARToolkit.

nyar4p5js es un proyecto de EMILIUSVGS / Laboratorio del Futuro.

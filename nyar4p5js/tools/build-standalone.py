#!/usr/bin/env python3
"""Genera versiones de un solo archivo de cada ejemplo en standalone/ (librería y datos embebidos).
Uso: python3 tools/build-standalone.py   (desde la carpeta raíz de nyar4p5)"""
import base64, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
MIME = {'.dat': 'application/octet-stream', '.png': 'image/png', '.patt': 'text/plain', '.hiro': 'text/plain', '.kanji': 'text/plain'}
def data_uri(name):
    p = ROOT / 'data' / name
    mime = MIME.get(p.suffix, 'text/plain')
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"
lib = (ROOT / 'nyar4p5.js').read_text()
out = ROOT / 'standalone'; out.mkdir(exist_ok=True)
for ex in sorted((ROOT / 'examples').iterdir()):
    if not ex.is_dir(): continue
    html = (ex / 'index.html').read_text()
    if '../../nyar4p5.js' not in html:  # p. ej. 00_p5editor, que ya es autocontenido
        continue
    sketch = (ex / 'sketch.js').read_text()
    sketch = re.sub(r"DATA \+ '([^']+)'", lambda m: "'" + data_uri(m.group(1)) + "'", sketch)
    html = html.replace('<script src="../../nyar4p5.js"></script>', '<script>\n' + lib + '\n</script>')
    html = html.replace('<script src="sketch.js"></script>', '<script>\n' + sketch + '\n</script>')
    (out / f'{ex.name}.html').write_text(html)
    print('ok', ex.name)

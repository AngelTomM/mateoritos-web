# Mateoritos Web — Simulación de Trayectorias de Asteroides

Este repositorio contiene una simulación interactiva (p5.js) que ilustra trayectorias orbitales de asteroides y su interacción relativa con la Tierra y la Luna.

Contenido principal

- `index.html` — Página principal / landing (español).
- `simulacion.html` — Página que contiene la simulación embebida.
- `sketch.js` — Sketch p5.js con la simulación 3D (WEBGL). Este archivo es el que carga `simulacion.html`.
- `style.css`, `globals.css` — Estilos del sitio.
- `sketches/` — Carpeta con sketches adicionales (archivados y renombrados).
- `archive/` — Archivos antiguos y copias archivadas. Se eliminó la copia local grande de `p5.js`.

Estado del repositorio

- Branch principal (`main`) contiene la versión actualizada de la simulación y la eliminación de la copia local `archive/p5.js`.
- Trabajo reciente se desarrolló en `chore/organize-files` y luego se mergeó en `main`.

Cómo ejecutar localmente

Requisitos: Python 3 (para el servidor HTTP simple) o cualquier servidor estático.

1. Abre una terminal en la carpeta del proyecto:

```powershell
cd "C:\Users\ulica\OneDrive\Documents\GitHub\mateoritos-web"
```

2. Inicia un servidor estático (ejemplo con Python 3):

```powershell
python -m http.server 8000
```

3. Abre en tu navegador:

http://localhost:8000/index.html

o directamente la simulación en:

http://localhost:8000/simulacion.html

Notas técnicas y consideraciones

- La página `simulacion.html` carga `p5.js` desde CDN (https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.10/p5.min.js). No deben existir copias locales de `p5.js` en el repo que entren en conflicto.
- El sketch principal es `sketch.js` en la raíz; si quieres usar el sketch 3D alternativo, revisa `sketches/sketch-3d.js`.
- El sketch crea elementos DOM (sliders y divs) directamente con p5. Si prefieres que los controles estén dentro del layout HTML (por ejemplo dentro de `.rectangle-2`), considera mover la creación de sliders al propio HTML y enlace via `document.getElementById`.
- Para evitar duplicados de la librería, cualquiera de los archivos HTML debe apuntar únicamente al CDN y no a `archive/p5.js`.

Recomendaciones y próximos pasos

- Limpiar `archive/` si ya no necesitas las copias antiguas; actualmente contiene `index2.html` y `sketch3.js` para referencia.
- Reemplazar el polling de `window.currentSlide` por un evento personalizado para un mejor rendimiento y diseño más claro.
- Agregar tests u opciones de build si el proyecto crece (por ejemplo empaquetar con una pequeña task en npm si se añaden dependencias).

Contacto

Si quieres que haga merges, releases o ajustes adicionales (ej. eventos en lugar de polling, eliminar archivos de `archive/`, o añadir badge/metadata), dime y lo hago.
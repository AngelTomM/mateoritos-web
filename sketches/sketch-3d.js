let aSlider, eSlider, iSlider;
let a, e, i;
let moonDistanceAU = 0.00257;
let moonScaleFactor = 10000;
let systemScaleFactor;
let AU_IN_KM = 149597870.7;

let infoDiv, peligroDiv;

function setup() {
  angleMode(RADIANS);

  // canvas will go into the right card; controls into the left card
  const simContainer = document.getElementById('simulacion-container') || document.body;
  const leftContainer = document.querySelector('.ventana .div') || document.body;

  // create a WEBGL canvas sized to the right container
  const rect = simContainer.getBoundingClientRect();
  const cw = Math.max(200, Math.floor(rect.width));
  const ch = Math.max(200, Math.floor(rect.height));
  const cnv = createCanvas(cw, ch, WEBGL);
  cnv.parent(simContainer);
  // ensure the canvas is actually mounted and resized even if the container
  // hasn't been laid out yet (some browsers/layouts report 0x0 initially)
  ensureCanvasMounted(cnv, simContainer);

  // Sliders (placed inside left card)
  aSlider = createSlider(0.00001, 0.02, 0.002, 0.000001);
  aSlider.parent(leftContainer);
  aSlider.style('width', '200px');
  eSlider = createSlider(0.0, 0.99, 0.8611, 0.001);
  eSlider.parent(leftContainer);
  eSlider.style('width', '200px');
  iSlider = createSlider(0, 45, 4.10, 0.01);
  iSlider.parent(leftContainer);
  iSlider.style('width', '200px');

  // position sliders relative to the left card
  aSlider.elt.style.position = 'absolute';
  aSlider.elt.style.left = '20px';
  aSlider.elt.style.top = '20px';
  eSlider.elt.style.position = 'absolute';
  eSlider.elt.style.left = '20px';
  eSlider.elt.style.top = '60px';
  iSlider.elt.style.position = 'absolute';
  iSlider.elt.style.left = '20px';
  iSlider.elt.style.top = '100px';

  // Divs para mostrar información (also in left card)
  infoDiv = createDiv('');
  infoDiv.parent(leftContainer);
  infoDiv.style('color', 'white');
  infoDiv.style('font-family', 'Arial');
  infoDiv.style('font-size', '14px');
  infoDiv.elt.style.position = 'absolute';
  infoDiv.elt.style.left = '20px';
  infoDiv.elt.style.top = '140px';

  peligroDiv = createDiv('');
  peligroDiv.parent(leftContainer);
  peligroDiv.style('color', 'yellow');
  peligroDiv.style('font-family', 'Arial');
  peligroDiv.style('font-size', '18px');
  peligroDiv.style('font-weight', 'bold');
  peligroDiv.elt.style.position = 'absolute';
  peligroDiv.elt.style.left = '20px';
  peligroDiv.elt.style.top = '220px';

  // Handle right container resize (resize canvas)
  const resizeObserver = new ResizeObserver(() => {
    const r = simContainer.getBoundingClientRect();
    const w = Math.max(200, Math.floor(r.width));
    const h = Math.max(200, Math.floor(r.height));
    resizeCanvas(w, h);
  });
  try { resizeObserver.observe(simContainer); } catch (e) { /* ignore if not supported */ }

  // Apply initial presets based on window.currentSlide if present
  if (typeof window !== 'undefined') {
    // ensure there's a default
    if (typeof window.currentSlide === 'undefined') window.currentSlide = 1;
    applySlidePreset(window.currentSlide);

    // listen for future changes (some pages update window.currentSlide manually)
    // Use a simple polling fallback if no event is emitted
    let lastSlide = window.currentSlide;
    setInterval(() => {
      if (window.currentSlide !== lastSlide) {
        lastSlide = window.currentSlide;
        applySlidePreset(lastSlide);
      }
    }, 200);
  }
}

function draw() {
  a = aSlider.value();
  e = eSlider.value();
  i = iSlider.value();

  systemScaleFactor = 300 / (a * (1 + e));
  let perigeoAU = a * (1 - e);

  // Calcular MOID
  let moid = Infinity;
  for (let t = 0; t < TWO_PI; t += 0.001) {
    let r_a = (a * (1 - e * e)) / (1 + e * cos(t));
    let x_a = r_a * cos(t);
    let y_a = r_a * sin(t) * cos(radians(i));
    let dist = sqrt(x_a * x_a + y_a * y_a);
    if (dist < moid) {
      moid = dist;
    }
  }

  // Criterio corregido: MOID < 0.002569
  let peligro = moid < 0.002569;

  // Actualizar texto en los divs
  infoDiv.html(`
    <b>Valores actuales:</b><br>
    a (semieje mayor): ${a.toFixed(6)} UA<br>
    e (excentricidad): ${e.toFixed(3)}<br>
    i (inclinación): ${i.toFixed(2)}°<br>
    Perigeo: ${perigeoAU.toFixed(6)} UA / ${(perigeoAU * AU_IN_KM).toLocaleString(undefined, {maximumFractionDigits:0})} km<br>
    MOID: ${moid.toFixed(6)} UA / ${(moid * AU_IN_KM).toLocaleString(undefined, {maximumFractionDigits:0})} km
  `);

  peligroDiv.html(peligro ? "⚠️ ¡PELIGRO! El asteroide podría interferir con la Luna o la Tierra" : "");

  // Escena 3D
  background(0);
  orbitControl();

  // Tierra
  push();
  fill(0, 100, 255);
  noStroke();
  sphere(10);
  pop();

  // Órbita de la Luna
  push();
  noFill();
  stroke(150);
  strokeWeight(1);
  rotateX(HALF_PI);
  ellipse(0, 0, moonDistanceAU * moonScaleFactor * 2, moonDistanceAU * moonScaleFactor * 2);
  pop();

  // Luna
  let moonAngle = frameCount * 0.05;
  let moonX = moonDistanceAU * moonScaleFactor * cos(moonAngle);
  let moonY = moonDistanceAU * moonScaleFactor * sin(moonAngle);
  push();
  translate(moonX, 0, moonY);
  fill(200);
  noStroke();
  sphere(5);
  pop();

  // Órbita del asteroide
  push();
  stroke(255, 0, 0);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let t = 0; t < TWO_PI; t += 0.01) {
    let r = (a * (1 - e * e)) / (1 + e * cos(t));
    let x = r * systemScaleFactor * cos(t);
    let y = r * systemScaleFactor * sin(t);
    let z = y * sin(radians(i));
    vertex(x, z, y * cos(radians(i)));
  }
  endShape();
  pop();

  // Asteroide
  let theta = frameCount * 0.002;
  let r = (a * (1 - e * e)) / (1 + e * cos(theta));
  let x = r * systemScaleFactor * cos(theta);
  let y = r * systemScaleFactor * sin(theta);
  let z = y * sin(radians(i));
  push();
  translate(x, z, y * cos(radians(i)));
  fill(255, 0, 0);
  noStroke();
  sphere(6);
  pop();
}

// Preset mapping for slides — adjust these values to taste
function applySlidePreset(slideNumber) {
  if (!aSlider || !eSlider || !iSlider) return;
  const presets = {
    1: { a: 0.002, e: 0.1, i: 2.0 },
    2: { a: 0.0015, e: 0.5, i: 10.0 },
    3: { a: 0.005, e: 0.85, i: 20.0 }
  };

  const p = presets[slideNumber] || presets[1];
  // set values smoothly by directly setting slider value
  aSlider.value(p.a);
  eSlider.value(p.e);
  iSlider.value(p.i);
}

// expose for manual use
window.applySlidePreset = applySlidePreset;

// Helper: retry parenting + resize until container has a non-zero size (defensive)
function ensureCanvasMounted(cnv, container) {
  let tries = 0;
  const maxTries = 20;
  const id = setInterval(() => {
    tries++;
    const rect = container.getBoundingClientRect();
    if (rect.width > 10 && rect.height > 10) {
      try {
        cnv.parent(container);
        resizeCanvas(Math.max(200, Math.floor(rect.width)), Math.max(200, Math.floor(rect.height)));
      } catch (e) {
        // ignore
      }
      clearInterval(id);
    } else if (tries >= maxTries) {
      clearInterval(id);
    }
  }, 150);
}

let aSlider, eSlider, iSlider;
let a, e, i;
let moonDistanceAU = 0.003569; // distancia más precisa en AU
let moonScaleFactor = 8000;    // ajustado para mantener proporción visual
let systemScaleFactor;
let AU_IN_KM = 149597870.7;

let infoDiv, peligroDiv;
let earthTexture, moonTexture;
let stars = [];

async function setup() {
  // create a temporary canvas; we'll parent and resize it to the container after DOM is ready
  const cnv = createCanvas(800, 800, WEBGL);
  angleMode(RADIANS);

  earthTexture = await loadImage('https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg');
  moonTexture = await loadImage('https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg');

  aSlider = createSlider(0.00001, 1.6, 1.6, 0.000001);
  eSlider = createSlider(0.0, 0.99, 0.8611, 0.001);
  iSlider = createSlider(0, 45, 4.10, 0.01);
  // move sliders into left panel so they appear inside the card
  const leftPanel = document.getElementById('left-panel');
  if (leftPanel) {
    aSlider.parent(leftPanel);
    eSlider.parent(leftPanel);
    iSlider.parent(leftPanel);
    // basic inline styles for layout inside the left panel
    aSlider.elt.style.display = 'block';
    aSlider.elt.style.margin = '8px 0';
    eSlider.elt.style.display = 'block';
    eSlider.elt.style.margin = '8px 0';
    iSlider.elt.style.display = 'block';
    iSlider.elt.style.margin = '8px 0';
    aSlider.style('width', '200px');
    eSlider.style('width', '200px');
    iSlider.style('width', '200px');
  } else {
    // fallback to absolute positioning
    aSlider.position(10, 10);
    aSlider.style('width', '200px');
    eSlider.position(10, 40);
    eSlider.style('width', '200px');
    iSlider.position(10, 70);
    iSlider.style('width', '200px');
  }

  // Create info divs but parent them to left-panel containers so they appear inside the card
  infoDiv = createDiv('');
  peligroDiv = createDiv('');
  // Attach to existing left-panel placeholders if present
  const infoContainer = document.getElementById('info-values');
  const peligroContainer = document.getElementById('peligro-div');
  if (infoContainer) infoDiv.parent(infoContainer);
  if (peligroContainer) peligroDiv.parent(peligroContainer);
  // style them to match previous appearance
  infoDiv.style('color', 'white');
  infoDiv.style('font-family', 'Arial');
  infoDiv.style('font-size', '14px');
  peligroDiv.style('color', 'yellow');
  peligroDiv.style('font-family', 'Arial');
  peligroDiv.style('font-size', '18px');
  peligroDiv.style('font-weight', 'bold');

  for (let i = 0; i < 300; i++) {
    stars.push({
      x: random(-2000, 2000),
      y: random(-2000, 2000),
      z: random(-2000, 2000)
    });
  }

  // Parent canvas to the simulacion container and resize to fit
  const container = document.getElementById('simulacion-container');
  if (container && cnv) {
    cnv.parent(container);
    function fitCanvas() {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      resizeCanvas(w, h);
    }
    fitCanvas();
    // Resize on window resize
    window.addEventListener('resize', fitCanvas);
    // Also use a ResizeObserver for the container to react to layout changes
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => fitCanvas());
      ro.observe(container);
    }
  }
}

function draw() {
  if (!earthTexture || !moonTexture) return;

  a = aSlider.value();
  e = eSlider.value();
  i = iSlider.value();

  systemScaleFactor = 300 / (a * (1 + e));
  let perigeoAU = a * (1 - e);

  let moid = Infinity;
  for (let t = 0; t < TWO_PI; t += 0.001) {
    let r_a = (a * (1 - e * e)) / (1 + e * cos(t));
    let x_a = r_a * cos(t);
    let y_a = r_a * sin(t) * cos(radians(i));
    let d = sqrt(x_a * x_a + y_a * y_a);
    if (d < moid) {
      moid = d;
    }
  }

  let peligro = moid < 0.05 || e > 0.83;

  infoDiv.html(`
    <b>Valores actuales:</b><br>
    a (semieje mayor): ${a.toFixed(6)} UA<br>
    e (excentricidad): ${e.toFixed(3)}<br>
    i (inclinación): ${i.toFixed(2)}°<br>
    Perigeo: ${perigeoAU.toFixed(6)} UA / ${(perigeoAU * AU_IN_KM).toLocaleString(undefined, {maximumFractionDigits:0})} km<br>
    MOID: ${moid.toFixed(6)} UA / ${(moid * AU_IN_KM).toLocaleString(undefined, {maximumFractionDigits:0})} km
  `);

  peligroDiv.html(peligro ? "⚠️ ¡PELIGRO! amenaza de asteroide ⚠️" : "");

  background(0);
  orbitControl();

  // Estrellas
  push();
  for (let s of stars) {
    push();
    translate(s.x, s.y, s.z);
    stroke(255);
    strokeWeight(2);
    point(0, 0, 0);
    pop();
  }
  pop();

  // Tierra con textura sin sombreado
  push();
  noStroke();
  texture(earthTexture);
  sphere(12);
  pop();

  // Órbita de la Luna
  push();
  noFill();
  stroke(150);
  strokeWeight(1);
  rotateX(HALF_PI);
  ellipse(0, 0, moonDistanceAU * moonScaleFactor * 2, moonDistanceAU * moonScaleFactor * 2);
  pop();

  // Luna con textura y tamaño proporcional sin sombreado
  let moonAngle = frameCount * 0.05;
  let moonX = moonDistanceAU * moonScaleFactor * cos(moonAngle);
  let moonY = moonDistanceAU * moonScaleFactor * sin(moonAngle);
  push();
  translate(moonX, 0, moonY);
  noStroke();
  texture(moonTexture);
  sphere(3.26);
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

  // Asteroide más chico y titilando más rápido si hay peligro
  let orbitalPeriod = pow(a, 1.5);
  let angularSpeed = TWO_PI / (orbitalPeriod * 100);
  let theta = frameCount * angularSpeed;

  let r = (a * (1 - e * e)) / (1 + e * cos(theta));
  let x = r * systemScaleFactor * cos(theta);
  let y = r * systemScaleFactor * sin(theta);
  let z = y * sin(radians(i));

  push();
  translate(x, z, y * cos(radians(i)));

  if (peligro) {
    if (frameCount % 4 < 2) {
      fill(255, 0, 0); // rojo visible
    } else {
      noFill(); // invisible
    }
  } else {
    fill(255, 0, 0); // rojo constante
  }

  noStroke();
  sphere(3); // Asteroide más chico
  pop();
}
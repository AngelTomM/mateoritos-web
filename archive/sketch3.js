let aSlider, eSlider, iSlider;
let a, e, i;
let moonDistanceAU = 0.00257;
let moonScaleFactor = 10000;
let systemScaleFactor;
let AU_IN_KM = 149597870.7;

let infoDiv, peligroDiv;
let earthTexture, moonTexture;
let stars = [];

async function setup() {
  createCanvas(800, 800, WEBGL);
  angleMode(RADIANS);

  // Cargar imágenes con await (p5.js 2.0)
  earthTexture = await loadImage('https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/618x618/1F30D.png'); // Tierra
  moonTexture = await loadImage('https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/618x618/1F311.png'); // Luna

  // Sliders
  aSlider = createSlider(0.00001, 0.02, 0.002, 0.000001);
  aSlider.position(10, 10);
  aSlider.style('width', '200px');
  eSlider = createSlider(0.0, 0.99, 0.8611, 0.001);
  eSlider.position(10, 40);
  eSlider.style('width', '200px');
  iSlider = createSlider(0, 45, 4.10, 0.01);
  iSlider.position(10, 70);
  iSlider.style('width', '200px');

  // Divs para mostrar información
  infoDiv = createDiv('');
  infoDiv.position(220, 10);
  infoDiv.style('color', 'white');
  infoDiv.style('font-family', 'Arial');
  infoDiv.style('font-size', '14px');

  peligroDiv = createDiv('');
  peligroDiv.position(220, 160);
  peligroDiv.style('color', 'yellow');
  peligroDiv.style('font-family', 'Arial');
  peligroDiv.style('font-size', '18px');
  peligroDiv.style('font-weight', 'bold');

  // Generar estrellas
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: random(-2000, 2000),
      y: random(-2000, 2000),
      z: random(-2000, 2000)
    });
  }
}

function draw() {
  if (!earthTexture || !moonTexture) return;

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
    let d = sqrt(x_a * x_a + y_a * y_a);
    if (d < moid) {
      moid = d;
    }
  }

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

  // Estrellas de fondo
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

  // Tierra con textura
  push();
  noStroke();
  texture(earthTexture);
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

  // Luna con textura
  let moonAngle = frameCount * 0.05;
  let moonX = moonDistanceAU * moonScaleFactor * cos(moonAngle);
  let moonY = moonDistanceAU * moonScaleFactor * sin(moonAngle);
  push();
  translate(moonX, 0, moonY);
  noStroke();
  texture(moonTexture);
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


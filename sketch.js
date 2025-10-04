let a = 2.237;   // semieje mayor del asteroide en UA
let e = 0.8611;  // excentricidad del asteroide
let i = 4.10;    // inclinación en grados
let moonDistanceAU = 0.00257; // distancia Tierra-Luna en UA
let moonScaleFactor = 10000;  // escala especial para la Luna
let systemScaleFactor;
let moidThreshold = 0.002569; // umbral de peligro en UA

function setup() {
  // Detectar en qué página estamos y elegir el contenedor correcto
  let containerId = document.getElementById('simulacion-solo-container') ? 'simulacion-solo-container' : 'simulacion-container';
  let canvas = createCanvas(900, 900);
  canvas.parent(containerId);
  angleMode(RADIANS);
  systemScaleFactor = 350 / (a * (1 + e)); // escala para que todo entre en el canvas
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  // Tierra en el centro
  fill(0, 100, 255);
  noStroke();
  ellipse(0, 0, 20, 20);

  // Órbita de la Luna (ampliada para que se vea)
  noFill();
  stroke(150);
  strokeWeight(1);
  ellipse(0, 0, moonDistanceAU * moonScaleFactor * 2, moonDistanceAU * moonScaleFactor * 2);

  // Luna orbitando la Tierra
  let moonAngle = frameCount * 0.05;
  let moonX = moonDistanceAU * moonScaleFactor * cos(moonAngle);
  let moonY = moonDistanceAU * moonScaleFactor * sin(moonAngle);
  fill(200);
  noStroke();
  ellipse(moonX, moonY, 8, 8);

  // Órbita del asteroide (elíptica con inclinación)
  stroke(255, 0, 0);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let t = 0; t < TWO_PI; t += 0.01) {
    let r = (a * (1 - e * e)) / (1 + e * cos(t));
    let x = r * systemScaleFactor * cos(t);
    let y = r * systemScaleFactor * sin(t);
    // aplicar inclinación como rotación del plano orbital
    let xi = x;
    let yi = y * cos(radians(i));
    vertex(xi, yi);
  }
  endShape();

  // Asteroide moviéndose en su órbita
  let theta = frameCount * 0.002; // velocidad ajustada al periodo
  let r = (a * (1 - e * e)) / (1 + e * cos(theta));
  let x = r * systemScaleFactor * cos(theta);
  let y = r * systemScaleFactor * sin(theta);
  let xi = x;
  let yi = y * cos(radians(i));
  fill(255, 0, 0);
  noStroke();
  ellipse(xi, yi, 10, 10);

  // Calcular MOID (mínima distancia entre la órbita del asteroide y la Tierra en AU)
  let moid = Infinity;
  for (let t = 0; t < TWO_PI; t += 0.001) {
    let r_a = (a * (1 - e * e)) / (1 + e * cos(t));
    let x_a = r_a * cos(t);
    let y_a = r_a * sin(t) * cos(radians(i));
    let dist = sqrt(x_a * x_a + y_a * y_a); // distancia desde la Tierra (0,0)
    if (dist < moid) {
      moid = dist;
    }
  }

  // Mostrar alerta si MOID < moidThreshold
  resetMatrix();
  fill(255);
  textAlign(CENTER);
  textSize(18);
  text(`MOID asteroide-Tierra: ${moid.toFixed(6)} AU`, width / 2, 40);

  if (moid < moidThreshold) {
    fill(255, 255, 0);
    textSize(22);
    text("¡PELIGRO! MOID menor que la distancia Tierra-Luna", width / 2, 70);
  }
}
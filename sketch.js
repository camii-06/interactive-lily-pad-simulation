/*
* -------- PART 1: Voronoi water -----------
*
* This is a randomized water surface animation using Voronoi-style rendering. Optimized for Chromium-based environments.
* ---> small note: many operations were simplified and optimized during iterative development
* ---> about the res variable: must be a divisor of the canvas size (720) to avoid additional coordinate calculations during rendering
* ---> Voronoi water inspired by Kazuki Umeda's work, whose GitHub is linked in README.md :) 
* 
* ----------- PART 2: Drag-and-drop lily pad ------------
*
* Interactive lily pad controlled through webcam-based hand tracking.
* Pinch the lily pad virtually with your index and thumb pinched in the air to pick it up and drag it, and open your hand to let it go.
* There are dots to help guide you to see the rest of your hand. 
*     Teal = general finger guide points 
*     White = midpoint between index and thumb 
*     Red = midpoint <= 40 pixels from thumb tip and index tip
*/

/**
* fields 
*/
// part 1 vars
let points = []; // Voronoi seed points
let t = 0; // animation time parameter
let res = 12; // downscales rendering. higher = less total pixels, lower = more total pixels 
let lowRes; // low-resolution render buffer

// part 2 vars 
let handPose; 
let video; // handles video input
let hands = []; // handles hands that can be detected
let lilyPads = []; // handles lily pads 

let flowerLayer; // different layer for flower rendering
/**
* preload hand poses
*/
function preload() {
  handPose = ml5.handPose(); 
}

/** 
* initialization
*/
function setup() {
  createCanvas(720, 720);
  
  // downscales rendering
  lowRes = createGraphics(width / res, height / res);
  lowRes.pixelDensity(1); 

  
  // initialize Voronoi seed points 
  for (let i = 0; i < 20; i++) {
    points.push({
      x: random(lowRes.width),
      y: random(lowRes.height),
      originX: 0, originY: 0,
      offset: random(100)
    });
    points[i].originX = points[i].x;
    points[i].originY = points[i].y;
  }
  
  // --------- part 2 setup -------------
  
  // make a new layer for the flower 
  flowerLayer = createGraphics(720, 720); 
  flowerLayer.pixelDensity(1);
  // make it transparent
  flowerLayer.clear();
  
  // make a new lilypad in the stack on the new layer
  lilyPads.push(new LilyPad(width / 2, height / 2));
  
  
  // begin capturing video 
  video = createCapture(VIDEO);
  video.size(width, height);
  
  // start hand tracking and stream detections to gotHands() 
  handPose.detectStart(video, gotHands);

  video.hide(); // hide video capture for efficiency 
    print("video load successful"); // feedback to user 
}


/**
* makes the animated water 
*/
function draw() {
  // time increment to animate. lower = slower; higher = faster
  t += 0.003; 

  lowRes.loadPixels(); // pixel array access

  // traverse render buffer and compute Voronoi shading for each pixel (O(width * height * points))
  for (let y = 0; y < lowRes.height; y++) {
    for (let x = 0; x < lowRes.width; x++) {
      
      // Perlin noise motion handling 
      let n1 = noise(x * 0.05, y * 0.05, t * 0.5) * 15;
      let nx = x + n1;
      let ny = y + n1;

      // tracks distances to the two nearest Voronoi seed points
      let d1 = 1000;
      let d2 = 1000;

      // loop through all of the points for animation
      for (let p of points) {
        // sin and cos waves make movement more organic
        let px = p.originX + sin(t + p.offset) * 15;
        let py = p.originY + cos(t + p.offset) * 15;
        let dx = nx - px;
        let dy = ny - py;
        let d = dx * dx + dy * dy; 

        // use distance between points to build the structure
        if (d < d1) {
          d2 = d1;
          d1 = d;
        } else if (d < d2) {
          d2 = d;
        }
      }

      // turn the difference into a shading of the color
      // big difference = far away from any other point = darker
      // small difference = close to other points = lighter
      // taking sqrt outside of the loop for efficiency's sake
      let difference = sqrt(d2) - sqrt(d1);
      
      // this map handles the shading directly
      let b = map(difference, 0, 10, 255, 50, true);

      // colors the pixels
      let i = (x + y * lowRes.width) * 4; // this 4 must be a 4, otherwise coloring will not work as intended
      lowRes.pixels[i]     = b * 0.2; 
      lowRes.pixels[i + 1] = b + 13; 
      lowRes.pixels[i + 2] = b;     
      lowRes.pixels[i + 3] = 240; // smoothness of the color transition between colors of pixels, can be lower or higher, cannot be 0
    }
  }
  
  // keeps updating pixels
  lowRes.updatePixels();

  // if enabled the water will be in a more pixelated style
  // noSmooth(); 
  
  // creates the image
  image(lowRes, 0, 0, width, height);

  // FPS display in the corner. Up to 60FPS in optimization testing in Chromium-based environments.
  fill(255);
  text("FPS: " + floor(frameRate()), 10, 10);
  
  
  // ---------- part 2 drawing ---------
  
  // access keypoints array from the ml5.js library to make the pinching function with the finger tip and thumb tip
  if (hands.length > 0) {
    let hand = hands[0];
    let thumb = hand.keypoints[4];
    let index = hand.keypoints[8];
    
    let thumbX = width - thumb.x; 
    let thumbY = thumb.y;
    
    let indexX = width - index.x; 
    let indexY = index.y;

    // midpoint between these keypoints for defining if user is pinching 
    let midX = (thumbX + indexX) / 2; 
    let midY = (thumbY + indexY) / 2;
    
    // detect pinch, at most 40 px between pointer and thumb to pinch
    let pinchDist = dist(thumbX, thumbY, indexX, indexY);
    let isPinching = pinchDist <= 40;

    // visual feedback for user when pinching
    fill(isPinching ? '#FF0000' : '#FFFFFF');
    circle(midX, midY, 10);

    // update lilypad location if user is pinching
    for (let pad of lilyPads) {
      pad.update(midX, midY, isPinching);
    }
  }
  
  // always display lily pad
  for (let pad of lilyPads) {
    pad.display(); 
  }

  // visualizes all points in keypoints array 
  if (hands && hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      for (let j = 0; j < hand.keypoints.length; j++) {
        let keypoint = hand.keypoints[j];
        fill(0, 300, 255); // teal to match water
        noStroke();
        circle(width-keypoint.x, keypoint.y, 10);
      }
    }
  }  

}

// hand tracking model 
function modelReady() {
  console.log("Model ready");
}

// store detected hands from ml5.js in hands array
function gotHands(results){
  hands = results;
}

// lily pad object 
class LilyPad {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.size = 200;
    this.dragging = false;
    this.theta = 0;
    // n and d define petal configuration
    this.n = 6; 
    this.d = 1;
    this.rmax = 70;
    this.points = [];
  }

  display() {
    // draws lily pad 
    fill('#289650');
    noStroke();
    arc(this.pos.x, this.pos.y, this.size, this.size, 0.5, TWO_PI - 0.5);
    
    if (this.points.length === 0) {
    // math for a flower shape 
    let limit = TWO_PI * this.d; 
    for (let t = 0; t < limit; t += 0.05) {
      let r = this.rmax * cos((this.n / this.d) * t);
      let x = r * cos(t);
      let y = r * sin(t);
      this.points.push(createVector(x, y));
    }
  }

  // flower
  push();
  translate(this.pos.x, this.pos.y);
  fill('#FFABAB');
  stroke('#FF748C');
  strokeWeight(1);
  
  // flower shape handling
  beginShape();
  for (let p of this.points) {
    vertex(p.x, p.y);
  }

  // close flower shape
  endShape(CLOSE);
  pop();
    
   // safeguard limiting unintended point growth
    if (this.points.length > 500) this.points.shift();
  }

  // attachment to hand
  update(handX, handY, isPinching) {
    let d = dist(this.pos.x, this.pos.y, handX, handY);

    if (isPinching && (d < this.size / 2 || this.dragging)) {
      this.dragging = true;
      this.pos.x = handX;
      this.pos.y = handY;
    } else {
      this.dragging = false;
    }
  }
}

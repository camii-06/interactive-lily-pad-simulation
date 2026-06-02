/*
* -------- PART 1 -----------
*
* This is a randomized water surface animation using Voronoi-style rendering. 
* ---> small note: many operartions were simplified and optimized during iterative updates to the program
*
* ---> small note on res variable: breaks if not a divisor of 720 cus i didnt want to calculate floor for each pixel cus that makes the program even heavier to run. should work fine for any divisor of 720
* 
* ---> inspired by Kazuki Umeda :) 
* 
* ----------- PART 2 ------------
*
* ---->>> HII!! This is a program to drag and drop a lily pad!! it takes input from the camera and theres a whole lot it calculates once again that i read the p5js library of ml5 for. 
*
* ----> it is a pinch and drag input! pinch the lily pad virtually with your index and thumb pinched in the air to pick it up and drag it, and open your hand to let it go.
*
* ----> there are dots to help guide you to see the rest of your hand. teal = general finger guide points -- White = midpoint between index and thumb -- red = midpoint =<40 pixels in distance
*
*/

/**
* fields 
*/
let points = []; // handles movement
let t = 0; // handles animating
let res = 12; // had to downscale otherwise too beefy for computer rendering. higher = less total pixels, lower = more total pixels 
let lowRes; // handles lots of math for movement

// part 2 vars 
let handPose; 
let video; // handles video input
let hands = []; // handles hands that can be detected
let lilyPads = []; // handles lily pads 

let flowerLayer; // different layer for flower because otherwise... the flower just...wont...draw? it was very weird to debug idk.

/**
* preloading hand posees
*/
function preload() {
  handPose = ml5.handPose(); 
}

/** 
* initialization
*/
function setup() {
  createCanvas(720, 720);
  
  // makes a smaller version to make the whole thing not die trying to render
  lowRes = createGraphics(width / res, height / res);
  lowRes.pixelDensity(1); // basically "each pixel is one pixel"

  
  // makes the points move with each other
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
  
  
  // handle video stuff
  video = createCapture(VIDEO);
  video.size(width, height);
  
  // from library, look at gothands function below (also from library). basically handles hand movement stuff
  handPose.detectStart(video, gotHands);

  video.hide(); // here for efficeincy because otherwise your computer will try handling both the video AND the water AND the movement and thats !! no bueno !!
    print("video load successful"); // feedback to user
}


/**
* makes the animated water 
*/
function draw() {
  // time increment to animate. lower = slower; higher = faster
  t += 0.003; 

  lowRes.loadPixels(); // pixel array access

  // rowcol traversal to make pixels be colored correctly in movement (I dont like the O(x * y * points) time efficiency but there isnt a way to optimize it that i can think of other than making less points which is nuh uh)
  for (let y = 0; y < lowRes.height; y++) {
    for (let x = 0; x < lowRes.width; x++) {
      
      // motion handling (funky, had to google some                  references for this)
      let n1 = noise(x * 0.05, y * 0.05, t * 0.5) * 15;
      let nx = x + n1;
      let ny = y + n1;

      // distance handling, same as above
      // 2 closest points 
      // also for setup of the points
      let d1 = 1000;
      let d2 = 1000;

      // loop through all of the points 
      // why? 
      // *animation :D*
      for (let p of points) {
        // for each point movement and distances changing
        // sin and cos make it more glooby
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
      // taking sqrt outsise of the loop for efficiency's sake
      let difference = sqrt(d2) - sqrt(d1);
      
      // this map handles the coloring directly, for shading stuff on the pixels. yay for maps, they made this a lot easier than what i was trying to do before
      let b = map(difference, 0, 10, 255, 50, true);

      // actual coloring time !!!! figured out most numbers by just messing with it and seeing what i liked best tbh lol you can change most of these and its chill
      let i = (x + y * lowRes.width) * 4; // if this 4 isnt a 4 it does not work as intended 
      lowRes.pixels[i]     = b * 0.2; 
      lowRes.pixels[i + 1] = b + 13; 
      lowRes.pixels[i + 2] = b;     
      lowRes.pixels[i + 3] = 240; // smoothness of the color transition between colors of pixels gets affected, can be lower or higher, cannot be 0
    }
  }
  
  // keeps animation going updating pixels
  lowRes.updatePixels();

  // if you disable this its less pixelated but i like the look of the pixels as a personal preference 
  // ---- disabled in part 2 for aesthetics ----
  // noSmooth(); 
  
  // create the image :D
  image(lowRes, 0, 0, width, height);

  // FPS display in the corner for funsies, should be between 59 and 60 smooth cus of optimization!
  fill(255);
  text("FPS: " + floor(frameRate()), 10, 10);
  
  
  // ---------- part 2 drawing ---------
  
  // access the points array to make the pinching function taking into account the pointer finger and thumb
  if (hands.length > 0) {
    let hand = hands[0];
    let thumb = hand.keypoints[4];
    let index = hand.keypoints[8];
    
    let thumbX = width - thumb.x; 
    let thumbY = thumb.y;
    
    let indexX = width - index.x; 
    let indexY = index.y;

    // midpoint between these for defining if grabbing 
    let midX = (thumbX + indexX) / 2; 
    let midY = (thumbY + indexY) / 2;
    
    // detect pinch, at most 40 px between pointer and thumb to pinch
    let pinchDist = dist(thumbX, thumbY, indexX, indexY);
    let isPinching = pinchDist < 40;

    // visual feedback for grabber (debugging thing i nabbed from the ml5.js library when i was having issues)
    fill(isPinching ? '#FF0000' : '#FFFFFF');
    circle(midX, midY, 10);

    // update lilypad if is pinching
    for (let pad of lilyPads) {
      pad.update(midX, midY, isPinching);
    }
  }
  
  // always display lily pad
  for (let pad of lilyPads) {
    pad.display(); 
  }

  
  
  
  // FROM THE LIBRARY FOR DEBUGGING SEEING THE POINTS
  
  if (hands && hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      for (let j = 0; j < hand.keypoints.length; j++) {
        let keypoint = hand.keypoints[j];
        fill(0, 300, 255);
        noStroke();
        circle(width-keypoint.x, keypoint.y, 10);
      }
    }
  }
  
  
  
  

}


// stuff for hand tracking from ml5 library
function modelReady() {
  console.log("Model ready");
}

// same as above
function gotHands(results){
  hands = results;
}



// LILY PAD OBJECT

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
    // lily pad drawing
    
    // lily pad itself
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
    
  endShape(CLOSE);
  pop();
    
   // limit points so it doesn't get too laggy over time
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

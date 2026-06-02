# Interactive Lily Pad Simulation

A Voronoi-based water animation featuring an interactive lily pad that can be grabbed and moved using camera-based hand tracking with ml5.js and rendered in p5.js.

## System Overview

This project explores interactive and generative environments combining:
- Voronoi-based distance field simulation for dynamic water rendering
- Perlin noise-based temporal distortion
- Real-time hand tracking using ml5.js library
- Gesture-based interaction with pinch detection using webcam input

## Features

- Animated Voronoi-style water surface 
- Hand-tracking input through webcam
- Grab-and-drag lily pad interaction
- Lightweight browser-based experience
- Up to 60FPS in Chromium-based environments

## Controls

- **Pinch thumb and index finger** - grab lily pad
- **Move hand while pinched** - drag lily pad
- **Release pinch** - drop lily pad

## How it works

### Water animation: 
  - A Voronoi-style distance field is generated using moving seed points
  - Perlin noise is applied to distort the field over time, creating organic motion
  - Pixel colors are calculated from the distance between neighboring points, producing dynamic shading
### Camera input and interaction
  - A webcam-based hand tracking model (ml5.js) detects finger positions using 21 keypoints
  - The distance between the thumb tip and index finger tip is found
  - When the distance falls below a threshold (40 pixels), the pinch drag-and-drop functionality activates, allowing the lily pad to be moved

## Tech Stack

- **p5.js** - rendering and simulation
- **ml5.js** - hand pose detection
- **JavaScript** - interaction logic

## Challenges and Constraints 

- Real-time pixel-level Voronoi computation required significant optimization due to high computational cost
- Maintaining stable frame rates required reducing simulation resolution and optimizing pixel operations
- Integrating ml5.js HandPose tracking introduced additional latency and required careful tuning for stable pinch detection
- The system was optimized specifically for Chromium-based browsers to ensure consistent real-time performance

## Status 

Completed.

## Inspiration

This project was developed while studying Voronoi-based rendering techniques commonly used in creative coding. 

Technical and conceptual inspiration was drawn from the work of 

- Creativeguru97 (Kazuki Umeda): https://github.com/Creativeguru97
- Akanksha Vyas and Portia Morrell: https://p5js.org/tutorials/speak-with-your-hands/
- Daniel Shiffman (The Coding Train): https://github.com/shiffman (https://github.com/CodingTrain)

The final implementation, structure, and interaction system were built independently.

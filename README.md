# Interactive Lily Pad Simulation

A Voronoi-based water animation featuring an interactive lily pad that can be grabbed and moved using camera-based hand tracking with ml5.js and rendered in p5.js.

## Overview

This project explores interactive and generative environments using p5.js and ml5.js. Interaction is based on real-time hand tracking through a webcam, allowing the user to manipulate a floating lily pad within the simulation. 

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

## Difficulties encountered

- Performance varies depending on device and browser; optimized for modern Chromium-based environments
- Calculations had to be simplified or modified to prevent crashes 

## Status 

Completed.

## Inspiration

This project was developed while studying Voronoi-based rendering techniques commonly used in creative coding. 

Technical and conceptual inspiration was drawn from the work of 

- Creativeguru97 (Kazuki Umeda): https://github.com/Creativeguru97
- Akanksha Vyas and Portia Morrell: https://p5js.org/tutorials/speak-with-your-hands/

The final implementation, structure, and interaction system were built independently.

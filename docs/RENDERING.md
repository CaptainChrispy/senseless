# Rendering *Senseless*

## Overview

This document explains how the game creates a first-person 3D view on a 2D HTML canvas. The technique is called **raycasting**, which was famously used in classic games like Wolfenstein 3D (1992) and early Doom engines.

## The Core Concept: Raycasting

Typically, real 3D rendering requires complex math. Raycasting is a much simpler, 2D-based technique that tricks your brain into seeing 3D:

1. Think of the world as a flat map - like looking at a board game from above
2. You cast invisible rays from where you're standing
3. See how far each ray travels before hitting a wall
4. Draw walls taller or shorter based on that distance

## How It Works: The Rendering Pipeline

The *Senseless* engine draws your view in several layers, like painting on transparent sheets stacked on top of each other:

### 1. Basic Settings

- **Field of View (FOV)**: How wide you can see
- **View Distance**: How far you can see before fog blocks your view
- **Wall Height**: How tall walls appear relative to the screen

### 2. Drawing Layers (Back to Front)

The scene is painted in order:
1. Sky, which fills the top half of the screen
2. Floor, which fills the bottom half
3. Walls, which are drawn from casting rays and drawing vertical strips onto the canvas
4. Doors, which are added on top of walls
5. NPCs, which are added last (so they're in front)

### 3. Casting Rays

For each vertical column of pixels on your screen:

1. **Calculate an angle** - Rays fan out based on your Field of View
   - Center ray points straight ahead
   - Left rays point slightly left
   - Right rays point slightly right

2. **Send out the ray** - See what it hits using a special algorithm

3. **Draw a vertical line** - Draw one thin vertical strip of wall
   - **Closer walls** → taller lines
   - **Farther walls** → shorter lines

If your screen is 800 pixels wide, we cast 800 rays (one per column) to build the complete render.

**Here's how the code does it:**

```javascript
// One ray per pixel column
const rayCount = this.width;

for (let x = 0; x < rayCount; x++) {
  // Convert screen position to camera space (-1 = left edge, +1 = right edge)
  const cameraX = 2 * x / rayCount - 1;
  
  // Calculate angle for this ray based on player direction and FOV
  const baseAngle = player.direction * Math.PI / 2;
  const rayAngle = baseAngle + Math.atan(cameraX * Math.tan(this.fov / 2));
  
  // Cast the ray and see what it hits
  const rayResult = this.castRay(maze, player, rayAngle);
  
  // Draw the wall slice if we hit something
  if (rayResult.hit) {
    this.drawWallSlice(x, rayResult.distance, rayResult.side, rayResult.wallX);
  }
}
```

### 4. The DDA Algorithm

Digital Differential Analysis (DDA) is a way to walk through the grid without checking every single point.

**The Process:**
1. Start at your position
2. Calculate: "Which grid line do I hit first? Vertical or horizontal?"
3. Move to that grid line
4. Check: "Is there a wall here?"
5. If yes -> STOP and measure distance
6. If no -> Repeat from step 2

Instead of checking every tiny point along the ray (which could be thousands), we only check at grid boundaries.

```javascript
// Ray direction components
const rayDirX = Math.sin(angle);
const rayDirY = -Math.cos(angle);

// Starting grid cell
let mapX = Math.floor(player.x);
let mapY = Math.floor(player.y);

// Distance the ray travels to cross one grid cell
const deltaDistX = Math.abs(1 / rayDirX);
const deltaDistY = Math.abs(1 / rayDirY);

// Which direction to step in grid (+1 or -1)
const stepX = rayDirX < 0 ? -1 : 1;
const stepY = rayDirY < 0 ? -1 : 1;

// Distance from current position to next grid line
let sideDistX = rayDirX < 0 
  ? (player.x - mapX) * deltaDistX 
  : (mapX + 1 - player.x) * deltaDistX;
let sideDistY = rayDirY < 0 
  ? (player.y - mapY) * deltaDistY 
  : (mapY + 1 - player.y) * deltaDistY;

let hit = false;
let side; // Did we hit a vertical wall (0) or horizontal wall (1)?

// Step through grid until we hit a wall
while (!hit && maxSteps > 0) {
  // Jump to the next grid line (whichever is closer)
  if (sideDistX < sideDistY) {
    sideDistX += deltaDistX;  // Move to next vertical line
    mapX += stepX;
    side = 0;
  } else {
    sideDistY += deltaDistY;  // Move to next horizontal line
    mapY += stepY;
    side = 1;
  }
  
  // Check if this grid cell has a wall
  if (maze.isWall(mapX, mapY)) {
    hit = true;
  }
  
  maxSteps--;
}
```

### 5. Measuring Distance

Once a ray hits a wall, we need to know two things:

1. **How far away is the wall?** (determines height on screen)
2. **Where exactly did we hit?** (determines which part of the texture to show)

**Important: The Fisheye Fix**

If we used the actual ray length, walls would look curved (like looking through a fisheye lens). Instead, we use perpendicular distance, or the shortest straight-line distance to the wall.

Think of it like this: Imagine you're holding a ruler perpendicular to your face. We measure how far the wall is from that ruler, not how far the ray traveled at an angle.

```javascript
// Calculate perpendicular wall distance (prevents fisheye effect)
let perpWallDist;
if (side === 0) {
  // Hit a vertical wall (North/South facing)
  perpWallDist = Math.abs((mapX - player.x + (1 - stepX) / 2) / rayDirX);
} else {
  // Hit a horizontal wall (East/West facing)
  perpWallDist = Math.abs((mapY - player.y + (1 - stepY) / 2) / rayDirY);
}

// Calculate exact position on the wall (0.0 to 1.0)
// This tells us which column of the texture to use
let wallX;
if (side === 0) {
  wallX = player.y + perpWallDist * rayDirY;
} else {
  wallX = player.x + perpWallDist * rayDirX;
}
wallX -= Math.floor(wallX);  // Keep only the decimal part
```

### 6. Drawing the Wall Strip

Now we draw one thin vertical line of wall. The key formula is simple:

`wallHeight = 1 / distance`

This creates perspective:
- Wall at distance 1 → Very tall (takes up most of screen)
- Wall at distance 2 → Half as tall
- Wall at distance 4 → Quarter height
- Wall at distance 10 → Tiny

The line is always centered on the middle of the screen (the horizon line), so as walls get shorter, they shrink equally from top and bottom.

**The code for drawing one vertical slice:**

```javascript
// Calculate how tall this wall should appear on screen
const projectionDistance = (this.height / 2) / Math.tan(this.fov / 2);
const lineHeight = Math.max(1, projectionDistance * this.wallHeight / distance);

// Figure out where to start and end drawing (center it on horizon)
const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + this.height / 2));
const drawEnd = Math.min(this.height, Math.ceil(lineHeight / 2 + this.height / 2));

// Draw the actual wall slice
this.ctx.fillStyle = wallColor;
this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
```

### 7. Adding Details: Textures and Fog

To make walls look realistic, we add:

**Textures**: Each wall has an image (brick, stone, etc.). We figure out which vertical slice of that image to show based on where the ray hit the wall. Then we stretch that thin slice to match the wall height.

**Shading**: Walls facing different directions get different brightness:
- North/South walls → Brighter
- East/West walls → Slightly darker

This helps your brain understand depth and orientation.

**Fog**: Distant objects fade into the background:
- Close walls → Clear and bright
- Far walls → Faded and dim
- Beyond view distance → Completely hidden

This adds atmosphere and hides the "edge" where rendering stops.

**Here's how we apply textures and effects:**

```javascript
// Figure out which column of the texture to use
const texX = Math.floor(wallX * texWidth) % texWidth;

// Draw a 1-pixel-wide slice of the texture, stretched to the wall height
this.ctx.drawImage(
  this.wallTexture,
  texX, 0, 1, texHeight,              // Source: thin slice from texture
  x, drawStart, 1, drawEnd - drawStart // Destination: stretched on screen
);

// Darken horizontal walls for depth perception
if (side === 1) {
  this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
}

// Apply fog based on distance
if (distance > this.fogStart) {
  const fogIntensity = (distance - this.fogStart) / (this.viewDistance - this.fogStart);
  this.ctx.fillStyle = this.colors.sky;
  this.ctx.globalAlpha = fogIntensity * 0.8;
  this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
  this.ctx.globalAlpha = 1.0;  // Reset transparency
}
```

## Additional Tricks

### Fisheye Correction
Without correction, straight walls would look curved (barrel distortion), like looking through a fisheye camera lens. We fix this by using perpendicular distance instead of actual ray distance. This ensures walls that are the same distance away all appear the same height, even at the screen edges.

### Bump Animation
When you try to walk into a wall, the camera briefly moves forward a tiny bit, then bounces back. This creates a satisfying "bump" feeling that gives feedback you hit something solid.

### Atmospheric Fog
Fog isn't just for looks - it serves practical purposes:
- Creates depth perception (helps you judge distances)
- Adds atmosphere and mood
- Hides the "pop-in" where distant walls suddenly appear
- Improves performance by not rendering distant objects

### Directional Shading
Making walls brighter or darker based on which way they face helps your brain understand the 3D space better. It's a simple trick that makes a huge difference in readability.

## Summary

Here's the entire process in simple terms:

1. **For each column of pixels on screen** (left to right):
   - Shoot an invisible ray from your position
   - See what wall it hits and how far away
   - Draw a vertical line of wall (tall if close, short if far)
   
2. **Add polish**:
   - Stretch textures onto the walls
   - Make some walls darker than others
   - Fade distant walls with fog

3. **Repeat 60 times per second** for smooth animation

That's it! This 30+ year old technique still works great for grid-based games. It's fast, simple, and doesn't need a powerful computer. No GPU, no complex math - just clever 2D tricks that fool your brain into seeing 3D.
import { getBiomeTextures } from './TextureManager.js';

export class MazeRenderer {
  constructor(canvas, textureManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.textureManager = textureManager;
    
    this.fov = Math.PI / 3;
    this.viewDistance = 5;
    this.fogStart = 3;
    this.wallHeight = 0.8;
    
    this.currentBiome = 'DUNGEON';
    this.wallTexture = null;
    this.floorTexture = null;
    this.ceilingTexture = null;
    
    this.colors = {
      wall: '#666666',
      wallDark: '#444444',
      floor: '#333333',
      ceiling: '#222222',
      sky: '#111144'
    };
  }

  setBiome(biomeName) {
    const biome = getBiomeTextures(biomeName);
    this.currentBiome = biomeName;
    this.colors = { ...biome.colors };
    
    this.wallTexture = this.textureManager.getTexture(biome.wall);
    this.floorTexture = this.textureManager.getTexture(biome.floor);
    this.ceilingTexture = this.textureManager.getTexture(biome.ceiling);
  }

  render(maze, player) {
    if (maze.biome) {
      this.setBiome(maze.biome);
    }
    
    this.clearScreen();
    this.drawSky();
    this.drawFloor();
    this.drawWalls(maze, player);
    this.drawDoors(maze, player);
    this.drawNPCs(maze, player);
  }

  clearScreen() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawSky() {
    this.ctx.fillStyle = this.colors.sky;
    this.ctx.fillRect(0, 0, this.width, this.height / 2);
  }

  drawFloor() {
    this.ctx.fillStyle = this.colors.floor;
    this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
  }

  drawWalls(maze, player) {
    const rayCount = this.width;

    let renderX = player.x;
    let renderY = player.y;
    
    if (player.isBumping) {
      const bumpOffset = player.getBumpOffset();
      const dx = [0, 1, 0, -1][Math.floor(player.direction)];
      const dy = [-1, 0, 1, 0][Math.floor(player.direction)];
      renderX += dx * bumpOffset;
      renderY += dy * bumpOffset;
    }
    
    const renderDir = player.direction;
    
    const renderPlayer = {
      x: renderX,
      y: renderY,
      direction: renderDir,
      isMoving: player.isMoving,
      isTurning: player.isTurning
    };
    
    for (let x = 0; x < rayCount; x++) {
      // Convert screen x to camera space (-1 to 1)
      const cameraX = 2 * x / rayCount - 1;
      const baseAngle = renderPlayer.direction * Math.PI / 2;
      // Calculate ray angle based on FOV and camera position
      const rayAngle = baseAngle + Math.atan(cameraX * Math.tan(this.fov / 2));
      
      const rayResult = this.castRay(maze, renderPlayer, rayAngle);
      
      if (rayResult.hit) {
        const angleDiff = rayAngle - baseAngle;
        const correctedDistance = rayResult.distance * Math.cos(angleDiff);
        this.drawWallSlice(x, correctedDistance, rayResult.side, rayResult.wallX);
      }
    }
  }

  castRay(maze, player, angle) {
    const rayDirX = Math.sin(angle); 
    const rayDirY = -Math.cos(angle);
    
    const safeDirX = rayDirX === 0 ? 1e-10 : rayDirX;
    const safeDirY = rayDirY === 0 ? 1e-10 : rayDirY;
    
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);
    
    const deltaDistX = Math.abs(1 / safeDirX);
    const deltaDistY = Math.abs(1 / safeDirY);
    
    let stepX, stepY, sideDistX, sideDistY;
    
    if (safeDirX < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
    }
    
    if (safeDirY < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
    }
    
    let hit = false;
    let side; // 0=x-side, 1=y-side
    let maxSteps = Math.ceil(this.viewDistance) * 2;
    
    // DDA algorithm with distance-based early exit
    while (!hit && maxSteps > 0) {
      const prevMapX = mapX;
      const prevMapY = mapY;
      
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      
      let currentDist;
      if (side === 0) {
        currentDist = Math.abs((mapX - player.x + (1 - stepX) / 2) / safeDirX);
      } else {
        currentDist = Math.abs((mapY - player.y + (1 - stepY) / 2) / safeDirY);
      }
      
      if (currentDist > this.viewDistance) {
        break;
      }
      
      if (maze.isWall(mapX, mapY)) {
        hit = true;
      }
      
      maxSteps--;
    }
    
    if (!hit) {
      // Fallback if no wall found
      return {
        hit: false,
        distance: this.viewDistance,
        side: 0,
        wallX: 0,

      };
    }
    
    let perpWallDist;
    if (side === 0) {
      perpWallDist = Math.abs((mapX - player.x + (1 - stepX) / 2) / safeDirX);
    } else {
      perpWallDist = Math.abs((mapY - player.y + (1 - stepY) / 2) / safeDirY);
    }
    
    let wallX;
    if (side === 0) {
      wallX = player.y + perpWallDist * safeDirY;
    } else {
      wallX = player.x + perpWallDist * safeDirX;
    }
    wallX -= Math.floor(wallX);
    
    return {
      hit: true,
      distance: perpWallDist,
      side: side,
      wallX: wallX,

    };
  }

  drawWallSlice(x, distance, side, wallX) {
    const projectionDistance = (this.height / 2) / Math.tan(this.fov / 2);
    const lineHeight = Math.max(1, projectionDistance * this.wallHeight / Math.max(0.1, distance));
    const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + this.height / 2));
    const drawEnd = Math.min(this.height, Math.ceil(lineHeight / 2 + this.height / 2));
    
    let fogIntensity = 0;
    if (distance > this.fogStart) {
      fogIntensity = Math.min(1, (distance - this.fogStart) / (this.viewDistance - this.fogStart));
    }
    
    if (this.wallTexture && this.wallTexture.complete) {
      const texWidth = this.wallTexture.width;
      const texHeight = this.wallTexture.height;
      
      const texX = Math.floor(wallX * texWidth) % texWidth;
      
      const brightness = side === 1 ? 0.6 : 1.0;
      
      this.ctx.save();
      
      const finalAlpha = brightness * (1 - fogIntensity * 0.7);
      if (finalAlpha < 1.0) {
        this.ctx.globalAlpha = finalAlpha;
      }

      this.ctx.drawImage(
        this.wallTexture,
        texX, 0, 1, texHeight, 
        x, drawStart, 1, drawEnd - drawStart 
      );
      
      this.ctx.restore();

      if (side === 1) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
      
      if (fogIntensity > 0) {
        const fogColor = this.colors.sky || '#111144';
        this.ctx.fillStyle = fogColor;
        this.ctx.globalAlpha = fogIntensity * 0.8;
        this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        this.ctx.globalAlpha = 1.0;
      }

    } else {
      const color = side === 1 ? this.colors.wallDark : this.colors.wall;
      this.ctx.fillStyle = color;
      
      if (fogIntensity > 0) {
        this.ctx.globalAlpha = 1 - fogIntensity * 0.7;
      }
      
      this.ctx.fillRect(x, drawStart, 1, Math.max(1, drawEnd - drawStart));
      
      if (fogIntensity > 0) {
        const fogColor = this.colors.sky || '#111144';
        this.ctx.fillStyle = fogColor;
        this.ctx.globalAlpha = fogIntensity * 0.8;
        this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        this.ctx.globalAlpha = 1.0;
      }
    }
  }

  drawDoors(maze, player) {
    // Get visible doors on the current floor - render them as part of raycasting
    const playerFloor = player.floor || 0;
    const doors = maze.doorManager.getDoorsOnFloor(playerFloor);
    
    if (doors.length === 0) return;
    const rayCount = this.width;
    
    let renderX = player.x;
    let renderY = player.y;
    
    if (player.isBumping) {
      const bumpOffset = player.getBumpOffset();
      const dx = [0, 1, 0, -1][Math.floor(player.direction)];
      const dy = [-1, 0, 1, 0][Math.floor(player.direction)];
      renderX += dx * bumpOffset;
      renderY += dy * bumpOffset;
    }
    
    const renderDir = player.direction;
    const renderPlayer = {
      x: renderX,
      y: renderY,
      direction: renderDir
    };
    
    for (let x = 0; x < rayCount; x++) {
      const cameraX = 2 * x / rayCount - 1;
      const baseAngle = renderPlayer.direction * Math.PI / 2;
      const rayAngle = baseAngle + Math.atan(cameraX * Math.tan(this.fov / 2));
      
      // Check if ray hits a door
      const doorHit = this.castRayForDoors(maze, renderPlayer, rayAngle, doors, playerFloor);
      
      if (doorHit.hit) {
        const angleDiff = rayAngle - baseAngle;
        const correctedDistance = doorHit.distance * Math.cos(angleDiff);
        this.drawDoorSlice(x, correctedDistance, doorHit.door, doorHit.side, doorHit.wallX);
      }
    }
  }

  castRayForDoors(maze, player, angle, doors, floor) {
    const rayDirX = Math.sin(angle); 
    const rayDirY = -Math.cos(angle);
    
    const safeDirX = rayDirX === 0 ? 1e-10 : rayDirX;
    const safeDirY = rayDirY === 0 ? 1e-10 : rayDirY;
    
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);
    
    const deltaDistX = Math.abs(1 / safeDirX);
    const deltaDistY = Math.abs(1 / safeDirY);
    
    let stepX, stepY, sideDistX, sideDistY;
    
    if (safeDirX < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
    }
    
    if (safeDirY < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
    }
    
    let maxSteps = Math.ceil(this.viewDistance) * 2;
    
    // DDA algorithm to find door hits
    while (maxSteps > 0) {
      const prevMapX = mapX;
      const prevMapY = mapY;
      
      let side;
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0; // X-side (vertical wall)
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1; // Y-side (horizontal wall)
      }
      
      // Calculate current distance
      let currentDist;
      if (side === 0) {
        currentDist = Math.abs((mapX - player.x + (1 - stepX) / 2) / safeDirX);
      } else {
        currentDist = Math.abs((mapY - player.y + (1 - stepY) / 2) / safeDirY);
      }
      
      if (currentDist > this.viewDistance) {
        break;
      }

      const door = maze.doorManager.getDoorOnEdge(prevMapX, prevMapY, mapX, mapY, floor);
      
      if (door) {
        let perpWallDist;
        if (side === 0) {
          perpWallDist = Math.abs((mapX - player.x + (1 - stepX) / 2) / safeDirX);
        } else {
          perpWallDist = Math.abs((mapY - player.y + (1 - stepY) / 2) / safeDirY);
        }
        
        let wallX;
        if (side === 0) {
          wallX = player.y + perpWallDist * safeDirY;
        } else {
          wallX = player.x + perpWallDist * safeDirX;
        }
        wallX -= Math.floor(wallX);
        
        return {
          hit: true,
          door: door,
          distance: perpWallDist,
          side: side,
          wallX: wallX
        };
      }
      
      if (maze.isWall(mapX, mapY, floor)) {
        break;
      }
      
      maxSteps--;
    }
    
    return { hit: false };
  }

  drawDoorSlice(x, distance, door, side, wallX) {
    const projectionDistance = (this.height / 2) / Math.tan(this.fov / 2);
    const lineHeight = Math.max(1, projectionDistance * this.wallHeight / Math.max(0.1, distance));
    const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + this.height / 2));
    const drawEnd = Math.min(this.height, Math.ceil(lineHeight / 2 + this.height / 2));
    
    let fogIntensity = 0;
    if (distance > this.fogStart) {
      fogIntensity = Math.min(1, (distance - this.fogStart) / (this.viewDistance - this.fogStart));
    }
    
    if (door.openProgress >= 0.95) return;
    
    const doorWidthRatio = 0.7;
    const doorStart = (1 - doorWidthRatio) / 2;  // 0.15 (15% margin on left)
    const doorEnd = doorStart + doorWidthRatio;   // 0.85 (15% margin on right)
    
    const isDoorArea = wallX >= doorStart && wallX <= doorEnd;
    
    if (!isDoorArea) {
      // Render wall instead of door for this slice
      this.drawWallSlice(x, distance, side, wallX);
      return;
    }
    
    const doorTexture = door.spriteTexture ? this.textureManager.getTexture(door.spriteTexture) : null;
    
    this.ctx.save();
    
    if (doorTexture && doorTexture.complete) {
      const texWidth = doorTexture.width;
      const texHeight = doorTexture.height;
      
      const doorLocalX = (wallX - doorStart) / doorWidthRatio;
      
      let texX;
      if (door.openProgress > 0) {
        const visiblePortion = 1 - door.openProgress;
        texX = Math.floor(doorLocalX * texWidth * visiblePortion) % texWidth;
      } else {
        texX = Math.floor(doorLocalX * texWidth) % texWidth;
      }
      
      const brightness = side === 1 ? 0.6 : 1.0;
      const finalAlpha = brightness * (1 - fogIntensity * 0.7);
      
      if (finalAlpha < 1.0) {
        this.ctx.globalAlpha = finalAlpha;
      }

      this.ctx.drawImage(
        doorTexture,
        texX, 0, 1, texHeight,
        x, drawStart, 1, drawEnd - drawStart
      );
      
      this.ctx.restore();
    } else {
      const brightness = side === 1 ? 0.6 : 1.0;
      const doorLocalX = (wallX - doorStart) / doorWidthRatio;
      
      let r = 101 * brightness;
      let g = 67 * brightness;
      let b = 33 * brightness;
      
      const grainPattern = Math.sin(doorLocalX * 30) * 8 + Math.sin(doorLocalX * 50) * 4;
      r += grainPattern;
      g += grainPattern * 0.8;
      b += grainPattern * 0.5;
      
      const edgeDarkness = Math.min(
        Math.abs(doorLocalX - 0.1) < 0.05 ? 0.7 : 1,
        Math.abs(doorLocalX - 0.5) < 0.05 ? 0.7 : 1,
        Math.abs(doorLocalX - 0.9) < 0.05 ? 0.7 : 1
      );
      
      r *= edgeDarkness;
      g *= edgeDarkness;
      b *= edgeDarkness;
      
      const alpha = (1 - fogIntensity * 0.7) * (1 - door.openProgress * 0.7);
      
      this.ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
      this.ctx.globalAlpha = alpha;
      
      this.ctx.fillRect(x, drawStart, 1, Math.max(1, drawEnd - drawStart));
      
      if (doorLocalX > 0.7 && doorLocalX < 0.8) {
        const handleHeight = Math.max(3, (drawEnd - drawStart) * 0.08);
        const handleY = (drawStart + drawEnd) / 2;
        
        this.ctx.fillStyle = '#B8860B';
        this.ctx.globalAlpha = alpha * 0.9;
        this.ctx.fillRect(x, handleY - handleHeight / 2, 1, handleHeight);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.globalAlpha = alpha * 0.6;
        this.ctx.fillRect(x, handleY - handleHeight / 2, 1, Math.max(1, handleHeight / 3));
      }

      const panelPositions = [0.25, 0.5, 0.75];
      const screenY = drawStart + (doorLocalX * (drawEnd - drawStart));
      
      for (const panelY of panelPositions) {
        const panelScreenY = drawStart + ((drawEnd - drawStart) * panelY);
        const distFromPanel = Math.abs(screenY - panelScreenY);
        
        if (distFromPanel < 2) {
          this.ctx.fillStyle = '#000000';
          this.ctx.globalAlpha = alpha * 0.3;
          this.ctx.fillRect(x, panelScreenY, 1, 1);
        }
      }
      
      this.ctx.restore();
      
      if (fogIntensity > 0) {
        const fogColor = this.colors.sky || '#111144';
        this.ctx.fillStyle = fogColor;
        this.ctx.globalAlpha = fogIntensity * 0.8;
        this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        this.ctx.globalAlpha = 1.0;
      }
    }
  }

  drawNPCs(maze, player) {
    const visibleNPCs = maze.getVisibleNPCs();
    
    for (let npc of visibleNPCs) {
      this.drawNPC(npc, player);
    }
  }

  drawNPC(npc, player) {
    const npcTexture = this.textureManager.getTexture(npc.image);
    
    if (!npcTexture || !npcTexture.complete) {
      this.drawNPCPlaceholder(npc.name, npc.facingDirection);
      return;
    }

    const npcScreenWidth = this.width * 0.2;
    const npcScreenHeight = this.height * 0.4;
    
    let npcScreenX, npcScreenY;
    
    switch(npc.facingDirection) {
      case 0: // North side - NPC is straight ahead
        npcScreenX = (this.width - npcScreenWidth) / 2;
        npcScreenY = (this.height / 2) - (npcScreenHeight * 0.4);
        break;
      case 1: // East side - NPC is to the right
        npcScreenX = this.width * 0.65;
        npcScreenY = (this.height / 2) - (npcScreenHeight * 0.3);
        break;
      case 2: // South side - NPC is behind
        npcScreenX = (this.width - npcScreenWidth) / 2;
        npcScreenY = (this.height / 2) - (npcScreenHeight * 0.2);
        break;
      case 3: // West side - NPC is to the left
        npcScreenX = this.width * 0.1;
        npcScreenY = (this.height / 2) - (npcScreenHeight * 0.3);
        break;
      default:
        npcScreenX = (this.width - npcScreenWidth) / 2;
        npcScreenY = (this.height / 2) - (npcScreenHeight * 0.3);
    }

    // Draw blob shadow
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#000000';
    
    const shadowWidth = npcScreenWidth * 0.8;
    const shadowHeight = shadowWidth * 0.3;
    const shadowX = npcScreenX + (npcScreenWidth - shadowWidth) / 2;
    const shadowY = npcScreenY + npcScreenHeight - shadowHeight * 0.5;
    
    this.ctx.beginPath();
    this.ctx.ellipse(
      shadowX + shadowWidth / 2,
      shadowY + shadowHeight / 2,
      shadowWidth / 2,
      shadowHeight / 2,
      0, 0, 2 * Math.PI
    );
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.save();
    this.ctx.globalAlpha = 0.9;
    
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    
    this.ctx.drawImage(
      npcTexture,
      npcScreenX, npcScreenY,
      npcScreenWidth, npcScreenHeight
    );
    
    this.ctx.restore();
  }

  drawNPCPlaceholder(npcName, facingDirection = 0) {
    this.ctx.save();
    
    const placeholderWidth = this.width * 0.2;
    const placeholderHeight = this.height * 0.4;
    
    let placeholderX, placeholderY;
    
    switch(facingDirection) {
      case 0: // North side
        placeholderX = (this.width - placeholderWidth) / 2;
        placeholderY = (this.height - placeholderHeight) / 2;
        break;
      case 1: // East side
        placeholderX = this.width * 0.7;
        placeholderY = (this.height - placeholderHeight) / 2;
        break;
      case 2: // South side
        placeholderX = (this.width - placeholderWidth) / 2;
        placeholderY = (this.height - placeholderHeight) / 2;
        break;
      case 3: // West side
        placeholderX = this.width * 0.1;
        placeholderY = (this.height - placeholderHeight) / 2;
        break;
      default:
        placeholderX = (this.width - placeholderWidth) / 2;
        placeholderY = (this.height - placeholderHeight) / 2;
    }
    
    // Draw placeholder rectangle
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(placeholderX, placeholderY, placeholderWidth, placeholderHeight);
    
    // Draw border
    this.ctx.strokeStyle = '#2E7D32';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(placeholderX, placeholderY, placeholderWidth, placeholderHeight);
    
    // Draw "NPC" text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NPC', this.width / 2, this.height / 2);
    
    // Draw name below
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.font = 'bold 20px Arial';
    
    const textY = placeholderY + placeholderHeight + 30;
    this.ctx.strokeText(npcName, this.width / 2, textY);
    this.ctx.fillText(npcName, this.width / 2, textY);
    
    this.ctx.restore();
  }
}

export class MinimapRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 15;
    this.viewSize = 15;
  }

  render(maze, player) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const halfView = Math.floor(this.viewSize / 2);
    const minX = Math.max(0, Math.floor(player.x) - halfView);
    const maxX = Math.min(maze.width, minX + this.viewSize);
    const minY = Math.max(0, Math.floor(player.y) - halfView);
    const maxY = Math.min(maze.height, minY + this.viewSize);
    
    const actualMinX = Math.max(0, maxX - this.viewSize);
    const actualMinY = Math.max(0, maxY - this.viewSize);
    
    for (let y = actualMinY; y < maxY; y++) {
      for (let x = actualMinX; x < maxX; x++) {
        const screenX = (x - actualMinX) * this.scale;
        const screenY = (y - actualMinY) * this.scale;
        
        if (maze.isWall(x, y)) {
          this.ctx.fillStyle = '#666666';
        } else {
          this.ctx.fillStyle = '#222222';
        }
        
        this.ctx.fillRect(screenX, screenY, this.scale, this.scale);
      }
    }
    
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    
    const gridWidth = maxX - actualMinX;
    const gridHeight = maxY - actualMinY;
    
    for (let x = 0; x <= gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.scale, 0);
      this.ctx.lineTo(x * this.scale, gridHeight * this.scale);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.scale);
      this.ctx.lineTo(gridWidth * this.scale, y * this.scale);
      this.ctx.stroke();
    }
    
    if (maze.startPosition) {
      if (maze.startPosition.x >= actualMinX && maze.startPosition.x < maxX &&
          maze.startPosition.y >= actualMinY && maze.startPosition.y < maxY) {
        const startX = (maze.startPosition.x - actualMinX) * this.scale;
        const startY = (maze.startPosition.y - actualMinY) * this.scale;
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.fillRect(startX, startY, this.scale, this.scale);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = `${this.scale * 0.6}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('S', startX + this.scale/2, startY + this.scale*0.7);
      }
    }
    
    if (maze.exitPosition) {
      if (maze.exitPosition.x >= actualMinX && maze.exitPosition.x < maxX &&
          maze.exitPosition.y >= actualMinY && maze.exitPosition.y < maxY) {
        const exitX = (maze.exitPosition.x - actualMinX) * this.scale;
        const exitY = (maze.exitPosition.y - actualMinY) * this.scale;
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(exitX, exitY, this.scale, this.scale);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = `${this.scale * 0.6}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('E', exitX + this.scale/2, exitY + this.scale*0.7);
      }
    }
    
    // Draw NPCs on minimap
    for (let npc of maze.npcs.values()) {
      if (npc.x >= actualMinX && npc.x < maxX &&
          npc.y >= actualMinY && npc.y < maxY) {
        const npcScreenX = (npc.x - actualMinX) * this.scale;
        const npcScreenY = (npc.y - actualMinY) * this.scale;
        
        this.ctx.fillStyle = npc.visible ? 'rgba(0, 150, 255, 0.6)' : 'rgba(0, 150, 255, 0.3)';
        this.ctx.fillRect(npcScreenX, npcScreenY, this.scale, this.scale);
        
        this.ctx.fillStyle = npc.visible ? '#0099ff' : '#0066cc';
        this.ctx.beginPath();
        this.ctx.arc(npcScreenX + this.scale/2, npcScreenY + this.scale/2, this.scale / 3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${this.scale * 0.4}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          npc.name.charAt(0).toUpperCase(), 
          npcScreenX + this.scale/2, 
          npcScreenY + this.scale*0.65
        );
      }
    }
    
    const playerFloor = player.floor || 0;
    const doors = maze.doorManager.getDoorsOnFloor(playerFloor);
    for (let door of doors) {
      if (!door.showOnMinimap) continue;
      if (door.x >= actualMinX && door.x < maxX &&
          door.y >= actualMinY && door.y < maxY) {
        const doorScreenX = (door.x - actualMinX) * this.scale;
        const doorScreenY = (door.y - actualMinY) * this.scale;
        
        let doorColor;
        if (door.locked) {
          doorColor = '#ff0000'; // Red for locked
        } else if (door.state === 'open' || door.state === 'opening') {
          doorColor = '#00ff00'; // Green for open
        } else {
          doorColor = '#ffaa00'; // Orange for closed
        }
        
        this.ctx.strokeStyle = doorColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        switch(door.direction) {
          case 0: // North edge
            this.ctx.moveTo(doorScreenX, doorScreenY);
            this.ctx.lineTo(doorScreenX + this.scale, doorScreenY);
            break;
          case 1: // East edge
            this.ctx.moveTo(doorScreenX + this.scale, doorScreenY);
            this.ctx.lineTo(doorScreenX + this.scale, doorScreenY + this.scale);
            break;
          case 2: // South edge
            this.ctx.moveTo(doorScreenX, doorScreenY + this.scale);
            this.ctx.lineTo(doorScreenX + this.scale, doorScreenY + this.scale);
            break;
          case 3: // West edge
            this.ctx.moveTo(doorScreenX, doorScreenY);
            this.ctx.lineTo(doorScreenX, doorScreenY + this.scale);
            break;
        }
        
        this.ctx.stroke();
      }
    }
    
    const playerScreenX = (player.x - actualMinX) * this.scale;
    const playerScreenY = (player.y - actualMinY) * this.scale;
    
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(playerScreenX, playerScreenY, this.scale / 2.5, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(playerScreenX, playerScreenY, this.scale / 4, 0, 2 * Math.PI);
    this.ctx.fill();
    
    const directionLength = this.scale / 2.2;
    // 0=North, 1=East, 2=South, 3=West - convert to proper angles
    const angle = player.direction * Math.PI / 2;
    const endX = playerScreenX + Math.sin(angle) * directionLength;
    const endY = playerScreenY - Math.cos(angle) * directionLength;
    
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(playerScreenX, playerScreenY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#888888';
    this.ctx.font = `${Math.max(8, this.scale * 0.3)}px monospace`;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Player: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, 5, 15);
    
    const directionNames = ['N', 'E', 'S', 'W'];
    const directionIndex = Math.round(player.direction) % 4;
    const isExact = player.direction === Math.round(player.direction);
    const directionText = `Dir: ${directionNames[directionIndex]} ${isExact ? '✓' : '⚠ ' + player.direction.toFixed(3)}`;
    this.ctx.fillStyle = isExact ? '#888888' : '#ff0000';
    this.ctx.fillText(directionText, 5, 30);
  }
}
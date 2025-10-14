import { getBiomeTextures } from './TextureManager.js';

export class MazeRenderer {
  constructor(canvas, textureManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.textureManager = textureManager;
    
    this.fov = Math.PI / 3;
    this.viewDistance = 8;
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
        this.drawWallSlice(x, correctedDistance, rayResult.side, rayResult.wallX, rayResult.door);
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
    let door = null;
    let side; // 0=x-side, 1=y-side
    let maxSteps = Math.max(maze.width, maze.height) * 2;
    
    // DDA algorithm with safety check
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
      
      if (maze.hasDoor(prevMapX, prevMapY, mapX, mapY)) {
        door = maze.getDoor(prevMapX, prevMapY, mapX, mapY);
        if (door && door.openProgress < 1.0) {
          hit = true;
          mapX = prevMapX;
          mapY = prevMapY;
        }
      }
      
      if (!hit && maze.isWall(mapX, mapY)) {
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
        door: null
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
      door: door
    };
  }

  drawWallSlice(x, distance, side, wallX, door = null) {
    const projectionDistance = (this.height / 2) / Math.tan(this.fov / 2);
    const lineHeight = Math.max(1, projectionDistance * this.wallHeight / Math.max(0.1, distance));
    const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + this.height / 2));
    const drawEnd = Math.min(this.height, Math.ceil(lineHeight / 2 + this.height / 2));
    
    if (this.wallTexture && this.wallTexture.complete) {
      const texWidth = this.wallTexture.width;
      const texHeight = this.wallTexture.height;
      
      const texX = Math.floor(wallX * texWidth) % texWidth;
      
      const brightness = side === 1 ? 0.6 : 1.0;
      
      this.ctx.save();
      if (brightness < 1.0) {
        this.ctx.globalAlpha = brightness;
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

      if (door) {
        const openProgress = door.openProgress || 0;
        const doorVisibility = 1.0 - openProgress;
        
        if (doorVisibility > 0.01) {
          this.ctx.save();
          this.ctx.globalAlpha = doorVisibility;

          this.ctx.fillStyle = '#5C3317';

          const doorHeight = drawEnd - drawStart;
          const panelOffset = openProgress * (doorHeight * 0.5); 
          
          if (doorVisibility > 0.5) {
            this.ctx.fillRect(x, drawStart + panelOffset, 1, doorHeight * (1 - openProgress));
          }
          
          const frameColor = '#3D2817';
          this.ctx.fillStyle = frameColor;
          
          if (wallX < 0.1) {
            this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
          }
          if (wallX > 0.9) {
            this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
          }
          
          if (doorVisibility > 0.3) {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
              this.ctx.lineWidth = 1;
            const plankCount = 5;
            for (let i = 1; i < plankCount; i++) {
              const y = drawStart + panelOffset + (doorHeight * (1 - openProgress) * i / plankCount);
              if (y >= drawStart && y <= drawEnd) {
                  this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + 1, y);
                  this.ctx.stroke();
              }
            }
          }
          
          this.ctx.restore();
        }
      }
    } else {
      const color = side === 1 ? this.colors.wallDark : this.colors.wall;
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, drawStart, 1, Math.max(1, drawEnd - drawStart));
    }
  }
}

export class MinimapRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 15;
  }

  render(maze, player) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const screenX = x * this.scale;
        const screenY = y * this.scale;
        
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
    
    for (let x = 0; x <= maze.width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.scale, 0);
      this.ctx.lineTo(x * this.scale, maze.height * this.scale);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= maze.height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.scale);
      this.ctx.lineTo(maze.width * this.scale, y * this.scale);
      this.ctx.stroke();
    }
    
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 3;
    for (let [key, door] of maze.doors.entries()) {
      const { x1, y1, x2, y2 } = door;
      
      if (x1 === x2) {
        const x = (x1 + x2) * this.scale / 2 + this.scale / 2;
        const y = Math.min(y1, y2) * this.scale + this.scale;
        this.ctx.beginPath();
        this.ctx.moveTo(x - this.scale * 0.3, y);
        this.ctx.lineTo(x + this.scale * 0.3, y);
        this.ctx.stroke();
      } else {
        const x = Math.min(x1, x2) * this.scale + this.scale;
        const y = (y1 + y2) * this.scale / 2 + this.scale / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - this.scale * 0.3);
        this.ctx.lineTo(x, y + this.scale * 0.3);
        this.ctx.stroke();
      }
    }
    
    if (maze.startPosition) {
      const startX = maze.startPosition.x * this.scale;
      const startY = maze.startPosition.y * this.scale;
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      this.ctx.fillRect(startX, startY, this.scale, this.scale);
      
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = `${this.scale * 0.6}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('S', startX + this.scale/2, startY + this.scale*0.7);
    }
    
    if (maze.exitPosition) {
      const exitX = maze.exitPosition.x * this.scale;
      const exitY = maze.exitPosition.y * this.scale;
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      this.ctx.fillRect(exitX, exitY, this.scale, this.scale);
      
      this.ctx.fillStyle = '#ff0000';
      this.ctx.font = `${this.scale * 0.6}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('E', exitX + this.scale/2, exitY + this.scale*0.7);
    }
    
    const playerScreenX = player.x * this.scale;
    const playerScreenY = player.y * this.scale;
    
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
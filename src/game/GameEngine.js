import { DoorManager } from './DoorSystem.js';

export class Maze {
  constructor(width = 10, height = 10, biome = 'DUNGEON', floors = 1) {
    this.biome = biome;
    this.numFloors = floors;
    this.floorData = this.initializeFloors(width, height);
    this.startPosition = { x: 1, y: 1, floor: 0 };
    this.exitPosition = { x: width - 2, y: height - 2, floor: floors - 1 };
    this.npcs = new Map(); // key: "x,y,floor", value: { x, y, floor, type, name, image, visible }
    this.stairs = new Map(); // key: "x,y,floor", value: { x, y, floor, targetFloor, targetX, targetY }
    this.doorManager = new DoorManager();
  }

  initializeFloors(width, height) {
    const floors = [];
    for (let f = 0; f < this.numFloors; f++) {
      floors[f] = {
        width: width,
        height: height,
        cells: this.initializeCells(width, height)
      };
    }
    return floors;
  }

  initializeCells(width, height) {
    const cells = [];
    for (let y = 0; y < height; y++) {
      cells[y] = [];
      for (let x = 0; x < width; x++) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          cells[y][x] = 1; // Wall
        } else {
          cells[y][x] = 0; // Empty space
        }
      }
    }
    return cells;
  }

  // Backward compatibility getters - default to floor 0
  get width() {
    return this.floorData[0]?.width || 0;
  }

  get height() {
    return this.floorData[0]?.height || 0;
  }

  get cells() {
    return this.floorData[0]?.cells || [];
  }

  set cells(value) {
    if (this.floorData[0]) {
      this.floorData[0].cells = value;
    }
  }

  get floors() {
    return this.floorData.map(f => f.cells);
  }

  set floors(value) {
    value.forEach((cells, i) => {
      if (this.floorData[i]) {
        this.floorData[i].cells = cells;
      }
    });
  }

  getFloorWidth(floor) {
    return this.floorData[floor]?.width || 0;
  }

  getFloorHeight(floor) {
    return this.floorData[floor]?.height || 0;
  }

  setFloorDimensions(floor, width, height) {
    if (floor >= 0 && floor < this.numFloors) {
      const oldFloor = this.floorData[floor];
      const newCells = this.initializeCells(width, height);
      
      if (oldFloor) {
        for (let y = 0; y < Math.min(oldFloor.height, height); y++) {
          for (let x = 0; x < Math.min(oldFloor.width, width); x++) {
            newCells[y][x] = oldFloor.cells[y][x];
          }
        }
      }
      
      this.floorData[floor] = { width, height, cells: newCells };
    }
  }

  isWall(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return true;
    const floorInfo = this.floorData[floor];
    if (!floorInfo || x < 0 || x >= floorInfo.width || y < 0 || y >= floorInfo.height) {
      return true; // Out of bounds = wall
    }
    return floorInfo.cells[y][x] === 1;
  }

  canMoveTo(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return false;
    const floorInfo = this.floorData[floor];
    if (!floorInfo || x < 0 || x >= floorInfo.width || y < 0 || y >= floorInfo.height) {
      return false;
    }
    const cellValue = floorInfo.cells[y][x];
    return cellValue === 0 || cellValue === 2;
  }
  
  isSlippery(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return false;
    const floorInfo = this.floorData[floor];
    if (!floorInfo || x < 0 || x >= floorInfo.width || y < 0 || y >= floorInfo.height) {
      return false;
    }
    return floorInfo.cells[y][x] === 2;
  }
  
  getCellType(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return 1; 
    const floorInfo = this.floorData[floor];
    if (!floorInfo || x < 0 || x >= floorInfo.width || y < 0 || y >= floorInfo.height) {
      return 1;
    }
    return floorInfo.cells[y][x];
  }
  
  addWall(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return;
    const floorInfo = this.floorData[floor];
    if (floorInfo && x >= 0 && x < floorInfo.width && y >= 0 && y < floorInfo.height) {
      floorInfo.cells[y][x] = 1;
    }
  }

  removeWall(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return;
    const floorInfo = this.floorData[floor];
    if (floorInfo && x >= 0 && x < floorInfo.width && y >= 0 && y < floorInfo.height) {
      floorInfo.cells[y][x] = 0;
    }
  }
  
  addSlipperyTile(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return;
    const floorInfo = this.floorData[floor];
    if (floorInfo && x >= 0 && x < floorInfo.width && y >= 0 && y < floorInfo.height) {
      floorInfo.cells[y][x] = 2;
    }
  }
  
  removeSlipperyTile(x, y, floor = 0) {
    if (floor < 0 || floor >= this.numFloors) return;
    const floorInfo = this.floorData[floor];
    if (floorInfo && x >= 0 && x < floorInfo.width && y >= 0 && y < floorInfo.height) {
      if (floorInfo.cells[y][x] === 2) {
        floorInfo.cells[y][x] = 0;
      }
    }
  }

  addStairs(x, y, floor, targetFloor, targetX = x, targetY = y) {
    const key = `${x},${y},${floor}`;
    this.stairs.set(key, {
      x, y, floor,
      targetFloor, targetX, targetY
    });
  }

  removeStairs(x, y, floor) {
    const key = `${x},${y},${floor}`;
    this.stairs.delete(key);
  }

  getStairs(x, y, floor) {
    const key = `${x},${y},${floor}`;
    return this.stairs.get(key);
  }

  hasStairs(x, y, floor) {
    const key = `${x},${y},${floor}`;
    return this.stairs.has(key);
  }

  addNPC(x, y, type, name, image, facingDirection = 0, floor = 0) {
    const key = `${x},${y},${floor}`;
    this.npcs.set(key, {
      x: x,
      y: y,
      floor: floor,
      type: type,
      name: name,
      image: image,
      facingDirection: facingDirection, // 0=North, 1=East, 2=South, 3=West
      visible: false // NPC becomes visible when player enters same tile AND faces correct direction
    });
  }

  removeNPC(x, y, floor = 0) {
    const key = `${x},${y},${floor}`;
    this.npcs.delete(key);
  }

  getNPC(x, y, floor = 0) {
    const key = `${x},${y},${floor}`;
    return this.npcs.get(key);
  }

  hasNPC(x, y, floor = 0) {
    const key = `${x},${y},${floor}`;
    return this.npcs.has(key);
  }

  getVisibleNPCs() {
    return Array.from(this.npcs.values()).filter(npc => npc.visible);
  }

  updateNPCVisibility(playerX, playerY, playerDirection) {
    for (let npc of this.npcs.values()) {
      const playerGridX = Math.floor(playerX);
      const playerGridY = Math.floor(playerY);
      const onSameTile = (npc.x === playerGridX && npc.y === playerGridY);
      
      if (onSameTile) {
        const requiredDirection = npc.facingDirection || 0;
        const facingCorrectDirection = Math.round(playerDirection) === requiredDirection;
        npc.visible = facingCorrectDirection;
      } else {
        npc.visible = false;
      }
    }
  }

  addDoor(x, y, floor, direction, config = {}) {
    return this.doorManager.addDoor({
      x, y, floor, direction,
      ...config
    });
  }

  removeDoor(x, y, floor, direction) {
    return this.doorManager.removeDoor(x, y, floor, direction);
  }

  getDoor(x, y, floor, direction) {
    return this.doorManager.getDoor(x, y, floor, direction);
  }

  hasDoor(x, y, floor, direction) {
    return this.doorManager.hasDoor(x, y, floor, direction);
  }

  getDoorBetween(fromX, fromY, toX, toY, floor) {
    return this.doorManager.getDoorBetween(fromX, fromY, toX, toY, floor);
  }

  updateDoors(deltaTime) {
    this.doorManager.update(deltaTime);
  }

  toJSON() {
    const npcsArray = Array.from(this.npcs.entries()).map(([key, npc]) => ({
      key,
      ...npc
    }));
    
    const doorsArray = this.doorManager.toJSON();
    
    return {
      width: this.width,
      height: this.height,
      biome: this.biome,
      cells: this.cells,
      startPosition: this.startPosition,
      exitPosition: this.exitPosition,
      npcs: npcsArray,
      doors: doorsArray
    };
  }

  static fromJSON(data) {
    const maze = new Maze(data.width, data.height, data.biome || 'DUNGEON');
    maze.cells = data.cells;
    maze.startPosition = data.startPosition || { x: 1, y: 1 };
    maze.exitPosition = data.exitPosition || { x: data.width - 2, y: data.height - 2 };
    
    if (data.npcs) {
      maze.npcs = new Map();
      data.npcs.forEach(npcData => {
        maze.npcs.set(npcData.key, {
          x: npcData.x,
          y: npcData.y,
          type: npcData.type,
          name: npcData.name,
          image: npcData.image,
          facingDirection: npcData.facingDirection || 0,
          visible: false
        });
      });
    }
    
    if (data.doors) {
      maze.doorManager = DoorManager.fromJSON(data.doors);
    }
    
    return maze;
  }
}

// Player class
export class Player {
  constructor(x = 1, y = 1, direction = 0, floor = 0) {
    this.x = Math.floor(x) + 0.5;
    this.y = Math.floor(y) + 0.5;
    this.direction = Math.floor(direction); // 0=North, 1=East, 2=South, 3=West
    this.floor = floor;
    this.level = 1;
    this.hp = 100;
    this.maxHp = 100;
    this.mp = 50;
    this.maxMp = 50;
    
    this.targetX = this.x;
    this.targetY = this.y;
    this.targetDirection = this.direction;
    this.isMoving = false;
    this.isTurning = false;
    this.turnStartTime = 0;
    this.moveSpeed = 6;
    this.turnSpeed = 8;
    this.lastUpdateTime = Date.now();
    
    // Bump animation properties
    this.isBumping = false;
    this.bumpProgress = 0;
    this.bumpDistance = 0.1;

    this.isSlipping = false;
  }

  turnLeft() {
    this.direction = (this.direction + 3) % 4;
  }

  turnRight() {
    this.direction = (this.direction + 1) % 4;
  }

  getForwardPosition() {
    // Fixed direction mapping: 0=North(-Y), 1=East(+X), 2=South(+Y), 3=West(-X)
    const dx = [0, 1, 0, -1][this.direction];
    const dy = [-1, 0, 1, 0][this.direction];
    return { x: Math.floor(this.x) + dx, y: Math.floor(this.y) + dy };
  }

  moveForward(maze) {
    const newPos = this.getForwardPosition();
    if (maze.canMoveTo(newPos.x, newPos.y)) {
      this.x = newPos.x + 0.5;
      this.y = newPos.y + 0.5;
      return true;
    }
    return false;
  }

  moveBackward(maze) {
    const dx = [0, -1, 0, 1][this.direction];
    const dy = [1, 0, -1, 0][this.direction];
    const newPos = { x: Math.floor(this.x) + dx, y: Math.floor(this.y) + dy };
    if (maze.canMoveTo(newPos.x, newPos.y)) {
      this.x = newPos.x + 0.5;
      this.y = newPos.y + 0.5;
      return true;
    }
    return false;
  }

  startMoveForward(maze) {
    if (this.isMoving || this.isTurning) return false;
    
    const dx = [0, 1, 0, -1][this.direction];
    const dy = [-1, 0, 1, 0][this.direction];
    const currentGridX = Math.floor(this.x);
    const currentGridY = Math.floor(this.y);
    const newGridX = currentGridX + dx;
    const newGridY = currentGridY + dy;
    
    const doorResult = maze.doorManager.handlePlayerMovement(
      currentGridX, currentGridY, newGridX, newGridY, this.floor || 0
    );
    
    if (doorResult.hasDoor && !doorResult.canPass) {
      this.startBump();
      return false;
    }
    
    if (maze.canMoveTo(newGridX, newGridY)) {
      this.targetX = newGridX + 0.5;
      this.targetY = newGridY + 0.5;
      this.isMoving = true;
      this.lastUpdateTime = Date.now();
      return true;
    }
    return false;
  }

  startMoveBackward(maze) {
    if (this.isMoving || this.isTurning) return false;
    
    const dx = [0, -1, 0, 1][this.direction];
    const dy = [1, 0, -1, 0][this.direction];
    const currentGridX = Math.floor(this.x);
    const currentGridY = Math.floor(this.y);
    const newGridX = currentGridX + dx;
    const newGridY = currentGridY + dy;

    const doorResult = maze.doorManager.handlePlayerMovement(
      currentGridX, currentGridY, newGridX, newGridY, this.floor || 0
    );
    
    if (doorResult.hasDoor && !doorResult.canPass) {
      this.startBump();
      return false;
    }
    
    if (maze.canMoveTo(newGridX, newGridY)) {
      this.targetX = newGridX + 0.5;
      this.targetY = newGridY + 0.5;
      this.isMoving = true;
      this.lastUpdateTime = Date.now();
      return true;
    }
    return false;
  }

  startTurnLeft() {
    if (this.isMoving || this.isTurning) return false;
    
    this.direction = Math.round(this.direction) % 4;
    if (this.direction < 0) this.direction += 4;
    
    this.targetDirection = (this.direction + 3) % 4;
    this.isTurning = true;
    this.turnStartTime = Date.now();
    this.lastUpdateTime = Date.now();
    return true;
  }

  startTurnRight() {
    if (this.isMoving || this.isTurning) return false;
    
    this.direction = Math.round(this.direction) % 4;
    if (this.direction < 0) this.direction += 4;
    
    this.targetDirection = (this.direction + 1) % 4;
    this.isTurning = true;
    this.turnStartTime = Date.now();
    this.lastUpdateTime = Date.now();
    return true;
  }
  
  startTurnAround() {
    if (this.isMoving || this.isTurning) return false;
    
    this.direction = Math.round(this.direction) % 4;
    if (this.direction < 0) this.direction += 4;
    
    this.targetDirection = (this.direction + 2) % 4;
    this.isTurning = true;
    this.turnStartTime = Date.now();
    this.lastUpdateTime = Date.now();
    return true;
  }
  
  startBump() {
    if (this.isMoving || this.isTurning || this.isBumping) return false;
    
    this.isBumping = true;
    this.bumpProgress = 0;
    this.lastUpdateTime = Date.now();
    return true;
  }
  
  startSlip(maze) {
    if (this.isMoving || this.isTurning || this.isSlipping) return false;
    
    const dx = [0, 1, 0, -1][this.direction];
    const dy = [-1, 0, 1, 0][this.direction];
    const currentGridX = Math.floor(this.x);
    const currentGridY = Math.floor(this.y);
    const newGridX = currentGridX + dx;
    const newGridY = currentGridY + dy;
    
    if (maze.canMoveTo(newGridX, newGridY)) {
      this.targetX = newGridX + 0.5;
      this.targetY = newGridY + 0.5;
      this.isSlipping = true;
      this.isMoving = true;
      this.lastUpdateTime = Date.now();
      return true;
    }
    
    return false;
  }

  update(maze = null) {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;
    
    if (this.isMoving) {
      const moveProgress = deltaTime * this.moveSpeed;
      
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= moveProgress || distance < 0.01) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.isMoving = false;
        
        const gridX = Math.floor(this.x);
        const gridY = Math.floor(this.y);
        this.x = gridX + 0.5;
        this.y = gridY + 0.5;

        if (maze) {
          maze.doorManager.closeDoorsNotAt(gridX, gridY, this.floor);
          
          if (maze.isSlippery(gridX, gridY, this.floor || 0)) {
            this.isSlipping = false;
            const slipped = this.startSlip(maze);
            if (slipped) {
              this.isSlipping = true;
            }
          } else {
            this.isSlipping = false;
          }
        }
      } else {
        const moveRatio = moveProgress / distance;
        this.x += dx * moveRatio;
        this.y += dy * moveRatio;
      }
    }

    if (this.isTurning) {
      const turnProgress = deltaTime * this.turnSpeed;

      let angleDiff = this.targetDirection - this.direction;
      if (angleDiff > 2) angleDiff -= 4;
      if (angleDiff < -2) angleDiff += 4;

      const snapThreshold = Math.max(0.15, turnProgress * 3.0);
      
      if (Math.abs(angleDiff) <= snapThreshold) {
        this.direction = Math.round(this.targetDirection);
        this.isTurning = false;
        
        this.direction = this.direction % 4;
        if (this.direction < 0) this.direction += 4;
        
        this.direction = Math.floor(this.direction + 0.5);
      } else {
        const turnDirection = angleDiff > 0 ? 1 : -1;
        this.direction += turnDirection * turnProgress;
        
        while (this.direction < 0) this.direction += 4;
        while (this.direction >= 4) this.direction -= 4;
        
        const finalCheck = this.targetDirection - this.direction;
        if (Math.abs(finalCheck) < 0.01) {
          this.direction = Math.round(this.targetDirection);
          this.isTurning = false;
          this.direction = this.direction % 4;
          if (this.direction < 0) this.direction += 4;
        }
      }
    }
    
    if (this.isBumping) {
      const bumpSpeed = 10;
      this.bumpProgress += deltaTime * bumpSpeed;
      
      if (this.bumpProgress >= 1.0) {
        this.isBumping = false;
        this.bumpProgress = 0;
      }
    }

    if (!this.isTurning) {
      // Force to nearest cardinal direction
      this.direction = Math.round(this.direction);
      
      // Ensure in range [0, 3]
      this.direction = this.direction % 4;
      if (this.direction < 0) this.direction += 4;
      
      if (this.direction !== 0 && this.direction !== 1 && this.direction !== 2 && this.direction !== 3) {
        console.error('Direction corrupted, forcing to 0:', this.direction);
        this.direction = 0;
      }
    }

    if (maze) {
      maze.updateNPCVisibility(this.x, this.y, this.direction);
      maze.updateDoors(deltaTime);
    }

    return this.isMoving || this.isTurning || this.isBumping;
  }
  
  getBumpOffset() {
    if (!this.isBumping) return 0;
    
    const offset = Math.sin(this.bumpProgress * Math.PI) * this.bumpDistance;
    return offset;
  }

  canAct() {
    return !this.isMoving && !this.isTurning && !this.isBumping;
  }
}

export class BattleSystem {
  constructor() {
    this.encounterRate = 0.03;
    this.stepsSinceLastBattle = 0;
  }

  checkForBattle() {
    this.stepsSinceLastBattle++;
    if (this.stepsSinceLastBattle < 5) return false;
    
    const chance = Math.random();
    if (chance < this.encounterRate) {
      this.stepsSinceLastBattle = 0;
      return true;
    }
    return false;
  }

  generateEnemy() {
    const enemies = [
      { name: 'Shadow', hp: 30, attack: 15 },
      { name: 'Goblin', hp: 45, attack: 20 },
      { name: 'Skeleton', hp: 60, attack: 25 },
      { name: 'Orc', hp: 80, attack: 30 }
    ];
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
}
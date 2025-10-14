export class Maze {
  constructor(width = 10, height = 10, biome = 'DUNGEON') {
    this.width = width;
    this.height = height;
    this.biome = biome;
    this.cells = this.initializeCells();
    this.startPosition = { x: 1, y: 1 };
    this.exitPosition = { x: width - 2, y: height - 2 };
    this.npcs = new Map(); // key: "x,y", value: { x, y, type, name, image, visible }
  }

  initializeCells() {
    const cells = [];
    for (let y = 0; y < this.height; y++) {
      cells[y] = [];
      for (let x = 0; x < this.width; x++) {
        if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
          cells[y][x] = 1; // Wall
        } else {
          cells[y][x] = 0; // Empty space
        }
      }
    }
    return cells;
  }

  isWall(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return true; // Out of bounds = wall
    }
    return this.cells[y][x] === 1;
  }

  canMoveTo(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    return this.cells[y][x] === 0;
  }
  addWall(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.cells[y][x] = 1;
    }
  }

  removeWall(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.cells[y][x] = 0;
    }
  }

  addNPC(x, y, type, name, image, facingDirection = 0) {
    const key = `${x},${y}`;
    this.npcs.set(key, {
      x: x,
      y: y,
      type: type,
      name: name,
      image: image,
      facingDirection: facingDirection, // 0=North, 1=East, 2=South, 3=West
      visible: false // NPC becomes visible when player enters same tile AND faces correct direction
    });
  }

  removeNPC(x, y) {
    const key = `${x},${y}`;
    this.npcs.delete(key);
  }

  getNPC(x, y) {
    const key = `${x},${y}`;
    return this.npcs.get(key);
  }

  hasNPC(x, y) {
    const key = `${x},${y}`;
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

  toJSON() {
    const npcsArray = Array.from(this.npcs.entries()).map(([key, npc]) => ({
      key,
      ...npc
    }));
    
    return {
      width: this.width,
      height: this.height,
      biome: this.biome,
      cells: this.cells,
      startPosition: this.startPosition,
      exitPosition: this.exitPosition,
      npcs: npcsArray
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
    
    return maze;
  }
}

// Player class
export class Player {
  constructor(x = 1, y = 1, direction = 0) {
    this.x = Math.floor(x) + 0.5;
    this.y = Math.floor(y) + 0.5;
    this.direction = Math.floor(direction); // 0=North, 1=East, 2=South, 3=West
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
export class Door {
  constructor(config) {
    // Position: the tile coordinates where the door is located
    this.x = config.x;
    this.y = config.y;
    this.floor = config.floor || 0;
    
    // Direction: which edge of the tile the door is on
    // 0=North edge, 1=East edge, 2=South edge, 3=West edge
    this.direction = config.direction;
    
    // State
    this.state = 'closed'; // 'closed', 'opening', 'open', 'closing'
    this.openProgress = 0; // 0 = fully closed, 1 = fully open
    
    // Animation
    this.animationSpeed = config.animationSpeed || 3;
    
    // Sprite configuration
    this.spriteTexture = config.spriteTexture || null; // texture path for the door sprite
    this.openingSpriteTexture = config.openingSpriteTexture || null; // animation frames
    this.closingSpriteTexture = config.closingSpriteTexture || null;
    
    // If no textures provided, we'll use a placeholder
    this.usePlaceholder = !config.spriteTexture;
    
    this.locked = config.locked || false;
    this.keyRequired = config.keyRequired || null;
    
    this.showOnMinimap = config.showOnMinimap !== false;
  }

  getKey() {
    return `${this.x},${this.y},${this.floor},${this.direction}`;
  }

  getOtherSide() {
    const dx = [0, 1, 0, -1][this.direction];
    const dy = [-1, 0, 1, 0][this.direction];
    return {
      x: this.x + dx,
      y: this.y + dy,
      floor: this.floor
    };
  }

  blocksMovement(fromX, fromY, toX, toY, floor) {
    if (floor !== this.floor) return false;
    if (this.state === 'open' || this.openProgress > 0.9) return false;
    
    const isDoorEdge = (
      (fromX === this.x && fromY === this.y && toX === this.x + [0, 1, 0, -1][this.direction] && toY === this.y + [-1, 0, 1, 0][this.direction]) ||
      (toX === this.x && toY === this.y && fromX === this.x + [0, 1, 0, -1][this.direction] && fromY === this.y + [-1, 0, 1, 0][this.direction])
    );
    
    return isDoorEdge;
  }

  open() {
    if (this.locked) return false;
    if (this.state === 'open' || this.state === 'opening') return true;
    
    this.state = 'opening';
    return true;
  }

  close() {
    if (this.state === 'closed' || this.state === 'closing') return true;
    
    this.state = 'closing';
    return true;
  }

  update(deltaTime) {
    if (this.state === 'opening') {
      this.openProgress += deltaTime * this.animationSpeed;
      if (this.openProgress >= 1.0) {
        this.openProgress = 1.0;
        this.state = 'open';
      }
    } else if (this.state === 'closing') {
      this.openProgress -= deltaTime * this.animationSpeed;
      if (this.openProgress <= 0.0) {
        this.openProgress = 0.0;
        this.state = 'closed';
      }
    }
  }

  canPassThrough() {
    return !this.locked && (this.state === 'open' || this.state === 'opening' || this.openProgress > 0.5);
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      floor: this.floor,
      direction: this.direction,
      state: this.state,
      openProgress: this.openProgress,
      animationSpeed: this.animationSpeed,
      spriteTexture: this.spriteTexture,
      openingSpriteTexture: this.openingSpriteTexture,
      closingSpriteTexture: this.closingSpriteTexture,
      locked: this.locked,
      keyRequired: this.keyRequired,
      showOnMinimap: this.showOnMinimap
    };
  }

  static fromJSON(data) {
    const door = new Door(data);
    door.state = data.state || 'closed';
    door.openProgress = data.openProgress || 0;
    return door;
  }
}

export class DoorManager {
  constructor() {
    this.doors = new Map(); // key: "x,y,floor,direction", value: Door
  }

  addDoor(config) {
    const door = new Door(config);
    const key = door.getKey();
    this.doors.set(key, door);
    return door;
  }

  removeDoor(x, y, floor, direction) {
    const key = `${x},${y},${floor},${direction}`;
    return this.doors.delete(key);
  }

  getDoor(x, y, floor, direction) {
    const key = `${x},${y},${floor},${direction}`;
    return this.doors.get(key);
  }

  hasDoor(x, y, floor, direction) {
    const key = `${x},${y},${floor},${direction}`;
    return this.doors.has(key);
  }

  getDoorBetween(fromX, fromY, toX, toY, floor) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    
    let direction;
    if (dx === 1 && dy === 0) direction = 1; // East
    else if (dx === -1 && dy === 0) direction = 3; // West
    else if (dx === 0 && dy === -1) direction = 0; // North
    else if (dx === 0 && dy === 1) direction = 2; // South
    else return null; // Not adjacent cells
    
    let door = this.getDoor(fromX, fromY, floor, direction);
    if (door) return door;
    
    const oppositeDir = (direction + 2) % 4;
    door = this.getDoor(toX, toY, floor, oppositeDir);
    return door;
  }

  getDoorOnEdge(x1, y1, x2, y2, floor) {
    return this.getDoorBetween(x1, y1, x2, y2, floor);
  }

  getDoorsOnFloor(floor) {
    return Array.from(this.doors.values()).filter(door => door.floor === floor);
  }

  update(deltaTime) {
    for (const door of this.doors.values()) {
      door.update(deltaTime);
    }
  }

  handlePlayerMovement(fromX, fromY, toX, toY, floor) {
    const door = this.getDoorBetween(fromX, fromY, toX, toY, floor);
    
    if (!door) {
      return { canPass: true, hasDoor: false };
    }
    
    if (door.locked) {
      return { canPass: false, hasDoor: true, door: door, reason: 'locked' };
    }
    
    door.open();
    
    return { canPass: true, hasDoor: true, door: door };
  }

  closeAllDoors(floor) {
    for (const door of this.doors.values()) {
      if (door.floor === floor) {
        door.close();
      }
    }
  }

  closeDoorsNotAt(x, y, floor) {
    this.closeAllDoors(floor);
  }

  toJSON() {
    const doorsArray = Array.from(this.doors.entries()).map(([key, door]) => ({
      key,
      ...door.toJSON()
    }));
    return doorsArray;
  }

  static fromJSON(data) {
    const manager = new DoorManager();
    if (data && Array.isArray(data)) {
      data.forEach(doorData => {
        const door = Door.fromJSON(doorData);
        manager.doors.set(door.getKey(), door);
      });
    }
    return manager;
  }

  clear() {
    this.doors.clear();
  }
}

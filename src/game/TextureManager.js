// Texture management system
export class TextureManager {
  constructor() {
    this.textures = new Map();
    this.loadingPromises = new Map();
  }

  loadTexture(name, url) {
    if (this.textures.has(name)) {
      return Promise.resolve(this.textures.get(name));
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.textures.set(name, img);
        this.loadingPromises.delete(name);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(name);
        reject(new Error(`Failed to load texture: ${url}`));
      };
      img.src = url;
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  getTexture(name) {
    return this.textures.get(name);
  }

  hasTexture(name) {
    return this.textures.has(name);
  }

  // Generate a procedural texture as fallback
  generateProceduralTexture(name, width, height, colorFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const color = colorFn(x, y, width, height);
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = color.a !== undefined ? color.a : 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    this.textures.set(name, img);
    return img;
  }
}

// Biome texture definitions
export const BiomeTextures = {
  DUNGEON: {
    name: 'Dungeon',
    wall: 'dungeon_wall',
    floor: 'dungeon_floor',
    ceiling: 'dungeon_ceiling',
    // Fallback colors if textures aren't loaded
    colors: {
      wall: '#666666',
      wallDark: '#444444',
      floor: '#333333',
      ceiling: '#222222',
      sky: '#111144'
    }
  },
  
  CAVE: {
    name: 'Cave',
    wall: 'cave_wall',
    floor: 'cave_floor',
    ceiling: 'cave_ceiling',
    colors: {
      wall: '#5a4a3a',
      wallDark: '#3a2a1a',
      floor: '#2a2520',
      ceiling: '#1a1510',
      sky: '#0a0a0a'
    }
  },
  
  TEMPLE: {
    name: 'Temple',
    wall: 'temple_wall',
    floor: 'temple_floor',
    ceiling: 'temple_ceiling',
    colors: {
      wall: '#d4c4a0',
      wallDark: '#a49470',
      floor: '#8a7a60',
      ceiling: '#6a5a40',
      sky: '#4a3a20'
    }
  },
  
  ICE_CAVERN: {
    name: 'Ice Cavern',
    wall: 'ice_wall',
    floor: 'ice_floor',
    ceiling: 'ice_ceiling',
    colors: {
      wall: '#b0d0e0',
      wallDark: '#8090a0',
      floor: '#405060',
      ceiling: '#304050',
      sky: '#203040'
    }
  },
  
  HELL: {
    name: 'Hell',
    wall: 'hell_wall',
    floor: 'hell_floor',
    ceiling: 'hell_ceiling',
    colors: {
      wall: '#aa3333',
      wallDark: '#662020',
      floor: '#441111',
      ceiling: '#220808',
      sky: '#110404'
    }
  },
  
  FOREST: {
    name: 'Forest',
    wall: 'forest_wall',
    floor: 'forest_floor',
    ceiling: 'forest_ceiling',
    colors: {
      wall: '#4a6a3a',
      wallDark: '#2a4a1a',
      floor: '#3a5a2a',
      ceiling: '#2a4a2a',
      sky: '#1a3a2a'
    }
  }
};

export function getBiomeTextures(name) {
  return BiomeTextures[name] || BiomeTextures.DUNGEON;
}

export function getBiomeNames() {
  return Object.keys(BiomeTextures);
}

export function generateDefaultTextures(textureManager) {
  textureManager.generateProceduralTexture('dungeon_wall', 64, 64, (x, y) => {
    const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 20;
    const base = 102 + noise;
    return { r: base, g: base, b: base };
  });

  textureManager.generateProceduralTexture('dungeon_floor', 64, 64, (x, y) => {
    const noise = (Math.random() - 0.5) * 10;
    const base = 51 + noise;
    return { r: base, g: base, b: base };
  });

  textureManager.generateProceduralTexture('dungeon_ceiling', 64, 64, (x, y) => {
    const base = 34;
    return { r: base, g: base, b: base };
  });

  textureManager.generateProceduralTexture('cave_wall', 64, 64, (x, y) => {
    const noise = Math.sin(x * 0.2) * Math.cos(y * 0.15) * 15;
    const r = 90 + noise;
    const g = 74 + noise;
    const b = 58 + noise;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('cave_floor', 64, 64, (x, y) => {
    const noise = (Math.random() - 0.5) * 8;
    const r = 42 + noise;
    const g = 37 + noise;
    const b = 32 + noise;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('cave_ceiling', 64, 64, (x, y) => {
    const r = 26;
    const g = 21;
    const b = 16;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('temple_wall', 64, 64, (x, y) => {
    const brickPattern = ((Math.floor(y / 8) % 2) * 32 + Math.floor(x / 16)) % 2 ? 10 : -10;
    const r = 212 + brickPattern;
    const g = 196 + brickPattern;
    const b = 160 + brickPattern;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('temple_floor', 64, 64, (x, y) => {
    const tilePattern = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 ? 5 : -5;
    const r = 138 + tilePattern;
    const g = 122 + tilePattern;
    const b = 96 + tilePattern;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('temple_ceiling', 64, 64, (x, y) => {
    const r = 106;
    const g = 90;
    const b = 64;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('ice_wall', 64, 64, (x, y) => {
    const shimmer = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 15;
    const r = 176 + shimmer;
    const g = 208 + shimmer;
    const b = 224 + shimmer;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('ice_floor', 64, 64, (x, y) => {
    const r = 64;
    const g = 80;
    const b = 96;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('ice_ceiling', 64, 64, (x, y) => {
    const r = 48;
    const g = 64;
    const b = 80;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('hell_wall', 64, 64, (x, y) => {
    const flicker = Math.random() * 20;
    const r = 170 + flicker;
    const g = 51;
    const b = 51;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('hell_floor', 64, 64, (x, y) => {
    const r = 68;
    const g = 17;
    const b = 17;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('hell_ceiling', 64, 64, (x, y) => {
    const r = 34;
    const g = 8;
    const b = 8;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('forest_wall', 64, 64, (x, y) => {
    const bark = ((x + y) % 8 < 2) ? -10 : 0;
    const r = 74 + bark;
    const g = 106 + bark;
    const b = 58 + bark;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('forest_floor', 64, 64, (x, y) => {
    const grass = Math.random() * 10;
    const r = 58 + grass;
    const g = 90 + grass;
    const b = 42 + grass;
    return { r, g, b };
  });

  textureManager.generateProceduralTexture('forest_ceiling', 64, 64, (x, y) => {
    const r = 42;
    const g = 74;
    const b = 42;
    return { r, g, b };
  });
}
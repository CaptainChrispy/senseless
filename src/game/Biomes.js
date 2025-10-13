export const Biomes = {
  DUNGEON: {
    name: 'Dungeon',
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
    colors: {
      wall: '#4a6a3a',
      wallDark: '#2a4a1a',
      floor: '#3a5a2a',
      ceiling: '#2a4a2a',
      sky: '#1a3a2a'
    }
  }
};

export function getBiome(name) {
  return Biomes[name] || Biomes.DUNGEON;
}

export function getBiomeNames() {
  return Object.keys(Biomes);
}
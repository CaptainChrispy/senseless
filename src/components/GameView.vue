<template>
  <div class="game-container">
    <div class="game-header">
      <h1>First-Person Dungeon Crawler</h1>
      <div class="player-stats">
        <span>Level: {{ player.level }}</span>
        <span>HP: {{ player.hp }}/{{ player.maxHp }}</span>
        <span>MP: {{ player.mp }}/{{ player.maxMp }}</span>
      </div>
    </div>
    
    <div class="game-content">
      <div class="main-view">
        <canvas 
          ref="mainCanvas" 
          width="800" 
          height="600"
          class="main-canvas"
        ></canvas>
        
        <div class="game-controls">
          <div class="movement-controls">
            <button @click="moveForward" class="control-btn">↑ Forward</button>
            <div class="turn-controls">
              <button @click="turnLeft" class="control-btn">← Turn Left</button>
              <button @click="turnAround" class="control-btn">↓ Turn Around</button>
              <button @click="turnRight" class="control-btn">Turn Right →</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="side-panel">
        <div class="minimap-container">
          <h3>Map</h3>
          <canvas 
            ref="minimapCanvas" 
            :width="maze.width * 15" 
            :height="maze.height * 15"
            class="minimap-canvas"
          ></canvas>
        </div>
        
        <div class="game-info">
          <p>Position: ({{ Math.floor(player.x) }}, {{ Math.floor(player.y) }})
            <span v-if="player.isMoving" class="subtext">({{ player.x.toFixed(2) }}, {{ player.y.toFixed(2) }})</span>
          </p>
          <p>Direction: {{ getDirectionName() }}
            <span v-if="player.isTurning" class="subtext">({{ player.direction.toFixed(2) }})</span>
          </p>
          <p>Steps: {{ stepCount }}</p>
          <p class="debug-angle">Angle: {{ (player.direction * 90).toFixed(2) }}° 
            <span class="subtext">[{{ player.direction.toFixed(4) }}]</span>
            <span v-if="player.isTurning" class="turning-label">TURNING</span>
          </p>
          <p v-if="player.isMoving || player.isTurning" class="moving-indicator">
            {{ player.isMoving ? 'Moving...' : 'Turning...' }}
          </p>
          
          <div class="fov-control">
            <label for="fovSlider">FOV: {{ fovDegrees }}°</label>
            <input 
              id="fovSlider"
              type="range" 
              min="30" 
              max="120" 
              v-model.number="fovDegrees"
              @input="updateFOV"
              class="fov-slider"
            />
          </div>
        </div>
        
        <div class="admin-controls">
          <button @click="showAdminTool = !showAdminTool" class="admin-btn">
            {{ showAdminTool ? 'Hide' : 'Show' }} Admin Tool
          </button>
        </div>
      </div>
    </div>
    
    <!-- Battle Modal -->
    <div v-if="battleState.inBattle" class="battle-modal">
      <div class="battle-content">
        <h2>Battle!</h2>
        <div class="enemy-info">
          <h3>{{ battleState.enemy.name }}</h3>
          <p>HP: {{ battleState.enemy.hp }}</p>
        </div>
        <div class="battle-actions">
          <button @click="attack" class="battle-btn">Attack</button>
          <button @click="defend" class="battle-btn">Defend</button>
          <button @click="tryEscape" class="battle-btn">Escape</button>
        </div>
        <div class="battle-log">
          <p v-for="(message, index) in battleState.log" :key="index">{{ message }}</p>
        </div>
      </div>
    </div>
    
    <!-- Admin Tool -->
    <AdminTool 
      v-if="showAdminTool" 
      :maze="maze" 
      @maze-updated="handleMazeUpdate"
      @close="showAdminTool = false"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Maze, Player, BattleSystem } from '../game/GameEngine.js'
import { MazeRenderer, MinimapRenderer } from '../game/Renderer.js'
import { TextureManager, generateDefaultTextures } from '../game/TextureManager.js'
import AdminTool from './AdminTool.vue'

export default {
  name: 'GameView',
  components: {
    AdminTool
  },
  setup() {
    const mainCanvas = ref(null)
    const minimapCanvas = ref(null)
    const showAdminTool = ref(false)
    
    // Game state
  const maze = ref(new Maze(15, 15))
  const player = reactive(new Player(1, 1, 0)) // Start at exact integer position
    const stepCount = ref(0)
    const fovDegrees = ref(60)
    
    // Battle system
    const battleSystem = new BattleSystem()
    const battleState = ref({
      inBattle: false,
      enemy: null,
      log: []
    })
    
    // Renderers and texture manager
    let textureManager = null
    let mazeRenderer = null
    let minimapRenderer = null
    
    const initializeGame = () => {
      // Initialize texture manager and generate default textures
      textureManager = new TextureManager()
      generateDefaultTextures(textureManager)
      
      // Add some walls to make the maze more interesting
      maze.value.addWall(3, 2)
      maze.value.addWall(3, 3)
      maze.value.addWall(3, 4)
      maze.value.addWall(5, 6)
      maze.value.addWall(6, 6)
      maze.value.addWall(7, 6)
      maze.value.addWall(9, 3)
      maze.value.addWall(9, 4)
      maze.value.addWall(9, 5)
      
      // Add some doors to demonstrate the new feature
      // Doors are between cells, specified as (x1, y1, x2, y2)
      maze.value.addDoor(3, 5, 3, 6)  // Door in wall between (3,5) and (3,6)
      maze.value.addDoor(7, 6, 8, 6)  // Door in wall between (7,6) and (8,6)
      maze.value.addDoor(2, 8, 3, 8)  // Door in wall between (2,8) and (3,8)
      
      // Initialize renderers
      mazeRenderer = new MazeRenderer(mainCanvas.value, textureManager)
      minimapRenderer = new MinimapRenderer(minimapCanvas.value)
      
      mazeRenderer.fov = (fovDegrees.value * Math.PI) / 180
      
      render()
    }
    
    const render = () => {
      if (mazeRenderer && minimapRenderer) {
        mazeRenderer.render(maze.value, player)
        minimapRenderer.render(maze.value, player)
      }
    }
    
    const moveForward = () => {
      if (battleState.value.inBattle || !player.canAct()) return
      
      if (player.startMoveForward(maze.value)) {
        stepCount.value++
        checkForBattle()
      } else {
        // Blocked! Play bump animation
        player.startBump()
      }
    }
    
    const moveBackward = () => {
      if (battleState.value.inBattle || !player.canAct()) return
      
      if (player.startMoveBackward(maze.value)) {
        stepCount.value++
        checkForBattle()
      } else {
        // Blocked! Play bump animation
        player.startBump()
      }
    }
    
    const turnLeft = () => {
      if (battleState.value.inBattle || !player.canAct()) return
      
      player.startTurnLeft()
    }
    
    const turnRight = () => {
      if (battleState.value.inBattle || !player.canAct()) return
      
      player.startTurnRight()
    }
    
    const turnAround = () => {
      if (battleState.value.inBattle || !player.canAct()) return
      
      player.startTurnAround()
    }
    
    const updateFOV = () => {
      if (mazeRenderer) {
        mazeRenderer.fov = (fovDegrees.value * Math.PI) / 180
        render()
      }
    }
    
    const checkForBattle = () => {
      if (battleSystem.checkForBattle()) {
        startBattle()
      }
    }
    
    const startBattle = () => {
      const enemy = battleSystem.generateEnemy()
      battleState.value = {
        inBattle: true,
        enemy: { ...enemy },
        log: [`A wild ${enemy.name} appears!`]
      }
    }
    
    const attack = () => {
      const damage = Math.floor(Math.random() * 30) + 10
      battleState.value.enemy.hp -= damage
      battleState.value.log.push(`You attack for ${damage} damage!`)
      
      if (battleState.value.enemy.hp <= 0) {
        battleState.value.log.push(`${battleState.value.enemy.name} defeated!`)
        setTimeout(() => {
          battleState.value.inBattle = false
          battleState.value.log = []
        }, 2000)
        return
      }
      
      // Enemy attacks back
      const enemyDamage = Math.floor(Math.random() * battleState.value.enemy.attack) + 5
      player.hp -= enemyDamage
      battleState.value.log.push(`${battleState.value.enemy.name} attacks for ${enemyDamage} damage!`)
      
      if (player.hp <= 0) {
        battleState.value.log.push('You have been defeated!')
        setTimeout(() => {
          // Reset player to start position (center of cell)
          player.hp = player.maxHp
          player.x = maze.value.startPosition.x + 0.5
          player.y = maze.value.startPosition.y + 0.5
          player.targetX = player.x
          player.targetY = player.y
          battleState.value.inBattle = false
          battleState.value.log = []
          render()
        }, 2000)
      }
    }
    
    const defend = () => {
      battleState.value.log.push('You defend, reducing incoming damage!')
      
      const enemyDamage = Math.floor(Math.random() * battleState.value.enemy.attack / 2) + 1
      player.hp -= enemyDamage
      battleState.value.log.push(`${battleState.value.enemy.name} attacks for ${enemyDamage} damage!`)
    }
    
    const tryEscape = () => {
      if (Math.random() < 0.7) {
        battleState.value.log.push('You successfully escaped!')
        setTimeout(() => {
          battleState.value.inBattle = false
          battleState.value.log = []
        }, 1500)
      } else {
        battleState.value.log.push('Could not escape!')
        
        const enemyDamage = Math.floor(Math.random() * battleState.value.enemy.attack) + 5
        player.hp -= enemyDamage
        battleState.value.log.push(`${battleState.value.enemy.name} attacks for ${enemyDamage} damage!`)
      }
    }
    
    const getDirectionName = () => {
      const directions = ['North', 'East', 'South', 'West']
      const index = Math.round(player.direction) % 4
      return directions[index >= 0 ? index : index + 4]
    }
    
    const handleMazeUpdate = (newMaze) => {
      maze.value = newMaze
      render()
    }
    
    const handleKeyPress = (event) => {
      if (battleState.value.inBattle) return
      
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (event.key.startsWith('Arrow')) {
        event.preventDefault()
      }
      
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          moveForward()
          break
        case 's':
        case 'arrowdown':
          turnAround()
          break
        case 'a':
        case 'arrowleft':
          turnLeft()
          break
        case 'd':
        case 'arrowright':
          turnRight()
          break
      }
    }
    
    // Game loop for smooth animations
    let animationFrameId = null
    
    const gameLoop = () => {
      // Update maze (for door animations)
      const currentTime = Date.now();
      const deltaTime = (currentTime - (gameLoop.lastTime || currentTime)) / 1000;
      gameLoop.lastTime = currentTime;
      
      maze.value.updateDoors(deltaTime);
      
      // Snapshot state before update
      const prevX = player.x;
      const prevY = player.y;
      const prevDirection = player.direction;
      const prevIsTurning = player.isTurning;
      const prevIsMoving = player.isMoving;
      const prevIsBumping = player.isBumping;
      const prevIsWaitingForDoor = player.isWaitingForDoor;
      
      // Update player (pass maze for door interaction)
      const stillUpdating = player.update(maze.value);
      
      const stateChanged = stillUpdating ||
        player.x !== prevX ||
        player.y !== prevY ||
        player.direction !== prevDirection ||
        player.isTurning !== prevIsTurning ||
        player.isMoving !== prevIsMoving ||
        player.isBumping !== prevIsBumping ||
        player.isWaitingForDoor !== prevIsWaitingForDoor;
      
      if (stateChanged) {
        render()
      }
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    onMounted(() => {
      initializeGame()
      window.addEventListener('keydown', handleKeyPress)
      gameLoop() // Start the animation loop
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    })
    
    return {
      mainCanvas,
      minimapCanvas,
      showAdminTool,
      maze,
      player,
      stepCount,
      battleState,
      fovDegrees,
      moveForward,
      moveBackward,
      turnLeft,
      turnRight,
      turnAround,
      updateFOV,
      attack,
      defend,
      tryEscape,
      getDirectionName,
      handleMazeUpdate
    }
  }
}
</script>

<style scoped>
.game-container {
  font-family: 'Courier New', monospace;
  background-color: #1a1a1a;
  color: #ffffff;
  min-height: 100vh;
  padding: 20px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.player-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.game-content {
  display: flex;
  gap: 20px;
}

.main-view {
  flex: 1;
}

.main-canvas {
  border: 2px solid #444;
  background-color: #000;
  display: block;
  margin-bottom: 20px;
}

.game-controls {
  text-align: center;
}

.movement-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.turn-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 10px 15px;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: #444;
}

.side-panel {
  width: 300px;
  border: 2px solid #444;
  padding: 20px;
  background-color: #222;
}

.minimap-container {
  margin-bottom: 20px;
}

.minimap-canvas {
  border: 1px solid #555;
  background-color: #000;
}

.game-info {
  margin-bottom: 20px;
  font-size: 14px;
}

.game-info p {
  margin: 5px 0;
}

.fov-control {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #2a2a2a;
}

.fov-control label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #ccc;
}

.fov-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #555;
  outline: none;
  -webkit-appearance: none;
}

.fov-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}

.fov-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
  border: none;
}

.admin-btn {
  background-color: #444;
  color: #fff;
  border: 1px solid #666;
  padding: 10px 20px;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

.admin-btn:hover {
  background-color: #555;
}

.battle-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.battle-content {
  background-color: #333;
  border: 2px solid #666;
  padding: 30px;
  border-radius: 5px;
  text-align: center;
  min-width: 400px;
}

.enemy-info {
  margin: 20px 0;
}

.battle-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.battle-btn {
  background-color: #555;
  color: #fff;
  border: 1px solid #777;
  padding: 10px 20px;
  cursor: pointer;
  font-family: inherit;
}

.battle-btn:hover {
  background-color: #666;
}

.battle-log {
  margin-top: 20px;
  padding: 15px;
  background-color: #222;
  border: 1px solid #444;
  max-height: 200px;
  overflow-y: auto;
  text-align: left;
}

.battle-log p {
  margin: 5px 0;
  font-size: 14px;
}

.moving-indicator {
  color: #ffff00 !important;
  font-weight: bold;
}

.debug-angle {
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.turning-label {
  color: #ff00ff;
  margin-left: 10px;
  font-size: 0.8em;
}

.subtext {
  color: #888;
  font-size: 0.9em;
}
</style>
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
            :width="15 * 15" 
            :height="15 * 15"
            class="minimap-canvas"
          ></canvas>
        </div>
        
        <div class="gamepad-status" v-if="gamepadState.connected">
          <span class="gamepad-indicator">🎮 Gamepad Connected</span>
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
          
          <div class="fov-control">
            <label for="renderDistanceSlider">Render Distance: {{ renderDistance.toFixed(1) }}</label>
            <input 
              id="renderDistanceSlider"
              type="range" 
              min="2" 
              max="15" 
              step="0.5"
              v-model.number="renderDistance"
              @input="updateRenderDistance"
              class="fov-slider"
            />
          </div>
          
          <div class="fov-control">
            <label for="fogDistanceSlider">Fog Start Distance: {{ fogDistance.toFixed(1) }}</label>
            <input 
              id="fogDistanceSlider"
              type="range" 
              min="0.5" 
              max="10" 
              step="0.5"
              v-model.number="fogDistance"
              @input="updateFogDistance"
              class="fov-slider"
            />
          </div>
          
          <div class="biome-control">
            <label for="biomeSelect">Biome:</label>
            <select 
              id="biomeSelect"
              v-model="currentBiome"
              @change="changeBiome"
              class="biome-select"
            >
              <option value="DUNGEON">Dungeon</option>
              <option value="CAVE">Cave</option>
              <option value="TEMPLE">Temple</option>
              <option value="ICE_CAVERN">Ice Cavern</option>
              <option value="HELL">Hell</option>
              <option value="FOREST">Forest</option>
              <option value="OFFICE">Office</option>
            </select>
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
    const fovDegrees = ref(120)
    const renderDistance = ref(5)
    const fogDistance = ref(3)
    const currentBiome = ref('DUNGEON')
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
    
    const initializeGame = async () => {
      // Initialize texture manager and generate default textures
      textureManager = new TextureManager()
      generateDefaultTextures(textureManager)
      
      // Load custom office wall texture
      try {
        await textureManager.loadTexture('office_wall', '/textures/office_wall.png')
        await textureManager.loadTexture('office_floor', '/textures/office_floor.png')
        console.log('Custom office wall texture loaded successfully!')
      } catch (error) {
        console.warn('Failed to load office wall texture, using procedural fallback:', error)
        // Generate procedural office wall texture as fallback
        textureManager.generateProceduralTexture('office_wall', 64, 64, (x, y) => {
          // Office-like texture with panels/tiles
          const panelSize = 16
          const panelX = Math.floor(x / panelSize)
          const panelY = Math.floor(y / panelSize)
          const edgeX = x % panelSize
          const edgeY = y % panelSize
          
          // Create panel borders
          const isBorder = edgeX < 2 || edgeX > panelSize - 3 || edgeY < 2 || edgeY > panelSize - 3
          const base = isBorder ? 200 : 240
          const noise = (Math.random() - 0.5) * 10
          
          return { r: base + noise, g: base + noise, b: base + noise }
        })
      }
      
      // Generate office floor and ceiling textures
      textureManager.generateProceduralTexture('office_floor', 64, 64, (x, y) => {
        // Office carpet/tile pattern
        const tileSize = 32
        const tilePattern = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 ? 5 : -5
        const r = 180 + tilePattern
        const g = 185 + tilePattern
        const b = 190 + tilePattern
        return { r, g, b }
      })
      
      textureManager.generateProceduralTexture('office_ceiling', 64, 64, (x, y) => {
        // Office ceiling tiles
        const tileSize = 16
        const edgeX = x % tileSize
        const edgeY = y % tileSize
        const isEdge = edgeX < 1 || edgeY < 1
        const base = isEdge ? 220 : 245
        return { r: base, g: base, b: base }
      })
      
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
      
      maze.value.addSlipperyTile(2, 1, 0)
      maze.value.addSlipperyTile(2, 2, 0)
      maze.value.addSlipperyTile(4, 4, 0)
      maze.value.addSlipperyTile(4, 5, 0)
      maze.value.addSlipperyTile(7, 3, 0)
      maze.value.addSlipperyTile(8, 5, 0)
      maze.value.addSlipperyTile(8, 6, 0)
      
      maze.value.addDoor(4, 3, 0, 0, {
        locked: false,
        showOnMinimap: true
      })
      
      maze.value.addDoor(5, 5, 0, 1, {
        locked: false,
        showOnMinimap: true
      })
      
      maze.value.addDoor(7, 4, 0, 3, {
        locked: true,
        showOnMinimap: true
      })
      
      maze.value.addDoor(8, 7, 0, 0, {
        locked: false,
        showOnMinimap: true
      })
      
      
      try {
        await textureManager.loadTexture('astronaut', '/textures/astronaut.png')
        console.log('Astronaut NPC texture loaded successfully!')
      } catch (error) {
        console.warn('Failed to load astronaut texture, will use placeholder:', error)
      }
  
      // facingDirection: 0=North, 1=East, 2=South, 3=West
      maze.value.addNPC(5, 5, 'friendly', 'Astronaut', 'astronaut', 0)
      
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
    
    const updateRenderDistance = () => {
      if (mazeRenderer) {
        mazeRenderer.viewDistance = renderDistance.value
        render()
      }
    }
    
    const updateFogDistance = () => {
      if (mazeRenderer) {
        mazeRenderer.fogStart = fogDistance.value
        render()
      }
    }
    
    const changeBiome = () => {
      if (maze.value && mazeRenderer) {
        maze.value.biome = currentBiome.value
        mazeRenderer.setBiome(currentBiome.value)
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
        case 'n':
          if (mazeRenderer) {
            mazeRenderer.toggleSnow(player);
          }
          break
      }
    }
    
    // Gamepad support
    const gamepadState = reactive({
      connected: false,
      index: null,
      lastButtonState: {},
      lastAxisValues: { leftX: 0, leftY: 0, rightX: 0 },
      deadzone: 0.2,
      axisMoveThreshold: 0.5
    })
    
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
      let gamepad = null
      
      // Find first connected gamepad
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          gamepad = gamepads[i]
          if (!gamepadState.connected) {
            console.log('Gamepad connected:', gamepad.id)
            gamepadState.connected = true
            gamepadState.index = i
          }
          break
        }
      }
      
      if (!gamepad) {
        if (gamepadState.connected) {
          console.log('Gamepad disconnected')
          gamepadState.connected = false
          gamepadState.index = null
        }
        return
      }
      
      if (battleState.value.inBattle || !player.canAct()) return
      
      const buttonMappings = {
        0: moveForward,      // A/Cross
        12: moveForward,     // D-pad Up
        1: turnAround,       // B/Circle
        13: turnAround,      // D-pad Down
        2: turnLeft,         // X/Square
        14: turnLeft,        // D-pad Left
        3: turnRight,        // Y/Triangle
        15: turnRight        // D-pad Right
      }
      
      gamepad.buttons.forEach((button, index) => {
        const wasPressed = gamepadState.lastButtonState[index]
        const isPressed = button.pressed
        
        if (isPressed && !wasPressed && buttonMappings[index]) {
          buttonMappings[index]()
        }
        
        gamepadState.lastButtonState[index] = isPressed
      })
      
      if (gamepad.axes.length >= 2) {
        const leftX = Math.abs(gamepad.axes[0]) > gamepadState.deadzone ? gamepad.axes[0] : 0
        const leftY = Math.abs(gamepad.axes[1]) > gamepadState.deadzone ? gamepad.axes[1] : 0
        
        const prevLeftY = gamepadState.lastAxisValues.leftY
        const prevLeftX = gamepadState.lastAxisValues.leftX
        
        if (leftY < -gamepadState.axisMoveThreshold && prevLeftY >= -gamepadState.axisMoveThreshold) {
          moveForward()
        } else if (leftY > gamepadState.axisMoveThreshold && prevLeftY <= gamepadState.axisMoveThreshold) {
          turnAround()
        }
        
        if (leftX < -gamepadState.axisMoveThreshold && prevLeftX >= -gamepadState.axisMoveThreshold) {
          turnLeft()
        } else if (leftX > gamepadState.axisMoveThreshold && prevLeftX <= gamepadState.axisMoveThreshold) {
          turnRight()
        }
        
        gamepadState.lastAxisValues.leftY = leftY
        gamepadState.lastAxisValues.leftX = leftX
      }
      
      if (gamepad.axes.length >= 4) {
        const rightX = Math.abs(gamepad.axes[2]) > gamepadState.deadzone ? gamepad.axes[2] : 0
        const prevRightX = gamepadState.lastAxisValues.rightX
        
        if (rightX < -gamepadState.axisMoveThreshold && prevRightX >= -gamepadState.axisMoveThreshold) {
          turnLeft()
        } else if (rightX > gamepadState.axisMoveThreshold && prevRightX <= gamepadState.axisMoveThreshold) {
          turnRight()
        }
        
        gamepadState.lastAxisValues.rightX = rightX
      }
    }
    
    const handleGamepadConnected = (event) => {
      console.log('Gamepad connected event:', event.gamepad.id)
      gamepadState.connected = true
      gamepadState.index = event.gamepad.index
    }
    
    const handleGamepadDisconnected = (event) => {
      console.log('Gamepad disconnected event:', event.gamepad.id)
      gamepadState.connected = false
      gamepadState.index = null
      gamepadState.lastButtonState = {}
    }
    
    // Game loop for smooth animations
    let animationFrameId = null
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - (gameLoop.lastTime || currentTime)) / 1000;
      gameLoop.lastTime = currentTime;
      
      checkGamepad()
      
      // Snapshot state before update
      const prevX = player.x;
      const prevY = player.y;
      const prevDirection = player.direction;
      const prevIsTurning = player.isTurning;
      const prevIsMoving = player.isMoving;
      const prevIsBumping = player.isBumping;
      // Update player
      const stillUpdating = player.update(maze.value);

      if (mazeRenderer) {
        mazeRenderer.update(player, deltaTime);
      }
      
      const stateChanged = stillUpdating ||
        player.x !== prevX ||
        player.y !== prevY ||
        player.direction !== prevDirection ||
        player.isTurning !== prevIsTurning ||
        player.isMoving !== prevIsMoving ||
        player.isBumping !== prevIsBumping;

      
      const hasWeatherEffects = mazeRenderer && mazeRenderer.snowEffect.enabled;
      
      if (stateChanged || hasWeatherEffects) {
        render()
      }
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    onMounted(() => {
      initializeGame()
      window.addEventListener('keydown', handleKeyPress)
      window.addEventListener('gamepadconnected', handleGamepadConnected)
      window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)
      gameLoop() // Start the animation loop
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
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
      renderDistance,
      fogDistance,
      currentBiome,
      gamepadState,
      moveForward,
      moveBackward,
      turnLeft,
      turnRight,
      turnAround,
      updateFOV,
      updateRenderDistance,
      updateFogDistance,
      changeBiome,
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

.gamepad-status {
  margin: 10px 0;
  padding: 8px;
  background-color: #2a4a2a;
  border: 1px solid #4a7c59;
  border-radius: 5px;
  text-align: center;
}

.gamepad-indicator {
  color: #5a8c69;
  font-weight: bold;
  font-size: 13px;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
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
  appearance: none;
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

.biome-control {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #2a2a2a;
}

.biome-control label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #ccc;
}

.biome-select {
  width: 100%;
  padding: 8px;
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 3px;
  font-family: inherit;
}

.biome-select:focus {
  outline: none;
  border-color: #4CAF50;
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
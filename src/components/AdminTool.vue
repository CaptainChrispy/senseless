<template>
  <div class="admin-overlay">
    <div class="admin-panel">
      <div class="admin-header">
        <h2>Maze Editor</h2>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <div class="admin-content">
        <div class="admin-controls">
          <div class="control-group">
            <h3>Maze Settings</h3>
            <label>
              Width: 
              <input 
                v-model.number="mazeWidth" 
                type="number" 
                min="5" 
                max="30"
                @change="resizeMaze"
              />
            </label>
            <label>
              Height: 
              <input 
                v-model.number="mazeHeight" 
                type="number" 
                min="5" 
                max="30"
                @change="resizeCurrentFloor"
              />
            </label>
            <label>
              Floors: 
              <input 
                v-model.number="numFloors" 
                type="number" 
                min="1" 
                max="10"
                @change="updateFloors"
              />
            </label>
            <label>
              Current Floor: 
              <select v-model.number="currentFloor">
                <option v-for="f in numFloors" :key="f-1" :value="f-1">
                  Floor {{ f }}
                </option>
              </select>
            </label>
            <p class="floor-info">Floor {{ currentFloor + 1 }} size: {{ currentFloorWidth }} x {{ currentFloorHeight }}</p>
            <label>
              Biome:
              <select v-model="selectedBiome" @change="changeBiome">
                <option v-for="biome in biomeOptions" :key="biome" :value="biome">
                  {{ biome.replace(/_/g, ' ') }}
                </option>
              </select>
            </label>
          </div>
          
          <div class="control-group">
            <h3>Edit Mode</h3>
            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="wall"
              /> Add Walls
            </label>
            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="empty"
              /> Remove Walls
            </label>

            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="start"
              /> Set Start
            </label>
            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="exit"
              /> Set Exit
            </label>
            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="stairsUp"
              /> Stairs Up
            </label>
            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="stairsDown"
              /> Stairs Down
            </label>
            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="door"
              /> Add Door
            </label>
            <label>
              <input 
                v-model="editMode" 
                type="radio" 
                value="removeDoor"
              /> Remove Door
            </label>
            <div v-if="editMode === 'door' || editMode === 'removeDoor'" class="door-options">
              <label>
                Door Direction:
                <select v-model.number="doorDirection">
                  <option :value="0">North Edge</option>
                  <option :value="1">East Edge</option>
                  <option :value="2">South Edge</option>
                  <option :value="3">West Edge</option>
                </select>
              </label>
              <label v-if="editMode === 'door'">
                <input v-model="doorLocked" type="checkbox" /> Locked
              </label>
            </div>
          </div>
          
          <div class="control-group">
            <h3>Actions</h3>
            <button @click="clearMaze" class="action-btn">Clear All</button>
            <button @click="generateMaze" class="action-btn">Generate Random</button>
            <button @click="exportMaze" class="action-btn">Export JSON</button>
            <input 
              ref="fileInput"
              type="file" 
              accept=".json"
              @change="importMaze"
              style="display: none"
            />
            <button @click="$refs.fileInput.click()" class="action-btn">Import JSON</button>
          </div>
        </div>
        
        <div class="maze-editor">
          <canvas 
            ref="editorCanvas"
            :width="currentFloorWidth * cellSize"
            :height="currentFloorHeight * cellSize"
            @click="handleCanvasClick"
            @mousemove="handleCanvasHover"
            class="editor-canvas"
          ></canvas>
        </div>
      </div>
      
      <div class="admin-footer">
        <button @click="applyChanges" class="apply-btn">Apply Changes</button>
        <button @click="$emit('close')" class="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { Maze } from '../game/GameEngine.js'
import { getBiomeNames } from '../game/TextureManager.js'

export default {
  name: 'AdminTool',
  props: {
    maze: {
      type: Object,
      required: true
    }
  },
  emits: ['maze-updated', 'close'],
  setup(props, { emit }) {
    const editorCanvas = ref(null)
    const fileInput = ref(null)
    
    const mazeWidth = ref(props.maze.width)
    const mazeHeight = ref(props.maze.height)
    const numFloors = ref(props.maze.numFloors || 1)
    const currentFloor = ref(0)
    const selectedBiome = ref(props.maze.biome || 'DUNGEON')
    const biomeOptions = ref(getBiomeNames())
    const editMode = ref('wall')
    const doorDirection = ref(0) // 0=North, 1=East, 2=South, 3=West
    const doorLocked = ref(false)
    const cellSize = 20
    const currentMaze = ref(new Maze(props.maze.width, props.maze.height, props.maze.biome || 'DUNGEON', props.maze.numFloors || 1))
    
    let ctx = null
    
    const currentFloorWidth = computed(() => currentMaze.value.getFloorWidth(currentFloor.value))
    const currentFloorHeight = computed(() => currentMaze.value.getFloorHeight(currentFloor.value))
    
    watch(currentFloor, () => {
      mazeWidth.value = currentFloorWidth.value
      mazeHeight.value = currentFloorHeight.value
      nextTick(() => {
        ctx = editorCanvas.value.getContext('2d')
        renderEditor()
      })
    })
    
    const initializeEditor = () => {
      ctx = editorCanvas.value.getContext('2d')
      
      // Copy current maze state
      if (props.maze.floorData) {
        currentMaze.value.floorData = props.maze.floorData.map(f => ({
          width: f.width,
          height: f.height,
          cells: f.cells.map(row => [...row])
        }))
        currentMaze.value.numFloors = props.maze.numFloors
      } else if (props.maze.floors) {
        currentMaze.value.floors = props.maze.floors.map(floor => floor.map(row => [...row]))
        currentMaze.value.numFloors = props.maze.numFloors
      } else {
        currentMaze.value.floors[0] = props.maze.cells.map(row => [...row])
      }
      currentMaze.value.startPosition = { ...props.maze.startPosition, floor: props.maze.startPosition.floor || 0 }
      currentMaze.value.exitPosition = { ...props.maze.exitPosition, floor: props.maze.exitPosition.floor || 0 }
      currentMaze.value.biome = props.maze.biome || 'DUNGEON'
      if (props.maze.stairs) {
        currentMaze.value.stairs = new Map(props.maze.stairs)
      }

      if (props.maze.doorManager) {
        currentMaze.value.doorManager = props.maze.doorManager
      }
      
      selectedBiome.value = currentMaze.value.biome
      
      renderEditor()
    }
    
    const renderEditor = () => {
      if (!ctx) return
      
      ctx.clearRect(0, 0, editorCanvas.value.width, editorCanvas.value.height)
      
      const floor = currentFloor.value
      const floorWidth = currentFloorWidth.value
      const floorHeight = currentFloorHeight.value
      
      // Draw grid
      for (let y = 0; y < floorHeight; y++) {
        for (let x = 0; x < floorWidth; x++) {
          const screenX = x * cellSize
          const screenY = y * cellSize
          
          // Determine cell color
          let fillColor = '#333'
          if (currentMaze.value.isWall(x, y, floor)) {
            fillColor = '#666'
          }
          
          if (currentMaze.value.hasStairs(x, y, floor)) {
            const stairs = currentMaze.value.getStairs(x, y, floor)
            fillColor = stairs.targetFloor > floor ? '#00aaff' : '#ff8800' // Blue for up, Orange for down
          }
          
          // Highlight start and exit positions
          if (x === currentMaze.value.startPosition.x && y === currentMaze.value.startPosition.y && floor === currentMaze.value.startPosition.floor) {
            fillColor = '#00ff00'
          } else if (x === currentMaze.value.exitPosition.x && y === currentMaze.value.exitPosition.y && floor === currentMaze.value.exitPosition.floor) {
            fillColor = '#ff0000'
          }
          
          ctx.fillStyle = fillColor
          ctx.fillRect(screenX, screenY, cellSize, cellSize)
          
          // Draw grid lines
          ctx.strokeStyle = '#555'
          ctx.strokeRect(screenX, screenY, cellSize, cellSize)
        }
      }
      
      const doors = currentMaze.value.doorManager.getDoorsOnFloor(floor)
      for (const door of doors) {
        const doorScreenX = door.x * cellSize
        const doorScreenY = door.y * cellSize
        
        ctx.strokeStyle = door.locked ? '#ff0000' : '#ffaa00'
        ctx.lineWidth = 4
        ctx.beginPath()
        
        switch(door.direction) {
          case 0: // North edge
            ctx.moveTo(doorScreenX, doorScreenY)
            ctx.lineTo(doorScreenX + cellSize, doorScreenY)
            break
          case 1: // East edge
            ctx.moveTo(doorScreenX + cellSize, doorScreenY)
            ctx.lineTo(doorScreenX + cellSize, doorScreenY + cellSize)
            break
          case 2: // South edge
            ctx.moveTo(doorScreenX, doorScreenY + cellSize)
            ctx.lineTo(doorScreenX + cellSize, doorScreenY + cellSize)
            break
          case 3: // West edge
            ctx.moveTo(doorScreenX, doorScreenY)
            ctx.lineTo(doorScreenX, doorScreenY + cellSize)
            break
        }
        
        ctx.stroke()
      }

    }
    
    const handleCanvasClick = (event) => {
      const rect = editorCanvas.value.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top
      
      const floor = currentFloor.value
      const floorWidth = currentFloorWidth.value
      const floorHeight = currentFloorHeight.value
      
      const x = Math.floor(clickX / cellSize)
      const y = Math.floor(clickY / cellSize)
      
      if (x < 0 || x >= floorWidth || y < 0 || y >= floorHeight) {
        return
      }
      
      switch (editMode.value) {
        case 'wall':
          currentMaze.value.addWall(x, y, floor)
          break
        case 'empty':
          currentMaze.value.removeWall(x, y, floor)
          currentMaze.value.removeStairs(x, y, floor)
          break
        case 'start':
          currentMaze.value.startPosition = { x, y, floor }
          break
        case 'exit':
          currentMaze.value.exitPosition = { x, y, floor }
          break
        case 'stairsUp':
          if (floor < currentMaze.value.numFloors - 1) {
            currentMaze.value.removeWall(x, y, floor)
            currentMaze.value.addStairs(x, y, floor, floor + 1, x, y)
          }
          break
        case 'stairsDown':
          if (floor > 0) {
            currentMaze.value.removeWall(x, y, floor)
            currentMaze.value.addStairs(x, y, floor, floor - 1, x, y)
          }
          break
        case 'door':
          currentMaze.value.addDoor(x, y, floor, doorDirection.value, {
            locked: doorLocked.value,
            showOnMinimap: true
          })
          break
        case 'removeDoor':
          currentMaze.value.removeDoor(x, y, floor, doorDirection.value)
          break
      }
      
      renderEditor()
    }
    
    const handleCanvasHover = (event) => {
      // Add visual feedback for hover (optional)
    }
    
    const updateFloors = () => {
      const newFloorCount = numFloors.value
      if (newFloorCount === currentMaze.value.numFloors) return
      
      if (newFloorCount > currentMaze.value.numFloors) {
        const defaultWidth = currentMaze.value.getFloorWidth(0)
        const defaultHeight = currentMaze.value.getFloorHeight(0)
        for (let f = currentMaze.value.numFloors; f < newFloorCount; f++) {
          currentMaze.value.floorData[f] = {
            width: defaultWidth,
            height: defaultHeight,
            cells: currentMaze.value.initializeCells(defaultWidth, defaultHeight)
          }
        }
      } else {
        currentMaze.value.floorData = currentMaze.value.floorData.slice(0, newFloorCount)
        if (currentFloor.value >= newFloorCount) {
          currentFloor.value = newFloorCount - 1
        }
      }
      
      currentMaze.value.numFloors = newFloorCount
      renderEditor()
    }
    
    const resizeCurrentFloor = () => {
      currentMaze.value.setFloorDimensions(currentFloor.value, mazeWidth.value, mazeHeight.value)
      nextTick(() => {
        ctx = editorCanvas.value.getContext('2d')
        renderEditor()
      })
    }
    
    const resizeMaze = () => {
      resizeCurrentFloor()
    }
    
    const resizeAllFloors = () => {
      for (let f = 0; f < currentMaze.value.numFloors; f++) {
        currentMaze.value.setFloorDimensions(f, mazeWidth.value, mazeHeight.value)
      }
      nextTick(() => {
        ctx = editorCanvas.value.getContext('2d')
        renderEditor()
      })
    }
    
    const clearMaze = () => {
      currentMaze.value = new Maze(mazeWidth.value, mazeHeight.value, selectedBiome.value)
      renderEditor()
    }
    
    const changeBiome = () => {
      currentMaze.value.biome = selectedBiome.value
      renderEditor()
    }
    
    const generateMaze = () => {
      const floor = currentFloor.value
      const floorWidth = currentFloorWidth.value
      const floorHeight = currentFloorHeight.value
      
      for (let y = 0; y < floorHeight; y++) {
        for (let x = 0; x < floorWidth; x++) {
          currentMaze.value.addWall(x, y, floor)
        }
      }
      
      // Carve passages using recursive backtracking
      const stack = []
      const startX = 1
      const startY = 1
      
      currentMaze.value.removeWall(startX, startY, floor)
      stack.push({ x: startX, y: startY })
      
      while (stack.length > 0) {
        const current = stack[stack.length - 1]
        const neighbors = []
        
        // Find unvisited neighbors
        const directions = [
          { x: 0, y: -2 }, // North
          { x: 2, y: 0 },  // East
          { x: 0, y: 2 },  // South
          { x: -2, y: 0 }  // West
        ]
        
        for (const dir of directions) {
          const newX = current.x + dir.x
          const newY = current.y + dir.y
          
          if (newX > 0 && newX < floorWidth - 1 && newY > 0 && newY < floorHeight - 1) {
            if (currentMaze.value.isWall(newX, newY, floor)) {
              neighbors.push({ x: newX, y: newY, wallX: current.x + dir.x / 2, wallY: current.y + dir.y / 2 })
            }
          }
        }
        
        if (neighbors.length > 0) {
          const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]
          currentMaze.value.removeWall(chosen.x, chosen.y, floor)
          currentMaze.value.removeWall(chosen.wallX, chosen.wallY, floor)
          stack.push({ x: chosen.x, y: chosen.y })
        } else {
          stack.pop()
        }
      }
      
      renderEditor()
    }
    
    const exportMaze = () => {
      const mazeData = currentMaze.value.toJSON()
      const dataStr = JSON.stringify(mazeData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = 'maze.json'
      link.click()
    }
    
    const importMaze = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const mazeData = JSON.parse(e.target.result)
          const importedMaze = Maze.fromJSON(mazeData)
          
          currentMaze.value = importedMaze
          mazeWidth.value = importedMaze.width
          mazeHeight.value = importedMaze.height
          
          // Update canvas size
          editorCanvas.value.width = importedMaze.width * cellSize
          editorCanvas.value.height = importedMaze.height * cellSize
          
          renderEditor()
        } catch (error) {
          alert('Error importing maze: Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    
    const applyChanges = () => {
      emit('maze-updated', currentMaze.value)
      emit('close')
    }
    
    onMounted(() => {
      initializeEditor()
    })
    
    watch(() => props.maze, () => {
      initializeEditor()
    })
    
    return {
      editorCanvas,
      fileInput,
      mazeWidth,
      mazeHeight,
      numFloors,
      currentFloor,
      selectedBiome,
      biomeOptions,
      editMode,
      cellSize,
      currentMaze,
      currentFloorWidth,
      currentFloorHeight,
      handleCanvasClick,
      handleCanvasHover,
      resizeMaze,
      resizeCurrentFloor,
      resizeAllFloors,
      updateFloors,
      changeBiome,
      clearMaze,
      generateMaze,
      exportMaze,
      importMaze,
      applyChanges
    }
  }
}
</script>

<style scoped>
.admin-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.admin-panel {
  background-color: #2a2a2a;
  border: 2px solid #555;
  border-radius: 8px;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #333;
  border-bottom: 1px solid #555;
}

.admin-header h2 {
  margin: 0;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #555;
  border-radius: 4px;
}

.admin-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.admin-controls {
  width: 300px;
  padding: 20px;
  background-color: #333;
  border-right: 1px solid #555;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 25px;
}

.control-group h3 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 16px;
}

.control-group label {
  display: block;
  margin: 8px 0;
  color: #ccc;
  font-size: 14px;
}

.control-group input[type="number"] {
  width: 60px;
  margin-left: 5px;
  padding: 4px;
  background-color: #444;
  border: 1px solid #666;
  color: #fff;
}

.control-group select {
  width: 100%;
  margin-top: 5px;
  padding: 6px;
  background-color: #444;
  border: 1px solid #666;
  color: #fff;
  font-family: inherit;
  cursor: pointer;
}

.control-group select option {
  background-color: #444;
  color: #fff;
}

.floor-info {
  margin: 10px 0;
  padding: 8px;
  background-color: #333;
  border-radius: 4px;
  font-size: 12px;
  color: #aaa;
  text-align: center;
}

.control-group input[type="radio"] {
  margin-right: 8px;
}

.door-options {
  margin-left: 20px;
  padding: 10px;
  background-color: #3a3a3a;
  border-radius: 4px;
  margin-top: 8px;
}

.door-options label {
  margin: 5px 0;
}

.door-options select {
  width: 100%;
  margin-top: 5px;
  padding: 4px;
  background-color: #444;
  border: 1px solid #666;
  color: #fff;
}

.door-options input[type="checkbox"] {
  margin-right: 8px;
}

.action-btn {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  background-color: #555;
  border: 1px solid #777;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
}

.action-btn:hover {
  background-color: #666;
}

.maze-editor {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.editor-canvas {
  border: 2px solid #555;
  cursor: crosshair;
  background-color: #000;
}

.admin-footer {
  padding: 15px 20px;
  background-color: #333;
  border-top: 1px solid #555;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.apply-btn, .cancel-btn {
  padding: 10px 20px;
  border: 1px solid #777;
  cursor: pointer;
  font-family: inherit;
}

.apply-btn {
  background-color: #4a7c59;
  color: #fff;
}

.apply-btn:hover {
  background-color: #5a8c69;
}

.cancel-btn {
  background-color: #666;
  color: #fff;
}

.cancel-btn:hover {
  background-color: #777;
}
</style>
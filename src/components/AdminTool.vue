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
                @change="resizeMaze"
              />
            </label>
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
            :width="currentMaze.width * cellSize"
            :height="currentMaze.height * cellSize"
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
import { ref, onMounted, watch, nextTick } from 'vue'
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
    const selectedBiome = ref(props.maze.biome || 'DUNGEON')
    const biomeOptions = ref(getBiomeNames())
    const editMode = ref('wall')
    const cellSize = 20
    const currentMaze = ref(new Maze(props.maze.width, props.maze.height, props.maze.biome || 'DUNGEON'))
    
    let ctx = null
    
    const initializeEditor = () => {
      ctx = editorCanvas.value.getContext('2d')
      
      // Copy current maze state
      currentMaze.value.cells = props.maze.cells.map(row => [...row])
      currentMaze.value.startPosition = { ...props.maze.startPosition }
      currentMaze.value.exitPosition = { ...props.maze.exitPosition }
      currentMaze.value.biome = props.maze.biome || 'DUNGEON'
      

      
      selectedBiome.value = currentMaze.value.biome
      
      renderEditor()
    }
    
    const renderEditor = () => {
      if (!ctx) return
      
      ctx.clearRect(0, 0, editorCanvas.value.width, editorCanvas.value.height)
      
      // Draw grid
      for (let y = 0; y < currentMaze.value.height; y++) {
        for (let x = 0; x < currentMaze.value.width; x++) {
          const screenX = x * cellSize
          const screenY = y * cellSize
          
          // Determine cell color
          let fillColor = '#333'
          if (currentMaze.value.isWall(x, y)) {
            fillColor = '#666'
          }
          
          // Highlight start and exit positions
          if (x === currentMaze.value.startPosition.x && y === currentMaze.value.startPosition.y) {
            fillColor = '#00ff00'
          } else if (x === currentMaze.value.exitPosition.x && y === currentMaze.value.exitPosition.y) {
            fillColor = '#ff0000'
          }
          
          ctx.fillStyle = fillColor
          ctx.fillRect(screenX, screenY, cellSize, cellSize)
          
          // Draw grid lines
          ctx.strokeStyle = '#555'
          ctx.strokeRect(screenX, screenY, cellSize, cellSize)
        }
      }
      

    }
    
    const handleCanvasClick = (event) => {
      const rect = editorCanvas.value.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top
      

      
      // Normal cell-based editing
      const x = Math.floor(clickX / cellSize)
      const y = Math.floor(clickY / cellSize)
      
      if (x < 0 || x >= currentMaze.value.width || y < 0 || y >= currentMaze.value.height) {
        return
      }
      
      switch (editMode.value) {
        case 'wall':
          currentMaze.value.addWall(x, y)
          break
        case 'empty':
          currentMaze.value.removeWall(x, y)
          break
        case 'start':
          currentMaze.value.startPosition = { x, y }
          break
        case 'exit':
          currentMaze.value.exitPosition = { x, y }
          break
      }
      
      renderEditor()
    }
    
    const handleCanvasHover = (event) => {
      // Add visual feedback for hover (optional)
    }
    
    const resizeMaze = () => {
      const newMaze = new Maze(mazeWidth.value, mazeHeight.value, currentMaze.value.biome)
      
      // Copy existing cells that fit
      for (let y = 0; y < Math.min(currentMaze.value.height, newMaze.height); y++) {
        for (let x = 0; x < Math.min(currentMaze.value.width, newMaze.width); x++) {
          newMaze.cells[y][x] = currentMaze.value.cells[y][x]
        }
      }
      
      // Adjust start and exit positions if they're out of bounds
      if (currentMaze.value.startPosition.x >= newMaze.width || currentMaze.value.startPosition.y >= newMaze.height) {
        newMaze.startPosition = { x: 1, y: 1 }
      } else {
        newMaze.startPosition = currentMaze.value.startPosition
      }
      
      if (currentMaze.value.exitPosition.x >= newMaze.width || currentMaze.value.exitPosition.y >= newMaze.height) {
        newMaze.exitPosition = { x: newMaze.width - 2, y: newMaze.height - 2 }
      } else {
        newMaze.exitPosition = currentMaze.value.exitPosition
      }
      
      currentMaze.value = newMaze
      
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
      // Simple maze generation algorithm
      const maze = new Maze(mazeWidth.value, mazeHeight.value, selectedBiome.value)
      
      // Fill with walls
      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          maze.cells[y][x] = 1
        }
      }
      
      // Carve passages using recursive backtracking
      const stack = []
      const startX = 1
      const startY = 1
      
      maze.removeWall(startX, startY)
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
          
          if (newX > 0 && newX < maze.width - 1 && newY > 0 && newY < maze.height - 1) {
            if (maze.isWall(newX, newY)) {
              neighbors.push({ x: newX, y: newY, wallX: current.x + dir.x / 2, wallY: current.y + dir.y / 2 })
            }
          }
        }
        
        if (neighbors.length > 0) {
          const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]
          maze.removeWall(chosen.x, chosen.y)
          maze.removeWall(chosen.wallX, chosen.wallY)
          stack.push({ x: chosen.x, y: chosen.y })
        } else {
          stack.pop()
        }
      }
      
      currentMaze.value = maze
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
      selectedBiome,
      biomeOptions,
      editMode,
      cellSize,
      currentMaze,
      handleCanvasClick,
      handleCanvasHover,
      resizeMaze,
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

.control-group input[type="radio"] {
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
<template>
  <div class="admin-overlay">
    <div class="admin-panel">
      <div class="admin-header">
        <h2>Maze Editor</h2>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <div class="toolbar">
        <div class="toolbar-section">
          <label class="toolbar-label">Tools</label>
          <div class="tool-buttons-group">
            <button 
              @click="editMode = 'wall'" 
              :class="{ active: editMode === 'wall' }"
              class="tool-btn"
              title="Paint Brush"
            >
              <div class="tool-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 21q-1.125 0-2.225-.55T2 19q.65 0 1.325-.513T4 17q0-1.25.875-2.125T7 14t2.125.875T10 17q0 1.65-1.175 2.825T6 21m5.75-6L9 12.25l8.95-8.95q.275-.275.688-.288t.712.288l1.35 1.35q.3.3.3.7t-.3.7z"/>
                </svg>
              </div>
              <div class="tool-label">Brush</div>
            </button>
            <button 
              @click="editMode = 'empty'" 
              :class="{ active: editMode === 'empty' }"
              class="tool-btn"
              title="Eraser"
            >
              <div class="tool-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17.25 18H21q.425 0 .713.288T22 19t-.288.713T21 20h-5.75zM5.175 20q-.2 0-.388-.075T4.45 19.7l-1.825-1.825q-.575-.575-.588-1.425T2.6 15l11-11.4q.575-.6 1.412-.6t1.413.575L21.4 8.55q.575.575.575 1.425T21.4 11.4l-8.1 8.3q-.15.15-.337.225t-.388.075z"/>
                </svg>
              </div>
              <div class="tool-label">Eraser</div>
            </button>
            <button 
              @click="editMode = 'pan'" 
              :class="{ active: editMode === 'pan' }"
              class="tool-btn"
              title="Pan Tool (Ctrl to hold temporarily)"
            >
              <div class="tool-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="m12 22l-4.25-4.25l1.425-1.425L11 18.15V13H5.875L7.7 14.8l-1.45 1.45L2 12l4.225-4.225L7.65 9.2L5.85 11H11V5.85L9.175 7.675L7.75 6.25L12 2l4.25 4.25l-1.425 1.425L13 5.85V11h5.125L16.3 9.2l1.45-1.45L22 12l-4.25 4.25l-1.425-1.425L18.15 13H13v5.125l1.8-1.825l1.45 1.45z"/>
                </svg>
              </div>
              <div class="tool-label">Pan</div>
            </button>
          </div>
        </div>

        <div class="toolbar-section">
          <label class="toolbar-label">View</label>
          <div class="zoom-controls">
            <button @click="zoomOut" class="zoom-btn" title="Zoom Out">−</button>
            <input 
              v-model.number="zoomPercent" 
              @change="setZoomFromPercent"
              type="number"
              min="10"
              max="500"
              class="zoom-input"
              title="Zoom percentage"
            />
            <button @click="zoomIn" class="zoom-btn" title="Zoom In">+</button>
            <button @click="resetView" class="zoom-btn" title="Reset View">⟲</button>
          </div>
        </div>

        <div class="toolbar-section">
          <label class="toolbar-label">History</label>
          <div class="history-controls">
            <button 
              @click="performUndo" 
              :disabled="!canUndo"
              class="history-btn" 
              title="Undo (Ctrl+Z)"
            >↶</button>
            <button 
              @click="performRedo" 
              :disabled="!canRedo"
              class="history-btn" 
              title="Redo (Ctrl+Shift+Z)"
            >↷</button>
          </div>
        </div>

        <div class="toolbar-section">
          <label class="toolbar-label">Palette</label>
          <div class="tool-buttons-group">
            <button 
              @click="editMode = 'wall'" 
              :class="{ active: editMode === 'wall' }"
              class="palette-btn wall-btn"
              title="Wall"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm0 2h16m0 4H4m0 4h16M9 4v4m5 0v4m-6 0v4m8-4v4m-5 0v4"/>
                </svg>
              </div>
              <div class="palette-label">Wall</div>
            </button>
            <button 
              @click="editMode = 'slippery'" 
              :class="{ active: editMode === 'slippery' }"
              class="palette-btn slippery-btn"
              title="Slippery Tile"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="m20.79 13.95l-2.33.62l-2-1.13v-2.88l2-1.13l2.33.62l.52-1.93l-1.77-.47l.46-1.77l-1.93-.52l-.62 2.33l-2 1.13L13 7.38V5.12l1.71-1.71L13.29 2L12 3.29L10.71 2L9.29 3.41L11 5.12v2.26L8.5 8.82l-2-1.13l-.58-2.33L4 5.88l.47 1.77l-1.77.47l.52 1.93l2.33-.62l2 1.13v2.89l-2 1.13l-2.33-.62l-.52 1.93l1.77.47L4 18.12l1.93.52l.62-2.33l2-1.13L11 16.62v2.26l-1.71 1.71L10.71 22L12 20.71L13.29 22l1.41-1.41l-1.7-1.71v-2.26l2.5-1.45l2 1.13l.62 2.33l1.88-.51l-.47-1.77l1.77-.47zM9.5 10.56L12 9.11l2.5 1.45v2.88L12 14.89l-2.5-1.45z"/>
                </svg>
              </div>
              <div class="palette-label">Ice</div>
            </button>
            <button 
              @click="editMode = 'door'" 
              :class="{ active: editMode === 'door' }"
              class="palette-btn door-btn"
              title="Door"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M9 13q.425 0 .713-.288T10 12t-.288-.712T9 11t-.712.288T8 12t.288.713T9 13m6 0q.425 0 .713-.288T16 12t-.288-.712T15 11t-.712.288T14 12t.288.713T15 13M3 21v-2h1V3h7.5v16h1V3H20v16h1v2z"/>
                </svg>
              </div>
              <div class="palette-label">Door</div>
            </button>
            <button 
              @click="editMode = 'start'" 
              :class="{ active: editMode === 'start' }"
              class="palette-btn start-btn"
              title="Start Position"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
                </svg>
              </div>
              <div class="palette-label">Start</div>
            </button>
            <button 
              @click="editMode = 'exit'" 
              :class="{ active: editMode === 'exit' }"
              class="palette-btn exit-btn"
              title="Exit Position"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 14v6q0 .425-.288.713T6 21t-.712-.288T5 20V5q0-.425.288-.712T6 4h7.175q.35 0 .625.225t.35.575L14.4 6H19q.425 0 .713.288T20 7v8q0 .425-.288.713T19 16h-5.175q-.35 0-.625-.225t-.35-.575L12.6 14z"/>
                </svg>
              </div>
              <div class="palette-label">Exit</div>
            </button>
            <button 
              @click="editMode = 'stairsUp'" 
              :class="{ active: editMode === 'stairsUp' }"
              class="palette-btn stairs-up-btn"
              title="Stairs Up"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M15 6h7v3h-4v4h-4v4h-4v4H3v-3h4v-4h4v-4h4zm-4.83.66l-5.51 5.51l-1.83-1.83l5.51-5.51L6.5 3H12v5.5z"/>
                </svg>
              </div>
              <div class="palette-label">Up</div>
            </button>
            <button 
              @click="editMode = 'stairsDown'" 
              :class="{ active: editMode === 'stairsDown' }"
              class="palette-btn stairs-down-btn"
              title="Stairs Down"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M15 6h7v3h-4v4h-4v4h-4v4H3v-3h4v-4h4v-4h4zM4.83 8.34l5.51-5.51l1.83 1.83l-5.51 5.51L8.5 12H3V6.5z"/>
                </svg>
              </div>
              <div class="palette-label">Down</div>
            </button>
          </div>
        </div>

        <div v-if="editMode === 'door' || editMode === 'removeDoor'" class="toolbar-section">
          <label v-if="editMode === 'door'" class="toolbar-checkbox">
            <input v-model="doorLocked" type="checkbox" /> Locked
          </label>
        </div>

        <div class="toolbar-section">
          <label class="toolbar-label">Width</label>
          <input 
            v-model.number="mazeWidth" 
            type="number" 
            min="5" 
            max="30"
            @change="resizeMaze"
            class="toolbar-input"
          />
        </div>

        <div class="toolbar-section">
          <label class="toolbar-label">Height</label>
          <input 
            v-model.number="mazeHeight" 
            type="number" 
            min="5" 
            max="30"
            @change="resizeCurrentFloor"
            class="toolbar-input"
          />
        </div>

        <div class="toolbar-section">
          <label class="toolbar-label">Biome</label>
          <select v-model="selectedBiome" @change="changeBiome" class="toolbar-select">
            <option v-for="biome in biomeOptions" :key="biome" :value="biome">
              {{ biome.replace(/_/g, ' ') }}
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="toolbar-section toolbar-actions">
          <button @click="clearMaze" class="toolbar-action-btn" title="Clear All">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4"/>
            </svg>
          </button>
          <button @click="generateMaze" class="toolbar-action-btn" title="Generate Random Maze">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                <path d="M19.5 3.75H21a1.5 1.5 0 0 1 1.5 1.5v16.5a1.5 1.5 0 0 1-1.5 1.5h-7.5m-3 0v-6h-3v-4.5h3v-6h3v-6"/>
                <path d="m10.5 3.718l3-2.968l3 2.968M15 15.75v4.5M6.75 3.75H3a1.5 1.5 0 0 0-1.5 1.5v16.5a1.5 1.5 0 0 0 1.5 1.5h4.5v-3h-3V18M18 23.25v-9h1.5m3-3H15v1.5"/>
                <path d="M4.5 7.5v2.25h2.25M18 11.25v-3"/>
              </g>
            </svg>
          </button>
          <button @click="exportMaze" class="toolbar-action-btn" title="Export JSON">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
              <path fill="currentColor" d="M220 112v96a20 20 0 0 1-20 20H56a20 20 0 0 1-20-20v-96a20 20 0 0 1 20-20h20a12 12 0 0 1 0 24H60v88h136v-88h-16a12 12 0 0 1 0-24h20a20 20 0 0 1 20 20M96.49 72.49L116 53v83a12 12 0 0 0 24 0V53l19.51 19.52a12 12 0 1 0 17-17l-40-40a12 12 0 0 0-17 0l-40 40a12 12 0 1 0 17 17Z"/>
            </svg>
          </button>
          <input 
            ref="fileInput"
            type="file" 
            accept=".json"
            @change="importMaze"
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="toolbar-action-btn" title="Import JSON">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 14a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 0-2 0v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4a1 1 0 0 0-1-1m-9.71 1.71a1 1 0 0 0 .33.21a.94.94 0 0 0 .76 0a1 1 0 0 0 .33-.21l4-4a1 1 0 0 0-1.42-1.42L13 12.59V3a1 1 0 0 0-2 0v9.59l-2.29-2.3a1 1 0 1 0-1.42 1.42Z"/>
            </svg>
          </button>
          <button @click="exportCode" class="toolbar-action-btn" title="Export Code">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2a2 2 0 0 0 2-2V5h2V3m6 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3z"/>
            </svg>
          </button>
          <button @click="importCode" class="toolbar-action-btn" title="Import Code">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.89 3L14.85 3.4L11.11 21L9.15 20.6L12.89 3M19.59 12L16 8.41V5.58L22.42 12L16 18.41V15.58L19.59 12M1.58 12L8 5.58V8.41L4.41 12L8 15.58V18.41L1.58 12Z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="admin-content">
        <div 
          class="maze-editor" 
          ref="mazeEditorContainer"
          :class="{ 'cursor-pan': editMode === 'pan' || isPanning || tempPanMode }"
          @mousedown="handleContainerMouseDown"
          @mousemove="handleContainerMouseMove"
          @mouseup="handleContainerMouseUp"
          @mouseleave="handleContainerMouseUp"
          @wheel="handleCanvasWheel"
        >
          <canvas 
            ref="editorCanvas"
            :width="currentFloorWidth * cellSize"
            :height="currentFloorHeight * cellSize"
            @mousedown="handleCanvasMouseDown"
            @mousemove="handleCanvasMouseMove"
            @mouseup="handleCanvasMouseUp"
            @mouseleave="handleCanvasMouseLeave"
            :class="['editor-canvas', { 'cursor-pan': editMode === 'pan' || isPanning || tempPanMode }]"
            :style="canvasStyle"
          ></canvas>
        </div>

        <div class="floors-panel">
          <div class="floors-list" ref="floorsListContainer">
            <transition-group name="floor" tag="div" class="floors-transition-group">
              <div 
                v-for="index in numFloors" 
                :key="numFloors - index"
                @click="currentFloor = numFloors - index"
                :class="['floor-item', { active: currentFloor === numFloors - index }]"
              >
                <canvas 
                  :ref="el => floorCanvases[numFloors - index] = el"
                  class="floor-preview"
                  :width="currentMaze.getFloorWidth(numFloors - index) * 4"
                  :height="currentMaze.getFloorHeight(numFloors - index) * 4"
                ></canvas>
                <div class="floor-label">Floor {{ numFloors - index + 1 }}</div>
              </div>
            </transition-group>
          </div>
          <button @click="addFloor" class="add-floor-btn" title="Add Floor">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1m9-2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
            </svg>
            Add Floor
          </button>
        </div>
      </div>
      
      <div class="admin-footer">
        <button @click="applyChanges" class="apply-btn">Apply Changes</button>
        <button @click="$emit('close')" class="cancel-btn">Cancel</button>
      </div>
    </div>
    
    <!-- Code Modal -->
    <div v-if="showCodeModal" class="code-modal-overlay" @click="showCodeModal = false">
      <div class="code-modal" @click.stop>
        <div class="code-modal-header">
          <h3>{{ codeText ? 'Export Code' : 'Import Code' }}</h3>
          <button @click="showCodeModal = false" class="code-modal-close">×</button>
        </div>
        <div class="code-modal-content">
          <div v-if="codeText" class="code-export-section">
            <p class="code-instructions">Copy this code and share it with others:</p>
            <textarea 
              v-model="codeText" 
              readonly 
              class="code-textarea"
              @click="$event.target.select()"
            ></textarea>
            <button @click="copyCodeToClipboard" class="code-copy-btn">Copy to Clipboard</button>
          </div>
          <div v-else class="code-import-section">
            <p class="code-instructions">Paste a maze code to import:</p>
            <textarea 
              v-model="codeInputText" 
              class="code-textarea"
              placeholder="Paste code here..."
            ></textarea>
            <button @click="applyCodeImport" class="code-import-btn" :disabled="!codeInputText.trim()">Import Maze</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { Maze } from '../game/GameEngine.js'
import { getBiomeNames } from '../game/TextureManager.js'

// Command Pattern for Undo/Redo
class Command {
  execute() {}
  undo() {}
}

class SetCellCommand extends Command {
  constructor(maze, x, y, floor, oldValue, newValue) {
    super()
    this.maze = maze
    this.x = x
    this.y = y
    this.floor = floor
    this.oldValue = oldValue
    this.newValue = newValue
  }
  
  execute() {
    this.maze.setFloorCell(this.x, this.y, this.floor, this.newValue)
  }
  
  undo() {
    this.maze.setFloorCell(this.x, this.y, this.floor, this.oldValue)
  }
}

class BatchCellCommand extends Command {
  constructor(maze, cells) {
    super()
    this.maze = maze
    this.cells = cells
  }
  
  execute() {
    this.cells.forEach(cell => {
      this.maze.setFloorCell(cell.x, cell.y, cell.floor, cell.newValue)
    })
  }
  
  undo() {
    this.cells.forEach(cell => {
      this.maze.setFloorCell(cell.x, cell.y, cell.floor, cell.oldValue)
    })
  }
}

class AddFloorCommand extends Command {
  constructor(maze, floorIndex, width, height) {
    super()
    this.maze = maze
    this.floorIndex = floorIndex
    this.width = width
    this.height = height
    this.floorData = null
  }
  
  execute() {
    if (this.floorData) {
      this.maze.floorData[this.floorIndex] = this.floorData
      this.maze.numFloors = this.maze.floorData.length
    } else {
      const newFloor = {
        width: this.width,
        height: this.height,
        cells: Array(this.height).fill(null).map(() => Array(this.width).fill(0))
      }
      this.maze.floorData.push(newFloor)
      this.maze.numFloors = this.maze.floorData.length
      this.floorData = newFloor
    }
  }
  
  undo() {
    this.maze.floorData.pop()
    this.maze.numFloors = this.maze.floorData.length
  }
}

class RemoveFloorCommand extends Command {
  constructor(maze, floorIndex) {
    super()
    this.maze = maze
    this.floorIndex = floorIndex
    this.floorData = null
    this.stairs = []
    this.doors = []
  }
  
  execute() {
    this.floorData = this.maze.floorData[this.floorIndex]
    
    this.stairs = []
    this.maze.stairs.forEach((value, key) => {
      const [x, y, floor] = key.split(',').map(Number)
      if (floor === this.floorIndex) {
        this.stairs.push({ key, value })
      }
    })
    
    this.doors = []
    this.maze.doorManager.doors.forEach((value, key) => {
      const [x, y, floor] = key.split(',').map(Number)
      if (floor === this.floorIndex) {
        this.doors.push({ key, value })
      }
    })
    
    this.maze.floorData.splice(this.floorIndex, 1)
    this.maze.numFloors = this.maze.floorData.length
    
    this.stairs.forEach(({ key }) => this.maze.stairs.delete(key))
    
    this.doors.forEach(({ key }) => this.maze.doorManager.doors.delete(key))
  }
  
  undo() {
    this.maze.floorData.splice(this.floorIndex, 0, this.floorData)
    this.maze.numFloors = this.maze.floorData.length
    
    this.stairs.forEach(({ key, value }) => this.maze.stairs.set(key, value))
    
    this.doors.forEach(({ key, value }) => this.maze.doorManager.doors.set(key, value))
  }
}

class ResizeFloorCommand extends Command {
  constructor(maze, floor, oldWidth, oldHeight, newWidth, newHeight) {
    super()
    this.maze = maze
    this.floor = floor
    this.oldWidth = oldWidth
    this.oldHeight = oldHeight
    this.newWidth = newWidth
    this.newHeight = newHeight
    this.oldCells = null
  }
  
  execute() {
    if (!this.oldCells) {
      this.oldCells = this.maze.floorData[this.floor].cells.map(row => [...row])
    }
    
    const floorData = this.maze.floorData[this.floor]
    const newCells = Array(this.newHeight).fill(null).map(() => Array(this.newWidth).fill(0))
    
    for (let y = 0; y < Math.min(this.oldHeight, this.newHeight); y++) {
      for (let x = 0; x < Math.min(this.oldWidth, this.newWidth); x++) {
        newCells[y][x] = this.oldCells[y][x]
      }
    }
    
    floorData.width = this.newWidth
    floorData.height = this.newHeight
    floorData.cells = newCells
  }
  
  undo() {
    const floorData = this.maze.floorData[this.floor]
    floorData.width = this.oldWidth
    floorData.height = this.oldHeight
    floorData.cells = this.oldCells
  }
}

class AddDoorCommand extends Command {
  constructor(maze, x, y, floor, edge, options) {
    super()
    this.maze = maze
    this.x = x
    this.y = y
    this.floor = floor
    this.edge = edge
    this.options = options
    this.hadDoor = false
    this.oldDoorData = null
    
    const edgeNames = ['North', 'East', 'South', 'West']
    const lockStatus = options.locked ? 'Locked' : 'Unlocked'
    this.description = `Add ${lockStatus} Door at (${x}, ${y}) ${edgeNames[edge]}`
  }
  
  execute() {
    const key = `${this.x},${this.y},${this.floor},${this.edge}`
    const doorData = this.maze.doorManager.doors.get(key)
    
    if (doorData) {
      this.hadDoor = true
      this.oldDoorData = doorData
    }
    
    this.maze.addDoor(this.x, this.y, this.floor, this.edge, this.options)
  }
  
  undo() {
    const key = `${this.x},${this.y},${this.floor},${this.edge}`
    
    if (this.hadDoor && this.oldDoorData) {
      this.maze.doorManager.doors.set(key, this.oldDoorData)
    } else {
      this.maze.doorManager.doors.delete(key)
    }
  }
}

class RemoveDoorCommand extends Command {
  constructor(maze, x, y, floor, edge) {
    super()
    this.maze = maze
    this.x = x
    this.y = y
    this.floor = floor
    this.edge = edge
    this.doorData = null
    
    const edgeNames = ['North', 'East', 'South', 'West']
    this.description = `Remove Door at (${x}, ${y}) ${edgeNames[edge]}`
  }
  
  execute() {
    const key = `${this.x},${this.y},${this.floor},${this.edge}`
    this.doorData = this.maze.doorManager.doors.get(key)
    this.maze.removeDoor(this.x, this.y, this.floor, this.edge)
  }
  
  undo() {
    if (this.doorData) {
      const key = `${this.x},${this.y},${this.floor},${this.edge}`
      this.maze.doorManager.doors.set(key, this.doorData)
    }
  }
}

class BatchDoorCommand extends Command {
  constructor(maze, doors) {
    super()
    this.maze = maze
    this.doors = doors
    
    const isRemoving = doors.length > 0 && doors[0].action === 'remove'
    const action = isRemoving ? 'Remove' : 'Add'
    this.description = `${action} ${doors.length} door${doors.length !== 1 ? 's' : ''}`
  }
  
  execute() {
    this.doors.forEach(door => {
      if (door.action === 'add') {
        this.maze.addDoor(door.x, door.y, door.floor, door.edge, door.options)
      } else if (door.action === 'remove') {
        this.maze.removeDoor(door.x, door.y, door.floor, door.edge)
      }
    })
  }
  
  undo() {
    this.doors.forEach(door => {
      const key = `${door.x},${door.y},${door.floor},${door.edge}`
      
      if (door.action === 'add') {
        if (door.hadDoor && door.oldDoorData) {
          this.maze.doorManager.doors.set(key, door.oldDoorData)
        } else {
          this.maze.doorManager.doors.delete(key)
        }
      } else if (door.action === 'remove') {
        if (door.oldDoorData) {
          this.maze.doorManager.doors.set(key, door.oldDoorData)
        }
      }
    })
  }
}

class CommandHistory {
  constructor(maxSize = 50) {
    this.undoStack = []
    this.redoStack = []
    this.maxSize = maxSize
  }
  
  execute(command) {
    command.execute()
    this.undoStack.push(command)
    
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift()
    }
    
    this.redoStack = []
  }
  
  undo() {
    if (this.undoStack.length === 0) return false
    
    const command = this.undoStack.pop()
    command.undo()
    this.redoStack.push(command)
    
    return true
  }
  
  redo() {
    if (this.redoStack.length === 0) return false
    
    const command = this.redoStack.pop()
    command.execute()
    this.undoStack.push(command)
    
    return true
  }
  
  canUndo() {
    return this.undoStack.length > 0
  }
  
  canRedo() {
    return this.redoStack.length > 0
  }
  
  clear() {
    this.undoStack = []
    this.redoStack = []
  }
}

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
    const mazeEditorContainer = ref(null)
    
    const mazeWidth = ref(props.maze.width)
    const mazeHeight = ref(props.maze.height)
    const numFloors = ref(props.maze.numFloors || 1)
    const currentFloor = ref(0)
    const selectedBiome = ref(props.maze.biome || 'DUNGEON')
    const biomeOptions = ref(getBiomeNames())
    const editMode = ref('wall')
    const doorLocked = ref(false)
    const cellSize = 20
    const currentMaze = ref(new Maze(props.maze.width, props.maze.height, props.maze.biome || 'DUNGEON', props.maze.numFloors || 1))
    
    // Command history for undo/redo
    const commandHistory = new CommandHistory(50)
    const batchedCells = []
    const batchedDoors = []
    let isBatchingCommands = false
    const canUndo = ref(false)
    const canRedo = ref(false)
    
    const updateHistoryState = () => {
      canUndo.value = commandHistory.canUndo()
      canRedo.value = commandHistory.canRedo()
    }
    
    const executeCommand = (command) => {
      commandHistory.execute(command)
      updateHistoryState()
    }
    
    const zoom = ref(1)
    const panX = ref(0)
    const panY = ref(0)
    const isPanning = ref(false)
    const lastPanX = ref(0)
    const lastPanY = ref(0)
    const tempPanMode = ref(false)
    
    const previewCell = ref(null) // { x, y, floor }
    
    const floorCanvases = ref([])
    const floorsListContainer = ref(null)
    const floorPreviewSize = 4
    
    const showCodeModal = ref(false)
    const codeText = ref('')
    const codeInputText = ref('')
    
    const zoomPercent = computed({
      get: () => Math.round(zoom.value * 100),
      set: (val) => {
        zoom.value = val / 100
      }
    })
    
    let ctx = null
    let isDrawing = false
    let lastPaintedCell = null
    let lastPaintedCoords = null // Track actual x,y for line interpolation
    let rafId = null
    let resizeDebounceTimer = null
    
    const currentFloorWidth = computed(() => currentMaze.value.getFloorWidth(currentFloor.value))
    const currentFloorHeight = computed(() => currentMaze.value.getFloorHeight(currentFloor.value))
    
    const canvasStyle = computed(() => ({
      transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
      transformOrigin: '0 0'
    }))
    
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
      nextTick(() => {
        updateAllFloorPreviews()
      })
    }
    
    const renderEditor = () => {
      if (!editorCanvas.value) return
      ctx = editorCanvas.value.getContext('2d')
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
          const cellType = currentMaze.value.getCellType(x, y, floor)
          let fillColor = '#333'
          if (cellType === 1) {
            // Wall
            fillColor = '#666'
          } else if (cellType === 2) {
            // Slippery tile
            fillColor = '#0088aa'
          }
          
          if (currentMaze.value.hasStairs(x, y, floor)) {
            const stairs = currentMaze.value.getStairs(x, y, floor)
            fillColor = stairs.targetFloor > floor ? '#00aaff' : '#ff8800' // Blue for up, Orange for down
          }
          
          if (x === currentMaze.value.startPosition.x && y === currentMaze.value.startPosition.y && floor === currentMaze.value.startPosition.floor) {
            fillColor = '#00ff00'
          } else if (x === currentMaze.value.exitPosition.x && y === currentMaze.value.exitPosition.y && floor === currentMaze.value.exitPosition.floor) {
            fillColor = '#ff0000'
          }
          
          ctx.fillStyle = fillColor
          ctx.fillRect(screenX, screenY, cellSize, cellSize)
          
          if (cellType === 2) {
            ctx.strokeStyle = '#00ccff'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(screenX + cellSize * 0.2, screenY + cellSize * 0.5)
            ctx.lineTo(screenX + cellSize * 0.8, screenY + cellSize * 0.5)
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.2)
            ctx.lineTo(screenX + cellSize * 0.5, screenY + cellSize * 0.8)
            ctx.stroke()
          }
          
          // Draw grid lines
          ctx.strokeStyle = '#555'
          ctx.lineWidth = 1
          ctx.strokeRect(screenX + 0.5, screenY + 0.5, cellSize - 1, cellSize - 1)
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

      if (previewCell.value && previewCell.value.floor === floor && editMode.value !== 'pan' && !isPanning.value) {
        const px = previewCell.value.x
        const py = previewCell.value.y
        const screenX = px * cellSize
        const screenY = py * cellSize
        
        ctx.save()
        ctx.globalAlpha = 0.5
        
        switch (editMode.value) {
          case 'wall':
            ctx.fillStyle = '#999'
            ctx.fillRect(screenX, screenY, cellSize, cellSize)
            break
          case 'empty':
            ctx.fillStyle = '#222'
            ctx.fillRect(screenX, screenY, cellSize, cellSize)
            ctx.strokeStyle = '#ff0000'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(screenX + 3, screenY + 3)
            ctx.lineTo(screenX + cellSize - 3, screenY + cellSize - 3)
            ctx.moveTo(screenX + cellSize - 3, screenY + 3)
            ctx.lineTo(screenX + 3, screenY + cellSize - 3)
            ctx.stroke()
            break
          case 'slippery':
            ctx.fillStyle = '#00ccff'
            ctx.fillRect(screenX, screenY, cellSize, cellSize)
            ctx.globalAlpha = 1
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(screenX + cellSize * 0.2, screenY + cellSize * 0.5)
            ctx.lineTo(screenX + cellSize * 0.8, screenY + cellSize * 0.5)
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.2)
            ctx.lineTo(screenX + cellSize * 0.5, screenY + cellSize * 0.8)
            ctx.stroke()
            break
          case 'start':
            ctx.fillStyle = '#00ff00'
            ctx.fillRect(screenX, screenY, cellSize, cellSize)
            break
          case 'exit':
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(screenX, screenY, cellSize, cellSize)
            break
          case 'stairsUp':
            ctx.fillStyle = '#00aaff'
            ctx.fillRect(screenX, screenY, cellSize, cellSize)
            ctx.globalAlpha = 1
            ctx.strokeStyle = '#ffffff'
            ctx.fillStyle = '#ffffff'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.3)
            ctx.lineTo(screenX + cellSize * 0.3, screenY + cellSize * 0.5)
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.3)
            ctx.lineTo(screenX + cellSize * 0.7, screenY + cellSize * 0.5)
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.3)
            ctx.lineTo(screenX + cellSize * 0.5, screenY + cellSize * 0.7)
            ctx.stroke()
            break
          case 'stairsDown':
            ctx.fillStyle = '#ff8800'
            ctx.fillRect(screenX, screenY, cellSize, cellSize)
            ctx.globalAlpha = 1
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.7)
            ctx.lineTo(screenX + cellSize * 0.3, screenY + cellSize * 0.5)
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.7)
            ctx.lineTo(screenX + cellSize * 0.7, screenY + cellSize * 0.5)
            ctx.moveTo(screenX + cellSize * 0.5, screenY + cellSize * 0.3)
            ctx.lineTo(screenX + cellSize * 0.5, screenY + cellSize * 0.7)
            ctx.stroke()
            break
          case 'door':
            ctx.globalAlpha = 1
            ctx.strokeStyle = doorLocked.value ? '#ff6666' : '#ffcc66'
            ctx.lineWidth = 4
            ctx.beginPath()
            
            const previewEdge = previewCell.value.edge !== undefined ? previewCell.value.edge : 0
            
            switch(previewEdge) {
              case 0: // North edge
                ctx.moveTo(screenX, screenY)
                ctx.lineTo(screenX + cellSize, screenY)
                break
              case 1: // East edge
                ctx.moveTo(screenX + cellSize, screenY)
                ctx.lineTo(screenX + cellSize, screenY + cellSize)
                break
              case 2: // South edge
                ctx.moveTo(screenX, screenY + cellSize)
                ctx.lineTo(screenX + cellSize, screenY + cellSize)
                break
              case 3: // West edge
                ctx.moveTo(screenX, screenY)
                ctx.lineTo(screenX, screenY + cellSize)
                break
            }
            
            ctx.stroke()
            break
        }
        
        ctx.restore()
      }
    }
    
    const paintCell = (x, y, floor, edgeOverride = null) => {
      if (floor < 0 || floor >= currentMaze.value.numFloors) {
        console.warn(`Invalid floor: ${floor}`)
        return false
      }
      
      const singleClickModes = ['start', 'exit', 'door', 'removeDoor']
      const isSingleClickMode = singleClickModes.includes(editMode.value)
      
      // Check if we already painted this cell (skip for single-click operations)
      const cellKey = `${x},${y}`
      if (!isSingleClickMode && lastPaintedCell === cellKey) {
        return false
      }
      
      let didPaint = false
      
      const effectiveEdge = edgeOverride !== null ? edgeOverride : 0
      
      const oldValue = currentMaze.value.getFloorCell(x, y, floor)
      let newValue = oldValue
      

      switch (editMode.value) {
        case 'wall':
          newValue = 1
          break
        case 'empty':
          currentMaze.value.removeStairs(x, y, floor)
          newValue = 0
          break
        case 'slippery':
          newValue = 2
          break
        case 'removeSlippery':
          newValue = 0
          break
        case 'stairsUp':
          if (floor < currentMaze.value.numFloors - 1) {
            currentMaze.value.addStairs(x, y, floor, floor + 1, x, y)
            newValue = 0 
          }
          didPaint = true
          break
        case 'stairsDown':
          if (floor > 0) {
            currentMaze.value.addStairs(x, y, floor, floor - 1, x, y)
            newValue = 0
          }
          didPaint = true
          break
        case 'start':
          currentMaze.value.startPosition = { x, y, floor }
          didPaint = true
          break
        case 'exit':
          currentMaze.value.exitPosition = { x, y, floor }
          didPaint = true
          break
        case 'door':
          if (isBatchingCommands) {
            const key = `${x},${y},${floor},${effectiveEdge}`
            
            const alreadyBatched = batchedDoors.some(d => 
              d.x === x && d.y === y && d.floor === floor && d.edge === effectiveEdge
            )
            
            if (!alreadyBatched) {
              const oldDoorData = currentMaze.value.doorManager.doors.get(key)
              const hadDoor = !!oldDoorData
              
              currentMaze.value.addDoor(x, y, floor, effectiveEdge, {
                locked: doorLocked.value,
                showOnMinimap: true
              })
              
              batchedDoors.push({
                action: 'add',
                x, y, floor,
                edge: effectiveEdge,
                options: { locked: doorLocked.value, showOnMinimap: true },
                hadDoor,
                oldDoorData
              })
            }
          } else {
            const addDoorCommand = new AddDoorCommand(
              currentMaze.value, 
              x, y, floor, 
              effectiveEdge, 
              { locked: doorLocked.value, showOnMinimap: true }
            )
            executeCommand(addDoorCommand)
          }
          didPaint = true
          break
        case 'removeDoor':
          if (isBatchingCommands) {
            const key = `${x},${y},${floor},${effectiveEdge}`
            
            // Check if we already removed a door here during this drag
            const alreadyBatched = batchedDoors.some(d => 
              d.x === x && d.y === y && d.floor === floor && d.edge === effectiveEdge
            )
            
            if (!alreadyBatched) {
              const oldDoorData = currentMaze.value.doorManager.doors.get(key)
              
              currentMaze.value.removeDoor(x, y, floor, effectiveEdge)
              
              batchedDoors.push({
                action: 'remove',
                x, y, floor,
                edge: effectiveEdge,
                oldDoorData
              })
            }
          } else {
            const removeDoorCommand = new RemoveDoorCommand(
              currentMaze.value, 
              x, y, floor, 
              effectiveEdge
            )
            executeCommand(removeDoorCommand)
          }
          didPaint = true
          break
      }
      
      if (oldValue !== newValue && !['start', 'exit', 'door', 'removeDoor'].includes(editMode.value)) {
        didPaint = true
        
        if (isBatchingCommands) {
          currentMaze.value.setFloorCell(x, y, floor, newValue)
          batchedCells.push({ x, y, floor, oldValue, newValue })
        } else {
          const command = new SetCellCommand(currentMaze.value, x, y, floor, oldValue, newValue)
          executeCommand(command)
        }
      }
      
      if (didPaint && !isSingleClickMode) {
        lastPaintedCell = cellKey
      }
      
      if (didPaint) {
        renderFloorPreview(currentFloor.value)
      }
      
      return didPaint
    }
    
    const getCellFromMouseEvent = (event) => {
      const canvas = editorCanvas.value
      if (!canvas) return { valid: false }
      
      const rect = canvas.getBoundingClientRect()
      
      const mouseX = event.clientX
      const mouseY = event.clientY
      
      const canvasLeft = rect.left
      const canvasTop = rect.top
      
      const relX = mouseX - canvasLeft
      const relY = mouseY - canvasTop
      
      const canvasX = relX / zoom.value
      const canvasY = relY / zoom.value
      
      const x = Math.floor(canvasX / cellSize)
      const y = Math.floor(canvasY / cellSize)
      
      const floor = currentFloor.value
      const floorWidth = currentFloorWidth.value
      const floorHeight = currentFloorHeight.value
      
      if (x >= 0 && x < floorWidth && y >= 0 && y < floorHeight) {
        // Calculate which edge of the cell is closest (for door placement)
        let closestEdge = 0
        
        if (editMode.value === 'door' || editMode.value === 'removeDoor') {
          const cellLocalX = (canvasX / cellSize) - x
          const cellLocalY = (canvasY / cellSize) - y
          
          const distToNorth = cellLocalY
          const distToSouth = 1 - cellLocalY
          const distToWest = cellLocalX
          const distToEast = 1 - cellLocalX
          
          // Find the closest edge
          const minDist = Math.min(distToNorth, distToEast, distToSouth, distToWest)
          
          if (minDist === distToNorth) {
            closestEdge = 0 // North
          } else if (minDist === distToEast) {
            closestEdge = 1 // East
          } else if (minDist === distToSouth) {
            closestEdge = 2 // South
          } else {
            closestEdge = 3 // West
          }
        }
        
        return { x, y, floor, closestEdge, valid: true }
      }
      
      return { valid: false }
    }
    
    // Bresenham's line algorithm to fill gaps when painting fast
    const getLineCells = (x0, y0, x1, y1) => {
      const cells = []
      const dx = Math.abs(x1 - x0)
      const dy = Math.abs(y1 - y0)
      const sx = x0 < x1 ? 1 : -1
      const sy = y0 < y1 ? 1 : -1
      let err = dx - dy
      
      let x = x0
      let y = y0
      
      while (true) {
        cells.push({ x, y })
        
        if (x === x1 && y === y1) break
        
        const e2 = 2 * err
        if (e2 > -dy) {
          err -= dy
          x += sx
        }
        if (e2 < dx) {
          err += dx
          y += sy
        }
      }
      
      return cells
    }
    
    const handleCanvasMouseDown = (event) => {
      const currentMode = tempPanMode.value ? 'pan' : editMode.value
      
      if (currentMode === 'pan') {
        isPanning.value = true
        lastPanX.value = event.clientX
        lastPanY.value = event.clientY
        return
      }
      
      isDrawing = true
      lastPaintedCell = null
      lastPaintedCoords = null
      
      // Start batching commands for drag operations
      isBatchingCommands = true
      batchedCells.length = 0
      batchedDoors.length = 0
      
      const cell = getCellFromMouseEvent(event)
      if (cell.valid && paintCell(cell.x, cell.y, cell.floor, cell.closestEdge)) {
        lastPaintedCoords = { x: cell.x, y: cell.y }
        renderEditor()
      }
    }
    
    const handleCanvasMouseMove = (event) => {
      if (isPanning.value) {
        const dx = event.clientX - lastPanX.value
        const dy = event.clientY - lastPanY.value
        
        panX.value += dx
        panY.value += dy
        
        lastPanX.value = event.clientX
        lastPanY.value = event.clientY
        return
      }
      
      const cell = getCellFromMouseEvent(event)
      if (cell.valid && editMode.value !== 'pan') {
        const needsUpdate = !previewCell.value || 
          previewCell.value.x !== cell.x || 
          previewCell.value.y !== cell.y || 
          previewCell.value.floor !== cell.floor ||
          previewCell.value.edge !== cell.closestEdge
        
        if (needsUpdate) {
          previewCell.value = { 
            x: cell.x, 
            y: cell.y, 
            floor: cell.floor, 
            edge: cell.closestEdge 
          }
          if (!isDrawing) {
            renderEditor()
          }
        }
      } else if (previewCell.value) {
        previewCell.value = null
        if (!isDrawing) {
          renderEditor()
        }
      }
      
      if (!isDrawing) return
      
      if (!cell.valid) return
      
      let needsRender = false
      
      // If we have a previous position, draw a line between them
      if (lastPaintedCoords && (lastPaintedCoords.x !== cell.x || lastPaintedCoords.y !== cell.y)) {
        const lineCells = getLineCells(lastPaintedCoords.x, lastPaintedCoords.y, cell.x, cell.y)
        
        for (const lineCell of lineCells) {
          if (paintCell(lineCell.x, lineCell.y, cell.floor, cell.closestEdge)) {
            needsRender = true
          }
        }
        
        lastPaintedCoords = { x: cell.x, y: cell.y }
      } else if (!lastPaintedCoords) {
        if (paintCell(cell.x, cell.y, cell.floor, cell.closestEdge)) {
          needsRender = true
        }
        lastPaintedCoords = { x: cell.x, y: cell.y }
      }
      
      if (needsRender) {
        // Debounce render with requestAnimationFrame
        if (rafId) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => renderEditor())
      }
    }
    
    const handleCanvasMouseUp = () => {
      isPanning.value = false
      isDrawing = false
      lastPaintedCell = null
      lastPaintedCoords = null
      // Cancel any pending render
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }
    
    const handleCanvasMouseLeave = () => {
      handleCanvasMouseUp()
      if (previewCell.value) {
        previewCell.value = null
        renderEditor()
      }
    }
    
    const handleContainerMouseDown = (event) => {
      if (event.target === mazeEditorContainer.value) {
        isPanning.value = true
        lastPanX.value = event.clientX
        lastPanY.value = event.clientY
        event.preventDefault()
      }
    }
    
    const handleContainerMouseMove = (event) => {
      if (isPanning.value) {
        const dx = event.clientX - lastPanX.value
        const dy = event.clientY - lastPanY.value
        
        panX.value += dx
        panY.value += dy
        
        lastPanX.value = event.clientX
        lastPanY.value = event.clientY
      }
    }
    
    const handleContainerMouseUp = () => {
      isPanning.value = false
      
      // End batching and create batch command if we have cells
      if (isBatchingCommands && batchedCells.length > 0) {
        const command = new BatchCellCommand(currentMaze.value, [...batchedCells])
        executeCommand(command)
        batchedCells.length = 0
      }
      
      if (isBatchingCommands && batchedDoors.length > 0) {
        const command = new BatchDoorCommand(currentMaze.value, [...batchedDoors])
        executeCommand(command)
        batchedDoors.length = 0
      }
      
      isBatchingCommands = false
      
      isDrawing = false
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
      if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer)
      
      resizeDebounceTimer = setTimeout(() => {
        currentMaze.value.setFloorDimensions(currentFloor.value, mazeWidth.value, mazeHeight.value)
        nextTick(() => {
          ctx = editorCanvas.value.getContext('2d')
          renderEditor()
          updateAllFloorPreviews()
        })
      }, 100)
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
    
    const exportCode = () => {
      const mazeData = currentMaze.value.toJSON()
      const dataStr = JSON.stringify(mazeData)
      // Convert to base64 for compact representation
      const code = btoa(unescape(encodeURIComponent(dataStr)))
      codeText.value = code
      showCodeModal.value = true
    }
    
    const importCode = () => {
      codeInputText.value = ''
      showCodeModal.value = true
    }
    
    const applyCodeImport = () => {
      try {
        const dataStr = decodeURIComponent(escape(atob(codeInputText.value.trim())))
        const mazeData = JSON.parse(dataStr)
        const importedMaze = Maze.fromJSON(mazeData)
        
        currentMaze.value = importedMaze
        mazeWidth.value = importedMaze.width
        mazeHeight.value = importedMaze.height
        
        editorCanvas.value.width = importedMaze.width * cellSize
        editorCanvas.value.height = importedMaze.height * cellSize
        
        renderEditor()
        showCodeModal.value = false
        codeInputText.value = ''
      } catch (error) {
        alert('Error importing code: Invalid code format')
      }
    }
    
    const copyCodeToClipboard = () => {
      navigator.clipboard.writeText(codeText.value).then(() => {
        alert('Code copied to clipboard!')
      })
    }
    
    const applyChanges = () => {
      emit('maze-updated', currentMaze.value)
      emit('close')
    }
    
    const handleCanvasWheel = (event) => {
      event.preventDefault()
      
      const rect = editorCanvas.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const canvasX = (mouseX - panX.value) / zoom.value
      const canvasY = (mouseY - panY.value) / zoom.value
      
      const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(5, zoom.value * zoomDelta))
      
      panX.value = mouseX - canvasX * newZoom
      panY.value = mouseY - canvasY * newZoom
      
      zoom.value = newZoom
    }
    
    const zoomIn = () => {
      zoom.value = Math.min(5, zoom.value * 1.2)
    }
    
    const zoomOut = () => {
      zoom.value = Math.max(0.1, zoom.value / 1.2)
    }
    
    const resetView = () => {
      zoom.value = 1
      panX.value = 0
      panY.value = 0
    }
    
    const setZoomFromPercent = () => {
      const percent = Math.max(10, Math.min(500, zoomPercent.value))
      zoom.value = percent / 100
    }
    
    const renderFloorPreview = (floorIndex) => {
      const canvas = floorCanvases.value[floorIndex]
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const width = currentMaze.value.getFloorWidth(floorIndex)
      const height = currentMaze.value.getFloorHeight(floorIndex)
      
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width * floorPreviewSize, height * floorPreviewSize)
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const cellType = currentMaze.value.getCellType(x, y, floorIndex)
          let color = '#000'
          
          // Cell types: 0 = empty, 1 = wall, 2 = slippery
          if (cellType === 1) color = '#444'
          else if (cellType === 2) color = '#0a8a9a'
          
          // Check for doors
          if (currentMaze.value.doorManager && currentMaze.value.doorManager.hasDoor(x, y, floorIndex)) {
            color = '#5a3a0a'
          }
          
          // Check for stairs
          if (currentMaze.value.hasStairs(x, y, floorIndex)) {
            const stairs = currentMaze.value.getStairs(x, y, floorIndex)
            color = stairs.targetFloor > floorIndex ? '#0a3a7a' : '#7a4a0a'
          }
          
          // Check for start/exit
          if (x === currentMaze.value.startPosition.x && y === currentMaze.value.startPosition.y && floorIndex === currentMaze.value.startPosition.floor) {
            color = '#0a7a0a'
          } else if (x === currentMaze.value.exitPosition.x && y === currentMaze.value.exitPosition.y && floorIndex === currentMaze.value.exitPosition.floor) {
            color = '#7a0a0a'
          }
          
          ctx.fillStyle = color
          ctx.fillRect(x * floorPreviewSize, y * floorPreviewSize, floorPreviewSize, floorPreviewSize)
        }
      }
    }
    
    const updateAllFloorPreviews = () => {
      for (let i = 0; i < numFloors.value; i++) {
        nextTick(() => {
          renderFloorPreview(i)
        })
      }
    }
    
    const addFloor = () => {
      const defaultWidth = currentMaze.value.getFloorWidth(0)
      const defaultHeight = currentMaze.value.getFloorHeight(0)
      const newFloorIndex = currentMaze.value.numFloors
      
      const command = new AddFloorCommand(currentMaze.value, newFloorIndex, defaultWidth, defaultHeight)
      executeCommand(command)
      
      numFloors.value = currentMaze.value.numFloors
      
      nextTick(() => {
        updateAllFloorPreviews()
        if (floorsListContainer.value) {
          floorsListContainer.value.scrollTop = 0
        }
      })
    }
    
    const handleKeyDown = (event) => {
      if (event.key === 'Control' || event.key === 'Meta') {
        tempPanMode.value = true
      }
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        performUndo()
      }
      
      if ((event.ctrlKey || event.metaKey) && (event.shiftKey && event.key === 'z' || event.key === 'y')) {
        event.preventDefault()
        performRedo()
      }
    }
    
    const performUndo = () => {
      if (commandHistory.undo()) {
        renderEditor()
        updateAllFloorPreviews()
        updateHistoryState()
        emit('maze-updated', currentMaze.value)
      }
    }
    
    const performRedo = () => {
      if (commandHistory.redo()) {
        renderEditor()
        updateAllFloorPreviews()
        updateHistoryState()
        emit('maze-updated', currentMaze.value)
      }
    }
    
    const handleKeyUp = (event) => {
      if (event.key === 'Control' || event.key === 'Meta') {
        if (!event.ctrlKey && !event.metaKey) {
          tempPanMode.value = false
          isPanning.value = false
        }
      }
    }
    
    onMounted(() => {
      initializeEditor()
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    })
    
    watch(() => props.maze, () => {
      initializeEditor()
    })
    
    watch(numFloors, () => {
      updateAllFloorPreviews()
    })
    
    return {
      editorCanvas,
      fileInput,
      mazeEditorContainer,
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
      handleCanvasMouseDown,
      handleCanvasMouseMove,
      handleCanvasMouseUp,
      handleCanvasMouseLeave,
      handleCanvasWheel,
      handleContainerMouseDown,
      handleContainerMouseMove,
      handleContainerMouseUp,
      doorLocked,
      resizeMaze,
      resizeCurrentFloor,
      resizeAllFloors,
      updateFloors,
      changeBiome,
      clearMaze,
      generateMaze,
      exportMaze,
      importMaze,
      exportCode,
      importCode,
      applyCodeImport,
      copyCodeToClipboard,
      showCodeModal,
      codeText,
      codeInputText,
      applyChanges,
      zoom,
      panX,
      panY,
      isPanning,
      tempPanMode,
      canvasStyle,
      zoomIn,
      zoomOut,
      resetView,
      zoomPercent,
      setZoomFromPercent,
      floorCanvases,
      floorsListContainer,
      renderFloorPreview,
      updateAllFloorPreviews,
      addFloor,
      commandHistory,
      canUndo,
      canRedo,
      performUndo,
      performRedo
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
  display: flex;
  flex-direction: column;
  z-index: 2000;
  
  background-color: rgba(0, 0, 0, 0.85);
  background-image: 
    linear-gradient(45deg, rgba(17, 17, 17, 0.5) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(17, 17, 17, 0.5) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(17, 17, 17, 0.5) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(17, 17, 17, 0.5) 75%);
  background-size: 40px 40px;
  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
  animation: checkerboard-scroll 2s linear infinite, overlay-fade-in 0.3s ease-out;
}

@keyframes checkerboard-scroll {
  0% {
    background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
  }
  100% {
    background-position: -40px 40px, -40px 60px, -20px 20px, -60px 40px;
  }
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.admin-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: hidden;
  position: relative;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-10px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}

@keyframes footer-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: transparent;
  border: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2001;
  pointer-events: none;
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
  pointer-events: all;
}

.close-btn:hover {
  background-color: #555;
  border-radius: 4px;
}

.toolbar {
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  padding: 12px 20px;
  background-color: #3a3a3a;
  border: 2px solid #555;
  border-radius: 8px;
  align-items: center;
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  max-width: 90vw;
  z-index: 2001;
  animation: modal-appear 0.3s ease-out;
  pointer-events: all;
  overflow-x: auto;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
}

.toolbar-label {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.tool-buttons-group {
  display: flex;
  gap: 5px;
}

.tool-btn, .palette-btn {
  width: 60px;
  height: 50px;
  border: 2px solid #555;
  background-color: #2a2a2a;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.2s;
  padding: 4px;
}

.tool-btn:hover, .palette-btn:hover {
  background-color: #444;
  border-color: #777;
  transform: translateY(-2px);
}

.tool-btn.active, .palette-btn.active {
  background-color: #4a7c59;
  border-color: #5a8c69;
  box-shadow: 0 0 10px rgba(74, 124, 89, 0.5);
}

.tool-icon, .palette-icon {
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-icon svg, .palette-icon svg {
  display: block;
}

.tool-label, .palette-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
  color: #ccc;
  line-height: 1;
}

.tool-btn.active .tool-label,
.palette-btn.active .palette-label {
  color: #fff;
}

.palette-btn {
  position: relative;
}

/* Paint palette visual indicators */
.wall-btn { background-color: #444; }
.wall-btn.active { background-color: #555; border-color: #888; }

.slippery-btn { background-color: #1a4a5a; }
.slippery-btn.active { background-color: #2a6a8a; border-color: #4a9aca; }

.door-btn { background-color: #5a4a2a; }
.door-btn.active { background-color: #7a6a4a; border-color: #aaa; }

.start-btn { background-color: #2a4a2a; }
.start-btn.active { background-color: #3a6a3a; border-color: #5a9a5a; }

.exit-btn { background-color: #4a2a2a; }
.exit-btn.active { background-color: #6a3a3a; border-color: #9a5a5a; }

.stairs-up-btn { background-color: #2a3a5a; }
.stairs-up-btn.active { background-color: #3a5a7a; border-color: #5a8aaa; }

.stairs-down-btn { background-color: #5a3a2a; }
.stairs-down-btn.active { background-color: #7a5a3a; border-color: #aa8a5a; }

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #2a2a2a;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px;
}

.zoom-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  border-radius: 3px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}

.zoom-btn:hover {
  background-color: #444;
  border-color: #777;
}

.zoom-btn:active {
  transform: scale(0.95);
}

.history-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}

.history-btn {
  width: 32px;
  height: 28px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  border-radius: 3px;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}

.history-btn:hover:not(:disabled) {
  background-color: #444;
  border-color: #777;
}

.history-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.history-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-display {
  min-width: 50px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  padding: 0 4px;
}

.zoom-input {
  width: 50px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  padding: 4px 4px;
  background-color: #2a2a2a;
  border: 1px solid #555;
  border-radius: 3px;
  font-family: inherit;
}

.zoom-input:focus {
  outline: none;
  border-color: #4a7c59;
  box-shadow: 0 0 0 2px rgba(74, 124, 89, 0.3);
}

.toolbar-select, .toolbar-input {
  padding: 6px 10px;
  background-color: #2a2a2a;
  border: 1px solid #555;
  color: #fff;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  min-width: 80px;
}

.toolbar-input {
  width: 60px;
  text-align: center;
}

.toolbar-select:focus, .toolbar-input:focus {
  outline: none;
  border-color: #4a7c59;
  box-shadow: 0 0 0 2px rgba(74, 124, 89, 0.3);
}

.toolbar-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ccc;
  margin-top: 4px;
  cursor: pointer;
}

.toolbar-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.toolbar-actions {
  margin-left: auto;
  flex-direction: row;
  gap: 8px;
}

.toolbar-action-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #555;
  background-color: #2a2a2a;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.toolbar-action-btn svg {
  display: block;
}

.toolbar-action-btn:hover {
  background-color: #444;
  border-color: #777;
  transform: translateY(-2px);
}

.toolbar-action-btn:active {
  transform: translateY(0);
}

.admin-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: transparent;
  padding: 0;
  height: 100vh;
  width: 100vw;
  gap: 0;
}

.maze-editor {
  flex: 1;
  padding: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: transparent;
}

.editor-canvas {
  border: 2px solid #555;
  cursor: crosshair;
  background-color: #000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s ease-out;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.maze-editor.cursor-pan,
.editor-canvas.cursor-pan {
  cursor: grab;
}

.maze-editor.cursor-pan:active,
.editor-canvas.cursor-pan:active {
  cursor: grabbing;
}

.admin-footer {
  padding: 15px 20px;
  background-color: transparent;
  border: none;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  position: fixed;
  bottom: 20px;
  right: 80px;
  z-index: 2001;
  animation: footer-appear 0.3s ease-out 0.1s backwards;
}

.apply-btn, .cancel-btn {
  padding: 10px 20px;
  border: 2px solid #555;
  cursor: pointer;
  font-family: inherit;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  background-color: #2a2a2a;
}

.apply-btn {
  background-color: #4a7c59;
  color: #fff;
}

.apply-btn:hover {
  background-color: #5a8c69;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(74, 124, 89, 0.4);
}

.cancel-btn {
  background-color: #666;
  color: #fff;
}

.cancel-btn:hover {
  background-color: #777;
  transform: translateY(-1px);
}

.floors-panel {
  width: 180px;
  background-color: transparent;
  border-left: none;
  display: flex;
  flex-direction: column;
  padding: 70px 0 70px 0;
  position: relative;
  margin-top: 70px;
}

.floors-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 5px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%);
}

.floor-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
  border: 2px solid #444;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #2a2a2a;
  flex-shrink: 0;
}

.floor-item:hover {
  border-color: #666;
  background-color: #333;
}

.floor-item.active {
  border-color: #4a7c59;
  background-color: #2a4a2a;
  box-shadow: 0 0 8px rgba(74, 124, 89, 0.3);
}

.floor-preview {
  width: 100%;
  height: 100px;
  border: 1px solid #555;
  background-color: #000;
  border-radius: 2px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.floor-label {
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  text-align: center;
}

.floor-enter-active, .floor-leave-active {
  transition: all 0.3s ease;
}

.floor-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.floor-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.floor-move {
  transition: transform 0.3s ease;
}

.add-floor-btn {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: 120px;
  height: 40px;
  border-radius: 20px;
  border: 2px solid #4a7c59;
  background-color: #2a4a2a;
  color: #5a8c69;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 2000;
  padding: 8px 16px;
}

.add-floor-btn svg {
  flex-shrink: 0;
}

.add-floor-btn:hover {
  background-color: #3a6a3a;
  border-color: #5a8c69;
  transform: translateX(-50%) scale(1.05);
}

.add-floor-btn:active {
  transform: translateX(-50%) scale(0.98);
}

/* Code Modal */
.code-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: overlay-fade-in 0.2s ease-out;
}

.code-modal {
  background: linear-gradient(135deg, #2a2a3a 0%, #1a1a2a 100%);
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: modal-appear 0.3s ease-out;
}

.code-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid rgba(100, 200, 255, 0.3);
}

.code-modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 20px;
}

.code-modal-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.code-modal-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.code-modal-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.code-instructions {
  color: #ccc;
  margin: 0 0 15px 0;
  font-size: 14px;
}

.code-textarea {
  width: 100%;
  min-height: 200px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(100, 200, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 15px;
  resize: vertical;
  margin-bottom: 15px;
}

.code-textarea:focus {
  outline: none;
  border-color: rgba(100, 200, 255, 0.6);
  box-shadow: 0 0 10px rgba(100, 200, 255, 0.2);
}

.code-copy-btn,
.code-import-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a8cff 0%, #3a6cff 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.code-copy-btn:hover,
.code-import-btn:hover {
  background: linear-gradient(135deg, #5a9cff 0%, #4a7cff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 140, 255, 0.4);
}

.code-copy-btn:active,
.code-import-btn:active {
  transform: translateY(0);
}

.code-import-btn:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.5;
}

.code-import-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>
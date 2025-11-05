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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
          <label class="toolbar-label">Palette</label>
          <div class="tool-buttons-group">
            <button 
              @click="editMode = 'wall'" 
              :class="{ active: editMode === 'wall' }"
              class="palette-btn wall-btn"
              title="Wall"
            >
              <div class="palette-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
                  <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
                </svg>
              </div>
              <div class="palette-label">Down</div>
            </button>
          </div>
        </div>

        <div v-if="editMode === 'door' || editMode === 'removeDoor'" class="toolbar-section">
          <label class="toolbar-label">Door</label>
          <select v-model.number="doorDirection" class="toolbar-select">
            <option :value="0">North</option>
            <option :value="1">East</option>
            <option :value="2">South</option>
            <option :value="3">West</option>
          </select>
          <label v-if="editMode === 'door'" class="toolbar-checkbox">
            <input v-model="doorLocked" type="checkbox" /> Locked
          </label>
        </div>

        <div class="toolbar-section">
          <label class="toolbar-label">Floor</label>
          <select v-model.number="currentFloor" class="toolbar-select">
            <option v-for="f in numFloors" :key="f-1" :value="f-1">
              Floor {{ f }}
            </option>
          </select>
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
          <label class="toolbar-label">Floors</label>
          <input 
            v-model.number="numFloors" 
            type="number" 
            min="1" 
            max="10"
            @change="updateFloors"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
              <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
            </svg>
          </button>
          <button @click="generateMaze" class="toolbar-action-btn" title="Generate Random Maze">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
              <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
            </svg>
          </button>
          <button @click="exportMaze" class="toolbar-action-btn" title="Export JSON">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
              <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
              <path fill="currentColor" fill-rule="evenodd" d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12M3.324 4.643q0-.47.32-.953q.321-.483.935-.8t1.433-.317q.762 0 1.344.265q.584.265.9.72q.318.457.318.991q0 .422-.18.738q-.182.317-.431.548q-.25.23-.895.775a4 4 0 0 0-.287.27a1 1 0 0 0-.16.213c-.289.667-1.543.592-1.302-.342a1.8 1.8 0 0 1 .363-.535q.225-.23.609-.547q.335-.278.485-.419t.252-.314a.73.73 0 0 0 .103-.377a.85.85 0 0 0-.313-.669q-.312-.272-.806-.272q-.577 0-.85.275q-.273.274-.462.81q-.18.56-.677.56a.7.7 0 0 1-.496-.196q-.203-.195-.203-.424M6 9.75a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5"/>
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
          <button @click="addFloor" class="add-floor-btn" title="Add Floor">+</button>
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
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
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
    const mazeEditorContainer = ref(null)
    
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
            
            const previewEdge = previewCell.value.edge !== undefined ? previewCell.value.edge : doorDirection.value
            
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
      
      const effectiveEdge = edgeOverride !== null ? edgeOverride : doorDirection.value
      
      switch (editMode.value) {
        case 'wall':
          currentMaze.value.addWall(x, y, floor)
          didPaint = true
          break
        case 'empty':
          currentMaze.value.removeWall(x, y, floor)
          currentMaze.value.removeStairs(x, y, floor)
          didPaint = true
          break
        case 'slippery':
          currentMaze.value.removeWall(x, y, floor)
          currentMaze.value.addSlipperyTile(x, y, floor)
          didPaint = true
          break
        case 'removeSlippery':
          currentMaze.value.removeSlipperyTile(x, y, floor)
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
        case 'stairsUp':
          if (floor < currentMaze.value.numFloors - 1) {
            currentMaze.value.removeWall(x, y, floor)
            currentMaze.value.addStairs(x, y, floor, floor + 1, x, y)
            didPaint = true
          }
          break
        case 'stairsDown':
          if (floor > 0) {
            currentMaze.value.removeWall(x, y, floor)
            currentMaze.value.addStairs(x, y, floor, floor - 1, x, y)
            didPaint = true
          }
          break
        case 'door':
          currentMaze.value.addDoor(x, y, floor, effectiveEdge, {
            locked: doorLocked.value,
            showOnMinimap: true
          })
          didPaint = true
          break
        case 'removeDoor':
          currentMaze.value.removeDoor(x, y, floor, effectiveEdge)
          didPaint = true
          break
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
      numFloors.value += 1
      updateFloors()
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
      doorDirection,
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
      addFloor
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
  align-items: flex-start;
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
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #4a7c59;
  background-color: #2a4a2a;
  color: #5a8c69;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  line-height: 1;
  padding: 0;
}

.add-floor-btn:hover {
  background-color: #3a6a3a;
  border-color: #5a8c69;
  transform: translateX(-50%) scale(1.1);
}

.add-floor-btn:active {
  transform: translateX(-50%) scale(0.95);
}
</style>
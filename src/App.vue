<script setup>
import GameView from './components/GameView.vue'
</script>

<template>
  <GameView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>

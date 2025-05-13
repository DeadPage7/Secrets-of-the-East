<template>
  <div id="app" class="app-wrapper">
    <MainHeader />
    <main class="main-content">
      <router-view />
    </main>
    <MainFooter />
  </div>
</template>

<script setup>
import MainHeader from './components/Headers/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  background-color: #0f0f1f;
}

*, *::before, *::after {
  box-sizing: inherit;
}

#app.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>


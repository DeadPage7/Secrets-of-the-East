<template>
  <div id="app">
    <MainHeader />
    <router-view />
    <MainFooter />
  </div>
</template>

<script setup>
import MainHeader from './components/Headers/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
import HeaderInfo from "@/components/Headers/HeaderInfo.vue";
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
}

* {
  box-sizing: inherit;
}
</style>

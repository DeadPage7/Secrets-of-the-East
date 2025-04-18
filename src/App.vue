<template>
  <div id="app">
    <MainHeader />
    <GlobalLoading />
    <router-view />
    <MainFooter />
  </div>
</template>

<script setup>
import MainHeader from './components/Headers/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
import GlobalLoading from "@/components/different/GlobalLoading.vue";
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

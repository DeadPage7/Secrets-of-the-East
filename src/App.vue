<template>
  <div class="layout">
    <MainHeader />

    <main class="main-content">
      <router-view />
    </main>

    <MainFooter />
  </div>
</template>

<script>
import MainHeader from './components/Headers/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'

export default {
  name: 'App',
  components: {
    MainHeader,
    MainFooter
  }
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', sans-serif;
  background-color: #0f0f1f;
  color: #ffffff;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* важное условие для нормального футера */
  background-color: #0f0f1f;
}

.main-content {
  flex: 1;
  padding-top: 80px;
  background-color: #0f0f1f;
}

/* футер НЕ фиксируется, просто находится внизу */
footer {
  padding: 20px;
  background-color: #0f0f1f;
  color: #c2c2da;
  text-align: center;
}
/* Скроллбар стили для темной темы */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #c84b9e;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background-color: #1a1a2e;
}

</style>

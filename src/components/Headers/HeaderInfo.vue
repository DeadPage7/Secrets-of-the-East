<template>
  <div class="header-wrapper">
    <!-- Частицы -->
    <div class="particles-container">
      <span v-for="n in 80" :key="n" class="particle"></span>
    </div>

    <!-- Контент -->
    <div class="header-content">
      <h1 class="store-title">Тайны Востока</h1>
      <p class="intro-text">
        «Тайны Востока» — это современная азиатская мода без границ. Мы привозим прямо из улиц Сеула, Токио и Шанхая:
      </p>

      <div class="style-sections">
        <div class="style-section">
          <h2>Корейский стиль</h2>
          <p>Изысканная простота и уют, где каждая деталь продумана до мелочей. Стильные худи, свободные силуэты и мягкие ткани, которые подарят вам комфорт в любое время года.</p>
        </div>
        <div class="style-section">
          <h2>Японский стиль</h2>
          <p>Минимализм и утончённость в каждом образе. Платья, джинсы и куртки, созданные для того, чтобы подчеркнуть вашу индивидуальность и легко сочетаться с любыми аксессуарами.</p>
        </div>
        <div class="style-section">
          <h2>Китайский стиль</h2>
          <p>Смелость и выразительность через необычные крои и яркие детали. Экспериментальные формы, интересные принты и оригинальные решения, которые сделают ваш стиль уникальным.</p>
        </div>
      </div>

      <p class="delivery-info">
        Доставляем быстро — почувствуйте себя частью азиатской модной сцены!
      </p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';

export default {
  name: "HeaderInfo",
  setup() {
    onMounted(() => {
      const particles = document.querySelectorAll(".particle");
      particles.forEach(p => {
        const size = Math.random() * 3 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.animationDuration = `${5 + Math.random() * 15}s`;
        p.style.animationDelay = `${Math.random() * 10}s`;
      });
    });
  }
};
</script>

<style scoped>
/* Контейнер для всего */
.header-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #0f0f1f;
}

/* Частицы */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 133, 193, 0.5);
  box-shadow: 0 0 6px 2px rgba(255, 133, 193, 0.7); /* Свечение */
  animation: float 8s infinite ease-in-out, pulse 2s infinite ease-in-out, randomMovement 10s infinite ease-in-out;
  opacity: 0.8;
}

/* Движение частиц */
@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-10px, -20px) scale(1.4);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

/* Пульсация/мерцание */
@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    box-shadow: 0 0 6px 2px rgba(255, 133, 193, 0.6);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 12px 5px rgba(255, 133, 193, 0.9);
  }
}

/* Случайное движение частиц */
@keyframes randomMovement {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-30px, 40px);
  }
  50% {
    transform: translate(40px, -20px);
  }
  75% {
    transform: translate(-50px, 10px);
  }
  100% {
    transform: translate(0, 0);
  }
}

/* Контент */
.header-content {
  position: relative;
  z-index: 1;
  padding: 60px 20px;
  text-align: center;
  color: #fff;
  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Заголовок */
.store-title {
  font-size: 48px;
  margin-bottom: 20px;
  transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
}

/* Вступительный текст */
.intro-text {
  font-size: 22px;
  margin-bottom: 40px;
  color: #c2c2da;
  transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
}

/* Секции стилей */
.style-sections {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.style-section {
  max-width: 400px;
  padding: 20px;
  border-radius: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  animation: fadeIn 1s 2s forwards;
}

.style-section h2 {
  color: #fff;
  margin-bottom: 10px;
  font-size: 28px;
  transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
}

.style-section p {
  color: #bbb;
  font-size: 18px;
  transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
}

/* Hover-эффекты */
.style-section:hover h2 {
  transform: scale(1.2); /* Увеличиваем заголовок */
  color: #c84b9e;
  text-shadow: 0 0 10px rgba(200, 75, 158, 0.5); /* Лёгкая тень */
}

.style-section:hover p {
  transform: scale(0.98); /* Уменьшаем обычный текст */
  color: #fff; /* Белый цвет */
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6); /* Лёгкая тень для текста */
}

/* Текст про доставку */
.delivery-info {
  margin-top: 40px;
  font-size: 20px;
  color: #c2c2da;
}

</style>

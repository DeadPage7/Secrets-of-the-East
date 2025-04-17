<template>
  <div class="header-content">
    <h1 class="store-title">Тайны Востока</h1>
    <p class="intro-text">
      «Тайны Востока» — это современная азиатская мода без границ. Мы привозим прямо из улиц Сеула, Токио и Шанхая:
    </p>
    <div class="style-sections">
      <div class="style-section">
        <h2>Корейский уют</h2>
        <p>Oversize-худи, нежные блузы, платья в стиле K-fashion.</p>
      </div>
      <div class="style-section">
        <h2>Японский минимализм</h2>
        <p>Лаконичные пальто, винтажные джинсы, streetwear.</p>
      </div>
      <div class="style-section">
        <h2>Китайская смелость</h2>
        <p>Одежда с неожиданными кроями и яркими принтами.</p>
      </div>
    </div>
    <p class="delivery-info">
      Доставляем быстро — почувствуйте себя частью азиатской модной сцены!
    </p>
  </div>
</template>

<script>
export default {
  name: "HeaderInfo",
};
</script>

<style scoped>
/* Основной стиль для контента */
.header-content {
  background-color: #111; /* Темный фон */
  color: #f5f5f5; /* Белый текст */
  padding: 40px 20px;
  text-align: center;
  margin-top: 60px; /* Отступ сверху */
  opacity: 0; /* Начальный скрытый стиль для анимации */
  animation: fadeIn 1s forwards; /* Анимация появления */
}

/* Анимация появления */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Стиль заголовка */
.store-title {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20px;
  opacity: 0;
  animation: fadeIn 1s 0.5s forwards; /* Добавлена задержка для анимации */
}

/* Вводный текст */
.intro-text {
  font-family: 'ABeeZee', sans-serif;
  font-size: 24px;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 40px;
  opacity: 0;
  animation: fadeIn 1s 1s forwards; /* Добавлена задержка для анимации */
}

/* Секции стилей */
.style-sections {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  opacity: 0;
  animation: fadeIn 1s 1.5s forwards; /* Задержка для анимации */
}

.style-section {
  max-width: 300px;
  opacity: 0;
  animation: fadeIn 1s 2s forwards; /* Задержка для анимации */
}

/* Заголовок в каждой секции стилей */
.style-section h2 {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
  transition: transform 0.3s ease, color 0.3s ease;
}

/* Текст в каждой секции стилей */
.style-section p {
  font-family: 'ABeeZee', sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: #bbb;
  transition: color 0.3s ease;
}

/* При наведении на секцию — анимация */
.style-section:hover h2 {
  transform: scale(1.1);
  color: #5c6bc0; /* Цвет акцента */
}

.style-section:hover p {
  color: #fff;
}

/* Информация о доставке */
.delivery-info {
  font-family: 'ABeeZee', sans-serif;
  font-size: 20px;
  color: #ccc;
  margin-top: 40px;
  opacity: 0;
  animation: fadeIn 1s 2.5s forwards; /* Задержка для анимации */
}
</style>

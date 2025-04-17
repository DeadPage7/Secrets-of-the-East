<template>
  <header class="header">
    <!-- Панель навигации -->
    <div class="nav-bar">
      <div class="nav-left">
        <span class="store-name">Тайны Востока</span>
      </div>
      <div class="nav-center">
        <a href="#" class="nav-link">Пункт выдачи</a>
        <a href="#" class="nav-link">Корзина</a>
        <a href="#" class="nav-link">Профиль</a>
      </div>
      <div class="nav-right">
        <div class="search-container">
          <input type="text" class="search-input" placeholder="Поиск..." />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderWithInfo",
};
</script>

<style scoped>
/* Панель навигации */
.nav-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #222; /* Темно-серый фон */
  padding: 15px 30px;
  position: fixed; /* Панель фиксируется сверху */
  top: 0; /* Панель сверху */
  left: 0; /* По левому краю */
  right: 0; /* По правому краю */
  z-index: 2; /* Чтобы панель была поверх других элементов */
  animation: slideDown 0.5s ease-out; /* Плавное появление панели */
}

/* Шапка с темным фоном */
.header {
  background-color: #111; /* Темный фон */
  color: #f5f5f5; /* Белый цвет текста */
  padding: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative; /* Для других элементов */
}

/* Стиль для всех элементов внутри навигации */
.nav-left {
  position: absolute;
  left: 30px;
}

.store-name {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  animation: fadeIn 1s ease-out; /* Плавное появление названия магазина */
}

.nav-center {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex: 2;
}

.nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: #fff;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease, transform 0.3s ease; /* Плавный переход */
}

.nav-link:hover {
  color: #5c6bc0; /* Цвет акцента */
  transform: scale(1.1); /* Увеличение при наведении */
}

.nav-link:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #5c6bc0; /* Акцентный цвет */
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease;
}

.nav-link:hover:after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.nav-right {
  position: absolute;
  right: 30px;
  display: flex;
  align-items: center;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: #333; /* Темный фон для контейнера поиска */
  border-radius: 25px;
  padding: 5px 15px;
  border: 1px solid #444;
  animation: fadeIn 1s ease-out; /* Плавное появление контейнера поиска */
}

/* Поле ввода поиска */
.search-input {
  background-color: transparent; /* Прозрачный фон */
  color: #fff; /* Белый цвет текста */
  border: none;
  outline: none;
  padding: 8px 10px;
  font-size: 16px;
  width: 200px; /* Установим ширину */
  transition: width 0.3s ease; /* Плавное расширение поля ввода */
}

.search-input::placeholder {
  color: #ccc; /* Цвет для placeholder */
}

.search-input:focus {
  width: 250px; /* Расширение поля при фокусе */
}

/* Анимации */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

<template>
  <div class="product-grid">
    <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
      <!-- Ссылка для перехода на страницу товара -->
      <router-link :to="`/product/${product.id}`" class="product-link">
        <img :src="product.image" :alt="product.name" class="product-image" />
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-price">{{ product.price }} ₽</p>
        </div>
      </router-link>
    </div>
  </div>

  <!-- Пагинация -->
  <div class="pagination">
    <button
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="pagination-button"
    >
      Назад
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      @click="changePage(page)"
      :class="{ active: currentPage === page }"
      class="pagination-button"
    >
      {{ page }}
    </button>

    <button
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="pagination-button"
    >
      Вперед
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const imageUrl1 = new URL('@/assets/images/girl1.jpg', import.meta.url).href;
const imageUrl2 = new URL('@/assets/images/girl2.jpg', import.meta.url).href;
const imageUrl3 = new URL('@/assets/images/girl3.jpg', import.meta.url).href;

const images = [imageUrl1, imageUrl2, imageUrl3];

// Генерация 40 карточек с разными названиями и случайными изображениями
const products = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Oversize-худи ${i + 1}`,
  price: 3290 + (i * 50), // цена немного варьируется для разнообразия
  image: images[Math.floor(Math.random() * images.length)], // случайное изображение
}));

// Количество товаров на одной странице
const itemsPerPage = 10;
const currentPage = ref(1);

// Вычисляем, какие товары показывать на текущей странице
const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return products.slice(startIndex, startIndex + itemsPerPage);
});

// Вычисляем общее количество страниц
const totalPages = computed(() => Math.ceil(products.length / itemsPerPage));

// Определяем видимые страницы для пагинации
const visiblePages = computed(() => {
  let pages = [];

  if (totalPages.value <= 5) {
    pages = Array.from({ length: totalPages.value }, (_, i) => i + 1);
  } else {
    if (currentPage.value <= 3) {
      pages = [1, 2, 3, 4, 5];
    } else if (currentPage.value >= totalPages.value - 2) {
      pages = [totalPages.value - 4, totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value];
    } else {
      pages = [1, '...', currentPage.value - 1, currentPage.value, currentPage.value + 1, '...', totalPages.value];
    }
  }

  return pages;
});

// Функция изменения страницы
const changePage = (page) => {
  if (page === '...') return;
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<style scoped>
/* Сетка товаров */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  padding: 40px 20px;
  opacity: 0;
  animation: fadeInGrid 1s forwards; /* Появление сетки товаров */
}

/* Анимация появления для сетки */
@keyframes fadeInGrid {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Карточка товара */
.product-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #222;
  transition: transform 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  opacity: 0;
  animation: fadeInCard 0.5s forwards; /* Появление карточки */
}

@keyframes fadeInCard {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Усиление тени */
}

/* Изображение товара */
.product-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05); /* Легкое увеличение при наведении */
}

/* Информация о товаре */
.product-info {
  padding: 15px;
  text-align: center;
}

.product-name {
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #fff;
  transition: color 0.3s ease;
}

.product-price {
  font-size: 16px;
  color: #bbb;
  transition: color 0.3s ease;
}

.product-card:hover .product-name,
.product-card:hover .product-price {
  color: #f39c12; /* Цвет акцента при наведении */
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  animation: fadeInPagination 1s forwards; /* Анимация появления пагинации */
}

@keyframes fadeInPagination {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagination-button {
  background-color: #444;
  border: none;
  padding: 10px;
  color: #fff;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.pagination-button:hover {
  background-color: #666;
  transform: scale(1.1); /* Увеличение кнопки при наведении */
}

.pagination-button.active {
  background-color: #f39c12;
}

.pagination-button:disabled {
  background-color: #888;
  cursor: not-allowed;
}

/* Убираем подчеркивание у ссылок */
.product-link {
  text-decoration: none;
}
</style>

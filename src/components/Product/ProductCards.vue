<template>
  <div class="product-grid">
    <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
      <!-- Ссылка для перехода на страницу товара -->
      <router-link :to="`/product/${product.id}`" class="product-link">
        <img :src="product.photo" :alt="product.name" class="product-image" />
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
import {ref, computed, onMounted} from 'vue';
import api from "@/services/api"; // Импортируем API для работы с сервером

// Для хранения списка товаров
const products = ref([]);
const itemsPerPage = 10;
const currentPage = ref(1);

// Функция для получения товаров с API
const fetchProducts = async () => {
  try {
    const response = await api.get('/product');
    console.log(response.data);
    products.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
  }
};


// Вызов функции для получения товаров при монтировании компонента
onMounted(() => {
  fetchProducts();
});

// Пагинация
const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return products.value.slice(startIndex, startIndex + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));

const visiblePages = computed(() => {
  let pages = [];

  if (totalPages.value <= 5) {
    pages = Array.from({length: totalPages.value}, (_, i) => i + 1);
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

const changePage = (page) => {
  if (page === '...') return;
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<style scoped>
/* Стиль карточек и пагинации оставляем тот же */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  padding: 40px 20px;
}

.product-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #222;
  transition: transform 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.product-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
  text-align: center;
}

.product-name {
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #fff;
}

.product-price {
  font-size: 16px;
  color: #bbb;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination-button {
  background-color: #444;
  border: none;
  padding: 10px;
  color: #fff;
  cursor: pointer;
  border-radius: 5px;
}

.pagination-button.active {
  background-color: #f39c12;
}

.pagination-button:disabled {
  background-color: #888;
  cursor: not-allowed;
}

.product-link {
  text-decoration: none; /* Убираем подчеркивание */
}
</style>

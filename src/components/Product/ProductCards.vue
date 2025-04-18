<template>
  <div class="product-container">
    <div class="product-grid" ref="productsGrid">
      <div
        v-for="product in paginatedProducts"
        :key="product.id"
        class="product-card"
        @mouseenter="hoverCard = product.id"
        @mouseleave="hoverCard = null"
      >
        <router-link :to="`/product/${product.id}`" class="product-link">
          <div class="image-container">
            <img
              :src="getImageUrl(product.photo)"
              :alt="product.name"
              class="product-image"
              :class="{ 'image-zoom': hoverCard === product.id }"
              @error="handleImageError"
              loading="lazy"
            />
            <div class="product-rating">
              <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= product.rating }">★</span>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="price-container">
              <p class="product-price">{{ product.price.toLocaleString() }} ₽</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Пагинация -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        ← Назад
      </button>

      <div class="pagination-pages">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="{ active: currentPage === page }"
          class="pagination-button"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        Вперед →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from "@/services/api";
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const productsGrid = ref(null);

// Данные
const products = ref([]);
const itemsPerPage = 12;
const currentPage = ref(parseInt(route.query.page) || 1);
const hoverCard = ref(null);

// Базовый URL для изображений
const baseImageUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:8000';

// Методы
const getImageUrl = (photoPath) => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http')) return photoPath;
  if (photoPath.startsWith('/storage')) return `${baseImageUrl}${photoPath}`;
  return `${baseImageUrl}/storage/${photoPath}`;
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
  event.target.onerror = null;
};

const scrollToProducts = () => {
  if (productsGrid.value) {
    const topOffset = productsGrid.value.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({
      top: topOffset,
      behavior: 'smooth'
    });
  }
};

const fetchProducts = async () => {
  try {
    const response = await api.get('/product');
    products.value = response.data.map(product => ({
      ...product,
      rating: product.rating || Math.floor(Math.random() * 5) + 1
    }));
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
  }
};

// Пагинация
const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return products.value.slice(startIndex, startIndex + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));

const visiblePages = computed(() => {
  let pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;

  if (total <= 7) {
    pages = Array.from({ length: total }, (_, i) => i + 1);
  } else {
    pages.push(1);

    if (current > delta + 2) {
      pages.push('...');
    }

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - delta - 1) {
      pages.push('...');
    }

    if (total > 1) {
      pages.push(total);
    }
  }

  return pages;
});

const changePage = (page) => {
  if (page === '...' || page < 1 || page > totalPages.value) return;

  currentPage.value = page;
  router.push({ query: { ...route.query, page } });
  scrollToProducts();
};

// Следим за изменением page в URL
watch(
  () => route.query.page,
  (newPage) => {
    const page = parseInt(newPage) || 1;
    if (page !== currentPage.value) {
      currentPage.value = page;
      scrollToProducts();
    }
  }
);

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
/* Базовые сбросы */
.product-container *,
.product-container *::before,
.product-container *::after {
  text-decoration: none;
}

.product-container {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Сетка товаров */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 40px 20px;
}

/* Карточка товара */
.product-card {
  border-radius: 16px;
  overflow: hidden;
  background-color: #222;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

/* Изображение */
.image-container {
  position: relative;
  overflow: hidden;
  height: 300px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.03);
}

/* Рейтинг */
.product-rating {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  gap: 3px;
}

.star {
  color: #777;
  font-size: 16px;
}

.star.filled {
  color: #f39c12;
}

/* Информация о товаре */
.product-info {
  padding: 20px;
  text-align: center;
}

.product-name {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.price-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.product-price {
  font-size: 18px;
  color: #fff;
  font-weight: bold;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 30px 0;
  flex-wrap: wrap;
  padding: 0 20px;
}

.pagination-pages {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-button {
  background-color: #444;
  border: none;
  padding: 10px 16px;
  color: #fff;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.pagination-button:hover:not(:disabled) {
  background-color: #555;
}

.pagination-button.active {
  background-color: #f39c12;
}

.pagination-button:disabled {
  background-color: #888;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Адаптивность */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    padding: 20px 10px;
  }

  .pagination-button {
    padding: 8px 12px;
    min-width: 32px;
    font-size: 14px;
  }

  .image-container {
    height: 220px;
  }

  .product-rating {
    padding: 3px 8px;
  }

  .star {
    font-size: 14px;
  }
}
</style>

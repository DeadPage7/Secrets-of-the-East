<template>
  <div class="products-container">
    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading-overlay">
      <div class="loader"></div>
    </div>

    <!-- Сообщение если нет товаров -->
    <div v-if="!loading && products.length === 0" class="no-products">
      <h3>Товары не найдены</h3>
      <p>Попробуйте изменить параметры фильтрации</p>
    </div>

    <!-- Сетка товаров -->
    <div v-else class="products-grid">
      <div
        v-for="product in paginatedProducts"
        :key="product.id"
        class="product-card"
        @click="goToProduct(product.id)"
      >
        <div class="product-badge" v-if="product.discount">
          -{{ product.discount }}%
        </div>
        <div class="product-image-container">
          <img
            :src="getImageUrl(product.photo)"
            :alt="product.name"
            class="product-image"
            @error="handleImageError"
          />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <div class="product-meta">
            <span class="product-country">{{ product.country?.name }}</span>
            <span class="product-category">{{ product.category?.name }}</span>
          </div>
          <div class="product-price">
            <span class="current-price">{{ formatPrice(calculatePrice(product)) }}</span>
            <span v-if="product.discount" class="old-price">{{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1 && !loading" class="pagination">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        &lt;
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="{ active: currentPage === page }"
        class="pagination-btn"
      >
        {{ page }}
      </button>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import api from "@/services/api";

const router = useRouter();
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const products = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalProducts = ref(0);
const itemsPerPage = 12;

const fetchProducts = async () => {
  loading.value = true;
  try {
    let response;

    if (props.searchQuery) {
      // Если есть поисковый запрос, используем поисковый эндпоинт
      response = await api.get('/products/search', {
        params: { q: props.searchQuery }
      });
      products.value = response.data.data || response.data;
      totalProducts.value = response.data.count || products.value.length;
    } else {
      // Иначе используем обычную фильтрацию
      const params = {
        ...props.filters,
        page: currentPage.value,
        per_page: itemsPerPage
      };

      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      response = await api.get('/products/filter', { params });
      products.value = response.data.data || response.data;
      totalProducts.value = response.data.count || products.value.length;
    }
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    products.value = [];
    totalProducts.value = 0;
  } finally {
    loading.value = false;
  }
};

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));
const paginatedProducts = computed(() => products.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage));

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const goToPage = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const getImageUrl = (path) => {
  if (!path) return '/placeholder-product.jpg';
  if (path.startsWith('http')) return path;
  return `http://secrets-of-the-east.ru/storage/${path}`;
};

const handleImageError = (e) => {
  e.target.src = '/placeholder-product.jpg';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
};

const calculatePrice = (product) => {
  return product.discount ? product.price * (1 - product.discount / 100) : product.price;
};

const goToProduct = (id) => {
  router.push(`/product/${id}`);
};

watch(() => props.filters, () => {
  currentPage.value = 1;
  fetchProducts();
}, { deep: true });

onMounted(() => {
  fetchProducts();
});
watch(() => props.filters, () => {
  currentPage.value = 1;
  fetchProducts();
}, { deep: true });

watch(() => props.searchQuery, () => {
  currentPage.value = 1;
  fetchProducts();
});

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
/* Контейнер с товарами */
.products-container {
  position: relative;
  min-height: 500px;
  background-color: #1a1a2e; /* Темный фон */
  color: #f7f7f7; /* Светлый текст */
  padding: 20px;
  border-radius: 16px;
}

/* Сетка товаров */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  padding: 20px 0;
}

/* Карточка товара */
.product-card {
  background: #2a2a40; /* Темный фон для карточек */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
  position: relative;
  color: #f7f7f7; /* Светлый текст */
  padding: 10px;
}

/* Эффект наведения на карточку */
.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  opacity: 0.9;
  background: #333c55; /* Темно-синий фон при наведении */
}

/* Контейнер изображения товара */
.product-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
  border-radius: 12px;
}

/* Стиль для самого изображения */
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  border-radius: 12px;
}

/* Эффект увеличения изображения при наведении */
.product-card:hover .product-image {
  transform: scale(1.1);
  z-index: 1;
}

/* Стиль для информации о товаре */
.product-info {
  padding: 15px;
  text-align: left;
}

.product-name {
  font-size: 18px;
  margin: 10px 0;
  color: #f7f7f7; /* Светлый текст */
  font-weight: 600;
  transition: color 0.3s ease;
}

/* Эффект для названия товара при наведении */
.product-card:hover .product-name {
  color: #ff85c1; /* Неоновый розовый для названия */
}

/* Мета информация о товаре */
.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #ccc; /* Светло-серый цвет */
  margin-bottom: 15px;
}

/* Стиль для пагинации */
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 30px;
  padding-bottom: 30px;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #444; /* Темные границы */
  background: #2a2a40; /* Темный фон для кнопок */
  color: #f7f7f7; /* Светлый текст */
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Эффект наведения для кнопок пагинации */
.pagination-btn:hover:not(:disabled) {
  background: #3a3a57; /* Темно-синий фон при наведении */
}

/* Активная кнопка пагинации */
.pagination-btn.active {
  background: #ff85c1; /* Неоновый розовый для активной кнопки */
  color: white;
  border-color: #ff85c1;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Стиль для состояния загрузки */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Полупрозрачный черный фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #ff85c1; /* Неоновый розовый для загрузки */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Сообщение, если нет товаров */
.no-products {
  text-align: center;
  padding: 50px 20px;
  color: #f7f7f7; /* Светлый текст */
}
</style>

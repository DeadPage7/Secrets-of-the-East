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
          <div class="product-meta">
            <span class="product-country">{{ product.country?.name }}</span>
            <span class="product-category">{{ product.category?.name }}</span>
          </div>
          <h3 class="product-name">{{ product.name }}</h3>
          <div class="product-price">
            <span class="current-price">{{ formatPrice(calculatePrice(product)) }}</span>
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
import { ref, computed, onMounted, watch } from 'vue';
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
      response = await api.get('/products/search', {
        params: { q: props.searchQuery }
      });
      products.value = response.data.data || response.data;
      totalProducts.value = response.data.count || products.value.length;
    } else {
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
  background-color: #1a1a2e;
  color: #f7f7f7;
  padding: 20px;
  border-radius: 16px;
}

/* Сетка товаров */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 20px 0;
}

/* Карточка товара */
.product-card {
  background: linear-gradient(135deg, #2a2a40 0%, #1e1e32 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  position: relative;
  color: #f7f7f7;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.product-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #333c55 0%, #2a2a45 100%);
  border-color: rgba(255, 133, 193, 0.2);
}

/* Бейдж скидки */
.product-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #ff5e62, #ff9966);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 94, 98, 0.3);
}

/* Контейнер изображения */
.product-image-container {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

/* Информация о товаре */
.product-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-country {
  font-size: 12px;
  color: #aaa;
}

.product-category {
  font-size: 12px;
  color: #ff85c1;
  font-weight: 500;
}

.product-name {
  font-size: 16px;
  margin: 0;
  line-height: 1.4;
  font-weight: 600;
  color: #f7f7f7;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #ff85c1;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff85c1;
}

.old-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
  padding-bottom: 20px;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #444;
  background: #2a2a40;
  color: #f7f7f7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #3a3a57;
}

.pagination-btn.active {
  background: #ff85c1;
  color: white;
  border-color: #ff85c1;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Загрузка */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #ff85c1;
  border-right-color: #7fdbff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Нет товаров */
.no-products {
  text-align: center;
  padding: 50px 20px;
  color: #f7f7f7;
}

.no-products h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.no-products p {
  font-size: 16px;
  color: #aaa;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .product-image-container {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-info {
    padding: 15px;
  }
}
</style>

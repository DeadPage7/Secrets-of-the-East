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
        :class="{ 'out-of-stock': getProductTotalQuantity(product) === 0 }"
      >
        <div class="product-image-container" @click="handleProductClick(product)">
          <img
            :src="getImageUrl(product.photo)"
            :alt="product.name"
            class="product-image"
            @error="handleImageError"
          />
          <div v-if="getProductTotalQuantity(product) === 0" class="out-of-stock-overlay">
            <span class="out-of-stock-text">Нет в наличии</span>
          </div>
        </div>
        <div class="product-info" @click="handleProductClick(product)">
          <div class="product-meta">
            <span class="product-country">{{ product.country?.name }}</span>
            <span class="product-category">{{ product.category?.name }}</span>
          </div>
          <h3 class="product-name">{{ product.name }}</h3>
          <div class="product-price">
            <span class="current-price">{{ formatPrice(product.price) }}</span>
          </div>
        </div>

        <!-- Кнопка редактирования, видна только админам и менеджерам -->
        <button
          v-if="isAdminOrManager"
          class="edit-button"
          @click.stop="openEditModal(product)"
          type="button"
        >
          Редактировать
        </button>
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

    <!-- Модальное окно редактирования -->
    <EditProductModal
      v-if="showEditModal"
      :productId="editingProductId"
      @close="closeEditModal"
      @updated="onProductUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { useStore } from 'vuex';
import EditProductModal from '../admin/EditProductModal.vue';

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

const products = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = 12;

const showEditModal = ref(false);
const editingProductId = ref(null);

const router = useRouter();
const store = useStore();

const userRole = computed(() => store.state.user?.role || null);
const isAdminOrManager = computed(() => {
  const role_id = Number(userRole.value);
  return role_id === 1 || role_id === 2;
});

const cleanParams = (obj) => {
  const res = {};
  for (const key in obj) {
    const val = obj[key];
    if (val !== null && val !== undefined && val !== '') {
      res[key] = val;
    }
  }
  return res;
};

const searchTerm = ref('');

const handleSearch = (event) => {
  searchTerm.value = event.detail.query || '';
};

// Метод для вычисления общего количества товара
const getProductTotalQuantity = (product) => {
  // Если есть простое поле quantity, используем его
  if (product.quantity !== undefined) {
    return product.quantity;
  }

  // Иначе считаем сумму всех вариантов
  if (product.product_color_sizes && product.product_color_sizes.length > 0) {
    return product.product_color_sizes.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Если нет ни того ни другого - считаем что товара нет
  return 0;
};

// Обработчик клика по товару
const handleProductClick = (product) => {
  if (getProductTotalQuantity(product) === 0) {
    return; // Не делаем ничего, если товара нет в наличии
  }
  goToProduct(product.id);
};

const fetchProducts = async () => {
  loading.value = true;

  try {
    let searchResults = [];
    let filterResults = [];

    // 1. Поиск
    if (searchTerm.value) {
      const searchRes = await api.get('/products/search', {
        params: {q: searchTerm.value}
      });
      searchResults = searchRes.data.data;
    }

    // 2. Фильтрация
    const filterRes = await api.get('/products/filter', {
      params: cleanParams(props.filters)
    });
    filterResults = filterRes.data.data;

    // 3. Объединение результатов поиска и фильтрации
    let combinedProducts = [];
    if (searchTerm.value) {
      const searchIds = searchResults.map(p => p.id);
      combinedProducts = filterResults.filter(p => searchIds.includes(p.id));
    } else {
      combinedProducts = filterResults;
    }

    // 4. Сортировка: товары с количеством > 0 впереди, потом товары с 0 количеством
    combinedProducts.sort((a, b) => {
      const aQty = getProductTotalQuantity(a);
      const bQty = getProductTotalQuantity(b);
      if (aQty === 0 && bQty > 0) return 1;
      if (aQty > 0 && bQty === 0) return -1;
      return 0;
    });

    products.value = combinedProducts;

  } catch (e) {
    console.error('Ошибка:', e);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));

const paginatedProducts = computed(() =>
  products.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage)
);

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
  if (page !== currentPage.value) {
    currentPage.value = page;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    window.scrollTo({top: 0, behavior: 'smooth'});
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

const goToProduct = (id) => {
  router.push(`/product/${id}`);
};

const openEditModal = (product) => {
  editingProductId.value = product.id;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingProductId.value = null;
};

const onProductUpdated = () => {
  closeEditModal();
  fetchProducts();
};

watch(() => props.filters, () => {
  currentPage.value = 1;
  fetchProducts();
}, {deep: true});

watch(currentPage, () => {
  fetchProducts();
});

watch(searchTerm, () => {
  currentPage.value = 1;
  fetchProducts();
});

onMounted(() => {
  window.addEventListener('search-request', handleSearch);
  fetchProducts();
});

onUnmounted(() => {
  window.removeEventListener('search-request', handleSearch);
});
</script>

<style scoped>
.products-container {
  position: relative;
  min-height: 500px;
  background-color: #1a1a2e;
  color: #f7f7f7;
  padding: 20px;
  border-radius: 16px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 20px 0;
}

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

.product-card.out-of-stock {
  opacity: 0.7;
}

.product-card.out-of-stock:hover {
  transform: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  cursor: not-allowed;
}

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

.product-card:not(.out-of-stock):hover .product-image {
  transform: scale(1.05);
}

.out-of-stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.out-of-stock-text {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  text-transform: uppercase;
  padding: 8px 16px;
  background: rgba(255, 0, 0, 0.7);
  border-radius: 4px;
}

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

.product-card:not(.out-of-stock):hover .product-name {
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

.edit-button {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: #ff85c1;
  color: #1a1a2e;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 133, 193, 0.4);
  transition: background-color 0.3s ease;
  user-select: none;
  z-index: 5;
}

.edit-button:hover {
  background: #e263a6;
}

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

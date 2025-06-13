<template>
  <div class="products-container" ref="productsContainer">
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
          <!-- Состояние загрузки изображения -->
          <div v-if="imageStates[product.id] === 'loading'" class="image-loading-skeleton"></div>

          <!-- Основное изображение товара -->
          <img
            v-if="imageStates[product.id] === 'loaded'"
            :src="getImageUrl(product)"
            :alt="product.name"
            class="product-image"
          />

          <!-- Заглушка при ошибке загрузки изображения -->
          <div v-if="imageStates[product.id] === 'error'" class="image-placeholder-container">
            <img
              :src="placeholderImage"
              :alt="product.name"
              class="placeholder-image"
            />
            <div class="placeholder-overlay">
              <span class="placeholder-text">Фото недоступно</span>
            </div>
          </div>

          <!-- Оверлей для товаров, которых нет в наличии -->
          <div v-if="getProductTotalQuantity(product) === 0" class="out-of-stock-overlay">
            <span class="out-of-stock-text">Нет в наличии</span>
          </div>
        </div>

        <!-- Информация о товаре -->
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

        <!-- Кнопка редактирования (видна только админам/менеджерам) -->
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

    <!-- Модальное окно редактирования товара -->
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
import placeholderImage from '@/assets/images/product-placeholder.jpeg';

// Пропсы компонента
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

// Реактивные переменные
const products = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = 12; // Количество товаров на странице
const showEditModal = ref(false);
const editingProductId = ref(null);
const imageStates = ref({}); // Состояния загрузки изображений
const searchTerm = ref(''); // Поисковый запрос

const router = useRouter();
const store = useStore();

// Получаем роль пользователя из хранилища
const userRole = computed(() => store.state.user?.role || null);

// Проверяем, является ли пользователь администратором или менеджером
const isAdminOrManager = computed(() => {
  const role_id = Number(userRole.value);
  return role_id === 1 || role_id === 2;
});

// Формируем URL изображения товара
const getImageUrl = (product) => {
  if (!product.photo) return '';
  return product.photo.startsWith('http')
    ? product.photo
    : `http://secrets-of-the-east.ru/storage/${product.photo}`;
};

// Предзагрузка изображений товаров
const preloadImages = (products) => {
  products.forEach(product => {
    const img = new Image();
    const imageUrl = getImageUrl(product);

    if (!imageUrl) {
      imageStates.value[product.id] = 'error';
      return;
    }

    imageStates.value[product.id] = 'loading';
    img.src = imageUrl;

    img.onload = () => {
      imageStates.value[product.id] = 'loaded';
    };

    img.onerror = () => {
      imageStates.value[product.id] = 'error';
    };
  });
};

// Получаем общее количество товара (учитывая варианты)
const getProductTotalQuantity = (product) => {
  if (product.quantity !== undefined) {
    return product.quantity;
  }

  if (product.product_color_sizes && product.product_color_sizes.length > 0) {
    return product.product_color_sizes.reduce((sum, item) => sum + item.quantity, 0);
  }

  return 0;
};

// Обработчик клика по товару
const handleProductClick = (product) => {
  if (getProductTotalQuantity(product) === 0) return;
  goToProduct(product.id);
};

// Загрузка товаров с сервера
const fetchProducts = async () => {
  loading.value = true;
  imageStates.value = {};

  try {
    let searchResults = [];
    let filterResults = [];

    // Если есть поисковый запрос - выполняем поиск
    if (searchTerm.value) {
      const searchRes = await api.get('/products/search', {
        params: { q: searchTerm.value }
      });
      searchResults = searchRes.data.data;
    }

    // Загружаем товары по фильтрам
    const filterRes = await api.get('/products/filter', {
      params: cleanParams(props.filters)
    });
    filterResults = filterRes.data.data;

    // Объединяем результаты поиска и фильтрации
    let combinedProducts = [];
    if (searchTerm.value) {
      const searchIds = searchResults.map(p => p.id);
      combinedProducts = filterResults.filter(p => searchIds.includes(p.id));
    } else {
      combinedProducts = filterResults;
    }

    // Сортируем товары: сначала те, что в наличии
    combinedProducts.sort((a, b) => {
      const aQty = getProductTotalQuantity(a);
      const bQty = getProductTotalQuantity(b);
      if (aQty === 0 && bQty > 0) return 1;
      if (aQty > 0 && bQty === 0) return -1;
      return 0;
    });

    products.value = combinedProducts;
    preloadImages(combinedProducts);

  } catch (e) {
    console.error('Ошибка загрузки товаров:', e);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// Вычисляемые свойства для пагинации
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

// Навигация по страницам
const productsContainer = ref(null);

const scrollToComponent = () => {
  if (productsContainer.value) {
    // Вариант 1: Просто к верху компонента
    productsContainer.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // ИЛИ Вариант 2: С учетом фиксированного хедера (если есть)
    const headerHeight = 80; // Высота вашего хедера
    const topPos = productsContainer.value.offsetTop - headerHeight;
    window.scrollTo({
      top: topPos,
      behavior: 'smooth'
    });
  }
};

const goToPage = (page) => {
  if (page !== currentPage.value) {
    currentPage.value = page;
    scrollToComponent();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToComponent();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToComponent();
  }
};

// Форматирование цены
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
};

// Переход на страницу товара
const goToProduct = (id) => {
  router.push(`/product/${id}`);
};

// Управление модальным окном редактирования
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

// Очистка параметров от пустых значений
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

// Обработчик поискового запроса
const handleSearch = (event) => {
  searchTerm.value = event.detail.query || '';
};

// Наблюдатели за изменениями
watch(() => props.filters, () => {
  currentPage.value = 1;
  fetchProducts();
}, { deep: true });

watch(searchTerm, () => {
  currentPage.value = 1;
  fetchProducts();
});

// Хуки жизненного цикла
onMounted(() => {
  window.addEventListener('search-request', handleSearch);
  fetchProducts();
});

onUnmounted(() => {
  window.removeEventListener('search-request', handleSearch);
});
</script>

<style scoped>
/* Стили остаются без изменений */
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
  background-color: #2a2a40;
}

.image-loading-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #2a2a40 25%, #3a3a57 50%, #2a2a40 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.image-placeholder-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  filter: brightness(0.8);
}

.placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.placeholder-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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

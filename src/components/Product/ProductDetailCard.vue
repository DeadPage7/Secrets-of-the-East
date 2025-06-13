<template>
  <div>
    <!-- Блок загрузки -->
    <div v-if="loading" class="loading-wrapper">
      <div class="spinner"></div>
      <div class="loading-text">Загрузка товара...</div>
    </div>

    <!-- Анимация появления контента после загрузки -->
    <transition name="fade">
      <template v-if="!loading">
        <!-- Основной блок с информацией о товаре -->
        <div v-if="product" class="product-detail">
          <!-- Блок с изображением товара -->
          <div class="image-block">
            <!-- Основное изображение товара -->
            <img
              v-if="imageLoaded"
              :src="getImageUrl(product.photo)"
              :alt="product.name"
              class="main-image"
              @error="handleImageError"
              @load="handleImageLoad"
            />

            <!-- Запасное изображение, если основное не загрузилось -->
            <div v-else class="image-placeholder">
              <img
                :src="placeholderImage"
                :alt="product.name"
                class="placeholder-img"
              />
              <div class="placeholder-overlay">
                <span class="placeholder-text">Фото недоступно</span>
              </div>
            </div>
          </div>

          <!-- Блок с информацией о товаре -->
          <div class="info-block">
            <h1>{{ product.name }}</h1>
            <p class="description">{{ product.description }}</p>

            <!-- Мета-информация о товаре -->
            <div class="product-meta">
              <p><strong>Категория:</strong> {{ product.category?.name || 'Неизвестная категория' }}</p>
              <p><strong>Страна:</strong> {{ product.country?.name || 'Неизвестная страна' }}</p>
              <p><strong>Пол:</strong> {{ formatSex(product.sex) }}</p>
              <p class="price"><strong>Цена:</strong> {{ formatPrice(product.price) }}</p>
            </div>

            <!-- Блок выбора цвета -->
            <div v-if="uniqueColors.length" class="color-section">
              <h3>Доступные цвета:</h3>
              <div class="color-options">
                <div
                  v-for="color in uniqueColors"
                  :key="color.id"
                  class="color-box"
                  :style="{ backgroundColor: color.hex, border: selectedColor?.id === color.id ? '3px solid #ff46a0' : '2px solid #2e2e3f' }"
                  :title="color.name"
                  @click="selectColor(color)"
                ></div>
              </div>
            </div>

            <!-- Блок выбора размера -->
            <div v-if="availableSizes.length" class="size-section">
              <h3>Доступные размеры:</h3>
              <div class="size-options">
                <div
                  v-for="size in availableSizes"
                  :key="size.id"
                  class="size-box"
                  :class="{ selected: selectedSize?.id === size.id, unavailable: !isSizeAvailable(size) }"
                  :title="'Размер: ' + size.name"
                  @click="selectSize(size)"
                >
                  {{ size.name }}
                </div>
              </div>
            </div>

            <!-- Блок добавления в корзину -->
            <div class="add-to-cart-block">
              <div class="quantity-block">
                <label for="quantity">Количество:</label>
                <div class="quantity-controls">
                  <button class="quantity-btn" @click="decreaseQuantity">-</button>
                  <input
                    type="number"
                    id="quantity"
                    v-model="quantity"
                    min="1"
                    class="quantity-input"
                    readonly
                  />
                  <button class="quantity-btn" @click="increaseQuantity">+</button>
                </div>
              </div>

              <button
                class="btn-add-to-cart"
                :disabled="!canAddToCart"
                @click="addToCart"
              >
                Добавить в корзину
              </button>
            </div>

            <!-- Сообщение об ошибке -->
            <p v-if="error" class="error-message">{{ error }}</p>

            <!-- Уведомление о добавлении в корзину -->
            <transition name="fade">
              <div v-if="showCartAnimation" class="cart-notification">
                <span>Товар добавлен в корзину</span>
              </div>
            </transition>
          </div>
        </div>

        <!-- Сообщение об ошибке загрузки товара -->
        <div v-else class="error">Ошибка загрузки товара</div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import placeholderImage from '@/assets/images/product-placeholder.jpeg';

// Инициализация переменных
const route = useRoute();
const product = ref(null);          // Данные о товаре
const loading = ref(true);          // Флаг загрузки
const productId = route.params.id;  // ID товара из URL
const quantity = ref(1);            // Количество товара
const error = ref('');              // Сообщение об ошибке
const showCartAnimation = ref(false); // Флаг показа анимации добавления в корзину
const imageLoaded = ref(true);      // Флаг загрузки изображения

const selectedColor = ref(null);    // Выбранный цвет
const selectedSize = ref(null);     // Выбранный размер

// Обработчик ошибки загрузки изображения
const handleImageError = () => {
  imageLoaded.value = false;
};

// Обработчик успешной загрузки изображения
const handleImageLoad = () => {
  imageLoaded.value = true;
};

// Загрузка данных о товаре с сервера
const fetchProduct = async () => {
  try {
    const response = await api.get(`/product/${productId}`);
    product.value = response.data;
    imageLoaded.value = true;
  } catch (e) {
    console.error('Ошибка при загрузке данных о товаре:', e);
  } finally {
    loading.value = false;
  }
};

// Вычисляемое свойство для уникальных цветов товара
const uniqueColors = computed(() => {
  const seen = new Set();
  return (product.value?.product_color_sizes || [])
    .map(pcs => pcs.color)
    .filter(color => color && !seen.has(color.id) && seen.add(color.id));
});

// Вычисляемое свойство для доступных размеров (в зависимости от выбранного цвета)
const availableSizes = computed(() => {
  if (!selectedColor.value) return [];
  const sizes = product.value.product_color_sizes
    .filter(pcs => pcs.color.id === selectedColor.value.id)
    .map(pcs => pcs.size);
  const seen = new Set();
  return sizes.filter(size => size && !seen.has(size.id) && seen.add(size.id));
});

// Проверка доступности размера
const isSizeAvailable = (size) => {
  if (!selectedColor.value) return false;
  return product.value.product_color_sizes.some(pcs =>
    pcs.color.id === selectedColor.value.id &&
    pcs.size.id === size.id &&
    pcs.quantity > 0
  );
};

// Проверка возможности добавления в корзину
const canAddToCart = computed(() => {
  return selectedColor.value && selectedSize.value && quantity.value > 0 &&
    isSizeAvailable(selectedSize.value);
});

// Форматирование цены
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(price);
};

// Форматирование пола
const formatSex = (sex) => {
  if (sex === 0) return 'Женский';
  if (sex === 1) return 'Мужской';
  return 'Не указан';
};

// Получение URL изображения
const getImageUrl = (path) => {
  if (!path) {
    imageLoaded.value = false;
    return '';
  }
  return path.startsWith('http') ? path : `http://secrets-of-the-east.ru/storage/${path}`;
};

// Уменьшение количества товара
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

// Увеличение количества товара
const increaseQuantity = () => {
  quantity.value++;
};

// Выбор цвета
const selectColor = (color) => {
  selectedColor.value = color;
  selectedSize.value = null;
  error.value = '';
};

// Выбор размера
const selectSize = (size) => {
  if (!isSizeAvailable(size)) return;
  selectedSize.value = size;
  error.value = '';
};

// Добавление товара в корзину
const addToCart = async () => {
  error.value = '';
  showCartAnimation.value = false;

  if (!selectedColor.value || !selectedSize.value) {
    error.value = 'Пожалуйста, выберите цвет и размер';
    return;
  }

  // Поиск конкретной комбинации цвета и размера
  const pcs = product.value.product_color_sizes.find(pcs =>
    pcs.color.id === selectedColor.value.id &&
    pcs.size.id === selectedSize.value.id
  );

  if (!pcs) {
    error.value = 'Выбранный цвет и размер недоступны';
    return;
  }

  try {
    // Отправка запроса на добавление в корзину
    await api.post(`/cart/product/${pcs.id}`, {
      quantity: quantity.value
    });

    // Показ уведомления об успешном добавлении
    showCartAnimation.value = true;
    setTimeout(() => {
      showCartAnimation.value = false;
    }, 3000);

  } catch (e) {
    error.value = 'Ошибка при добавлении товара в корзину';
    console.error('Ошибка:', e.response?.data?.message || e.message);
  }
};

// Загрузка данных при монтировании компонента
onMounted(fetchProduct);
</script>

<style scoped>
/* Основные стили для блока товара */
.product-detail {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #161622;
  color: #e0e0f0;
  border-radius: 16px;
  box-shadow: 0 0 10px rgb(46, 46, 63);
  padding: 40px;
  max-width: 1400px;
  gap: 40px;
  margin-top: 80px;
}

/* Стили для блока с изображением */
.image-block {
  flex: 1 1 50%;
  position: relative;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2a2a40;
  border-radius: 16px;
  overflow: hidden;
}

.main-image, .placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.main-image:hover, .placeholder-img:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 70, 160, 0.5);
}

/* Стили для заглушки изображения */
.image-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.placeholder-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
}

/* Стили для блока информации */
.info-block {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
  min-width: 300px;
}

h1 {
  font-size: 32px;
  font-weight: bold;
  color: #ff85c1;
  margin-bottom: 10px;
  text-shadow: 0 0 5px #ff85c1;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: #c2c2da;
}

.product-meta p {
  font-size: 18px;
  color: #c2c2da;
  margin: 8px 0;
}

.price {
  font-size: 20px;
  color: #ff85c1;
}

/* Стили для выбора цвета */
.color-section, .size-section {
  margin-top: 20px;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.color-box {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid #2e2e3f;
  cursor: pointer;
  box-shadow: 0 0 10px rgb(46, 46, 63);
  transition: transform 0.3s, box-shadow 0.3s, border 0.3s;
  flex-shrink: 0;
}

.color-box:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgb(46, 46, 63);
}

/* Стили для выбора размера */
.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.size-box {
  width: 40px;
  height: 40px;
  background-color: #222235;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.size-box:hover {
  background-color: #ff46a0;
  transform: scale(1.1);
  color: #000;
}

.size-box.selected {
  background-color: #ff46a0;
  color: #000;
  transform: scale(1.1);
  font-weight: bold;
}

.size-box.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  position: relative;
}

.size-box.unavailable::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ff4d6d;
  transform: rotate(-45deg);
}

/* Стили для управления количеством */
.quantity-block {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  background-color: #2e2e40;
  color: #ff85c1;
  border: none;
  width: 30px;
  height: 30px;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 133, 193, 0.3);
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background-color: #ff46a0;
  color: #000;
}

.quantity-input {
  width: 50px;
  height: 30px;
  text-align: center;
  background-color: #2e2e40;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 4px;
}

/* Стили для кнопки добавления в корзину */
.add-to-cart-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  gap: 20px;
}

.btn-add-to-cart {
  background-color: #c84b9e;
  color: #fff;
  font-size: 18px;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px #c84b9e;
  flex-grow: 1;
}

.btn-add-to-cart:hover {
  background-color: #ff46a0;
  box-shadow: 0 0 20px #ff46a0;
}

.btn-add-to-cart:disabled {
  background-color: #4a4a6a;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

/* Стили для сообщений об ошибках и уведомлений */
.error-message {
  color: #ff4d6d;
  margin-top: 10px;
}

.cart-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: rgba(40, 40, 60, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid #ff46a0;
  border-radius: 10px;
  padding: 15px 25px;
  color: #fff;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(255, 70, 160, 0.3);
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 768px) {
  .product-detail {
    flex-direction: column;
    padding: 20px;
    margin-top: 60px;
    gap: 20px;
  }

  .image-block {
    height: 300px;
    width: 100%;
  }

  .add-to-cart-block {
    flex-direction: column;
  }

  .btn-add-to-cart {
    width: 100%;
  }

  .cart-notification {
    bottom: 20px;
    right: 20px;
    left: 20px;
    text-align: center;
  }
}
</style>

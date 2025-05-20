<template>
  <div>
    <div v-if="loading" class="loading-wrapper">
      <div class="spinner"></div>
      <div class="loading-text">Загрузка товара...</div>
    </div>

    <transition name="fade">
      <template v-if="!loading">
        <div v-if="product" class="product-detail">
          <div class="image-block">
            <img :src="getImageUrl(product.photo)" :alt="product.name" class="main-image" />
          </div>

          <div class="info-block">
            <h1>{{ product.name }}</h1>
            <p class="description">{{ product.description }}</p>

            <p><strong>Категория:</strong> {{ product.category?.name || 'Неизвестная категория' }}</p>
            <p><strong>Страна:</strong> {{ product.country?.name || 'Неизвестная страна' }}</p>
            <p><strong>Пол:</strong> {{ formatSex(product.sex) }}</p>
            <p><strong>Цена:</strong> {{ formatPrice(product.price) }}</p>

            <!-- Выбор цвета -->
            <div v-if="uniqueColors.length">
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

            <!-- Выбор размера -->
            <div v-if="availableSizes.length">
              <h3 style="margin-top: 20px;">Доступные размеры:</h3>
              <div class="size-options">
                <div
                  v-for="size in availableSizes"
                  :key="size.id"
                  class="size-box"
                  :class="{ selected: selectedSize?.id === size.id }"
                  :title="'Размер: ' + size.name"
                  @click="selectSize(size)"
                >
                  {{ size.name }}
                </div>
              </div>
            </div>

            <!-- Количество и кнопка добавления -->
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
                title="Выберите цвет и размер"
              >
                Добавить в корзину
              </button>
            </div>

            <!-- Ошибка выбора -->
            <p v-if="error" class="error-message">{{ error }}</p>
            <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          </div>
        </div>

        <div v-else class="error">Ошибка загрузки товара</div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const product = ref(null);
const loading = ref(true);
const productId = route.params.id;
const quantity = ref(1);
const error = ref('');
const successMessage = ref('');

// Выбранные цвет и размер
const selectedColor = ref(null);
const selectedSize = ref(null);

// Загрузка товара с сервера
const fetchProduct = async () => {
  try {
    const response = await api.get(`/product/${productId}`);
    product.value = response.data;
  } catch (e) {
    console.error('Ошибка при загрузке данных о товаре:', e);
  } finally {
    loading.value = false;
  }
};

// Уникальные цвета товара
const uniqueColors = computed(() => {
  const seen = new Set();
  return (product.value?.product_color_sizes || [])
    .map(pcs => pcs.color)
    .filter(color => color && !seen.has(color.id) && seen.add(color.id));
});

// Доступные размеры для выбранного цвета
const availableSizes = computed(() => {
  if (!selectedColor.value) return [];
  const sizes = product.value.product_color_sizes
    .filter(pcs => pcs.color.id === selectedColor.value.id)
    .map(pcs => pcs.size);
  // Уникальные размеры
  const seen = new Set();
  return sizes.filter(size => size && !seen.has(size.id) && seen.add(size.id));
});

// Проверяем, можно ли добавить товар в корзину
const canAddToCart = computed(() => {
  return selectedColor.value && selectedSize.value && quantity.value > 0;
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
  if (!path) return '/placeholder-product.jpg';
  return path.startsWith('http') ? path : `http://secrets-of-the-east.ru/storage/${path}`;
};

// Управление количеством
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};
const increaseQuantity = () => {
  quantity.value++;
};

// Выбор цвета
const selectColor = (color) => {
  selectedColor.value = color;
  selectedSize.value = null; // Сбросить размер при смене цвета
  error.value = '';
  successMessage.value = '';
};

// Выбор размера
const selectSize = (size) => {
  selectedSize.value = size;
  error.value = '';
  successMessage.value = '';
};

// Добавление товара в корзину
const addToCart = async () => {
  error.value = '';
  successMessage.value = '';

  if (!selectedColor.value || !selectedSize.value) {
    error.value = 'Пожалуйста, выберите цвет и размер';
    return;
  }

  // Ищем ID связки color+size для отправки на сервер
  const pcs = product.value.product_color_sizes.find(pcs =>
    pcs.color.id === selectedColor.value.id && pcs.size.id === selectedSize.value.id
  );

  if (!pcs) {
    error.value = 'Выбранный цвет и размер недоступны';
    return;
  }

  try {
    const response = await api.post(`/cart/product/${pcs.id}`, {
      quantity: quantity.value
    });
    successMessage.value = 'Товар успешно добавлен в корзину';
  } catch (e) {
    error.value = 'Ошибка при добавлении товара в корзину';
    console.error(e);
  }
};

onMounted(fetchProduct);
</script>

<style scoped>
.size-box {
  background-color: #ff46a0;
  color: #000;
  transform: scale(1.1);
}
body {
  background-color: #0f0f1f;
}
.color-options,
.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.product-detail {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #161622;
  color: #e0e0f0;
  border-radius: 16px;
  box-shadow: 0 0 10px rgb(46, 46, 63);
  animation: fadeInUp 0.5s ease;
  padding: 40px;
  max-width: 1400px;
  gap: 40px;
  margin-top: 80px;
  box-sizing: border-box;
}

.image-block {
  flex: 1 1 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-image {
  width: 100%;
  max-width: 800px;
  max-height: 800px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 0 10px rgb(46, 46, 63);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.main-image:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgb(46, 46, 63);
}

.info-block {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
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

p {
  font-size: 18px;
  color: #c2c2da;
}

.color-box {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid #2e2e3f;
  cursor: pointer;
  box-shadow: 0 0 10px rgb(46, 46, 63);
  transition: transform 0.3s, box-shadow 0.3s;
}

.color-box:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgb(46, 46, 63);
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
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.size-box:hover {
  background-color: #ff46a0;
  transform: scale(1.1);
  color: #000;
}

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
}

.quantity-btn:hover {
  background-color: #ff46a0;
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

.add-to-cart-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-add-to-cart {
  background-color: #c84b9e;
  color: #fff;
  font-size: 18px;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s;
  box-shadow: 0 0 10px #c84b9e;
}

.btn-add-to-cart:hover {
  background-color: #ff46a0;
  box-shadow: 0 0 20px #ff46a0;
}
.color-box {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid #2e2e3f;
  cursor: pointer;
  box-shadow: 0 0 10px rgb(46, 46, 63);
  transition: transform 0.3s, box-shadow 0.3s, border 0.3s;
}
.color-box:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgb(46, 46, 63);
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
  transition: background-color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  user-select: none;
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

.error-message {
  color: #ff4d6d;
  margin-top: 10px;
}

.success-message {
  color: #7fff7f;
  margin-top: 10px;
}
</style>


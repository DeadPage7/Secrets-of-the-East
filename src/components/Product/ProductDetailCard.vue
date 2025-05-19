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

            <!-- Категория и страна -->
            <p><strong>Категория:</strong> {{ product.category?.name || 'Неизвестная категория' }}</p>
            <p><strong>Страна:</strong> {{ product.country?.name || 'Неизвестная страна' }}</p>

            <!-- Пол -->
            <p><strong>Пол:</strong> {{ formatSex(product.sex) }}</p>

            <!-- Цена -->
            <p><strong>Цена:</strong> {{ formatPrice(product.price) }}</p>

            <!-- Цвета и размеры отдельно -->
            <div v-if="product.product_color_sizes?.length">
              <h3>Доступные цвета:</h3>
              <div class="color-options">
                <div
                  v-for="(color, index) in uniqueColors"
                  :key="index"
                  class="color-box"
                  :style="{ backgroundColor: color.hex }"
                  :title="color.name"
                ></div>
              </div>

              <h3 style="margin-top: 20px;">Доступные размеры:</h3>
              <div class="size-options">
                <div
                  v-for="(size, index) in uniqueSizes"
                  :key="index"
                  class="size-box"
                  :title="'Размер: ' + size.name"
                >
                  {{ size.name }}
                </div>
              </div>
            </div>

            <!-- Счетчик количества и кнопка добавления в корзину -->
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
              <button class="btn-add-to-cart" @click="addToCart">Добавить в корзину</button>
            </div>
          </div>
        </div>

        <!-- Ошибка при загрузке товара -->
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

// Загрузка данных о товаре
const fetchProduct = async () => {
  try {
    const response = await api.get(`/product/${productId}`);
    product.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке данных о товаре:', error);
  } finally {
    loading.value = false;
  }
};

// Выделяем уникальные цвета
const uniqueColors = computed(() => {
  const seen = new Set();
  return (product.value?.product_color_sizes || [])
    .map(pcs => pcs.color)
    .filter(color => color && !seen.has(color.id) && seen.add(color.id));
});

// Выделяем уникальные размеры
const uniqueSizes = computed(() => {
  const seen = new Set();
  return (product.value?.product_color_sizes || [])
    .map(pcs => pcs.size)
    .filter(size => size && !seen.has(size.id) && seen.add(size.id));
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

// Добавление в корзину
const addToCart = () => {
  console.log(`Добавлено в корзину: ${quantity.value}`);
};

onMounted(fetchProduct);
</script>

<style scoped>
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

.color-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.color-size-item {
  display: flex;
  align-items: center;
  gap: 15px;
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
</style>


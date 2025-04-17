<template>
  <div class="product-detail-container">
    <section class="product-detail">
      <div class="product-image" @mouseover="hoverImage = true" @mouseleave="hoverImage = false">
        <img :src="product.image" alt="Product Image" />
      </div>
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <div class="product-rating">
          <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= product.rating }">★</span>
        </div>
        <div class="product-price">
          <span>{{ product.price }} ₽</span>
        </div>

        <!-- Выбор цвета -->
        <div class="product-color">
          <h4>Доступные цвета:</h4>
          <div class="color-options">
            <div v-for="color in product.colors" :key="color" class="color-option" :style="{ backgroundColor: color }"></div>
          </div>
        </div>

        <!-- Выбор размера -->
        <div class="product-size">
          <h4>Выберите размер:</h4>
          <div class="size-options">
            <span v-for="size in product.sizes" :key="size" class="size-option">{{ size }}</span>
          </div>
        </div>

        <!-- Выбор пола -->
        <div class="product-gender">
          <h4>Пол:</h4>
          <span>{{ product.gender }}</span>
        </div>

        <!-- Количество товара и кнопка -->
        <div class="product-quantity-and-button">
          <div class="product-quantity">
            <h4>Количество:</h4>
            <input type="number" v-model="quantity" min="1" max="10" />
          </div>
          <!-- Кнопка добавления в корзину -->
          <button @click="addToCart" class="button">Добавить в корзину</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const product = ref({});
const quantity = ref(1); // Количество товара
const route = useRoute();
const hoverImage = ref(false); // Для анимации при наведении на изображение

onMounted(() => {
  const productId = route.params.id;
  product.value = {
    id: productId,
    name: `Oversize-худи ${productId}`,
    description: 'Модное oversize-худи, отличное качество, идеальный выбор для холодного времени года.',
    price: 3290 + (productId * 50),
    rating: 4,
    image: new URL('@/assets/images/girl1.jpg', import.meta.url).href,
    colors: ['#FF6347', '#4682B4', '#32CD32'],
    sizes: ['S', 'M', 'L', 'XL'],
    gender: 'Женский',
  };
});

function addToCart() {
  alert(`Товар ${product.value.name} добавлен в корзину! Количество: ${quantity.value}`);
}
</script>

<style scoped>
.product-detail-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  background-color: #111;
  color: #fff;
}

.product-detail {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 20px;
  background-color: #222;
  border-radius: 10px;
  padding: 30px;
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  opacity: 0;
  animation: fadeIn 1s forwards; /* Появление при загрузке */
  animation-delay: 0.2s; /* Задержка */
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.product-image img {
  width: 600px;
  height: 600px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.product-image img:hover {
  transform: scale(1.05); /* Увеличение изображения при наведении */
}

.product-info {
  margin-left: 30px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: fadeIn 1s forwards; /* Анимация появления для текста */
  animation-delay: 0.4s; /* Задержка */
}

.product-info h1 {
  font-size: 26px;
  color: #fff;
  font-weight: bold;
  margin-bottom: 15px;
}

.product-info p {
  color: #bbb;
  font-size: 16px;
  margin-top: 10px;
}

.product-rating {
  margin-top: 10px;
}

.star {
  color: #ccc;
  font-size: 20px;
  margin-right: 5px;
}

.star.filled {
  color: #f50057;
}

.product-price {
  font-size: 24px;
  color: #f50057;
  margin-top: 10px;
  font-weight: bold;
}

.product-color, .product-size, .product-gender {
  margin-top: 20px;
}

h4 {
  color: #f5f5f5;
  margin-bottom: 5px;
}

.color-options {
  display: flex;
  gap: 10px;
}

.color-option {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #333;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.color-option:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px 3px rgba(245, 0, 87, 0.4);
}

.size-options {
  display: flex;
  gap: 15px;
}

.size-option {
  padding: 8px 16px;
  background-color: #333;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.size-option:hover {
  background-color: #f50057;
  transform: scale(1.1);
}

.product-quantity-and-button {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.product-quantity {
  display: flex;
  align-items: center;
}

.product-quantity h4 {
  margin-right: 10px;
}

.product-quantity input {
  width: 80px;
  padding: 8px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.product-quantity input:focus {
  border-color: #f50057;
}

.button {
  background-color: #f50057;
  color: white;
  padding: 12px 24px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.button:hover {
  background-color: #d4004e;
  transform: translateY(-2px);
}
</style>

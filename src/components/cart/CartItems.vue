<template>
  <div class="cart-items-container">
    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading">Загрузка...</div>

    <!-- Основное содержимое, если не загружается -->
    <div v-else>
      <!-- Если корзина пуста -->
      <div v-if="products.length === 0" class="empty">Корзина пуста</div>

      <!-- Список товаров в корзине -->
      <div class="products-list">
        <div
          v-for="product in products"
          :key="product.productColorSizeId"
          class="product-card"
          tabindex="0"
          aria-label="Товар в корзине"
        >
          <!-- Изображение товара или заглушка -->
          <div class="product-image-container">
            <!-- Если изображение загрузилось — показываем его -->
            <img
              v-if="product.imageLoaded"
              :src="product.photo"
              alt="Фото товара"
              class="product-photo"
              @error="() => handleImageError(product)"
              @load="() => handleImageLoad(product)"
            />

            <!-- Если изображение не загрузилось — показываем заглушку -->
            <div v-else class="image-placeholder">
              <img
                src="@/assets/images/product-placeholder.jpeg"
                alt="Фото недоступно"
                class="placeholder-img"
              />
              <div class="placeholder-overlay">
                <span class="placeholder-text">Фото недоступно</span>
              </div>
            </div>
          </div>

          <!-- Информация о товаре -->
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p>
              Цвет: <span class="highlight">{{ product.color || "—" }}</span>,
              Размер: <span class="highlight">{{ product.size || "—" }}</span>
            </p>
            <p>Цена за шт: <span class="price">{{ product.price }} ₽</span></p>
            <p>Итого: <span class="price-total">{{ product.price * product.quantity }} ₽</span></p>
          </div>

          <!-- Управление количеством и кнопка удаления -->
          <div class="product-controls">
            <div class="quantity-controls" role="group" aria-label="Управление количеством">
              <!-- Кнопка уменьшения количества -->
              <button
                @click="updateQuantity(product, product.quantity - 1)"
                :disabled="product.quantity <= 1"
                aria-disabled="product.quantity <= 1"
                aria-label="Уменьшить количество"
              >
                -
              </button>
              <!-- Отображение текущего количества -->
              <span class="quantity" aria-live="polite">{{ product.quantity }}</span>
              <!-- Кнопка увеличения количества -->
              <button
                @click="updateQuantity(product, product.quantity + 1)"
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>

            <!-- Кнопка удаления товара из корзины -->
            <button class="remove-btn" @click="removeProduct(product)" aria-label="Удалить товар">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/api";

// Список товаров в корзине
const products = ref([]);

// Состояние загрузки
const loading = ref(false);

// Обработчик ошибки загрузки изображения — отображаем заглушку
const handleImageError = (product) => {
  product.imageLoaded = false;
};

// Обработчик успешной загрузки изображения
const handleImageLoad = (product) => {
  product.imageLoaded = true;
};

// Загрузка корзины при открытии компонента
async function loadCart() {
  loading.value = true;
  try {
    // Получаем список товаров из API
    const response = await api.get("/cart");
    products.value = response.data.products.map((p) => ({
      ...p,
      // Используем productColorSizeId как уникальный ключ (если есть)
      productColorSizeId: p.productColorSizeId || p.id,
      imageLoaded: true, // Сначала предполагаем, что изображение загрузится
    }));
  } catch (error) {
    console.error("Ошибка загрузки корзины:", error);
    products.value = []; // В случае ошибки — очищаем корзину
  } finally {
    loading.value = false;
  }
}

// Обновление количества товара
async function updateQuantity(product, newQuantity) {
  if (newQuantity < 1) return;

  try {
    // Отправляем новое количество на сервер
    await api.patch(`/cart/product/${product.productColorSizeId}`, {
      quantity: newQuantity,
    });
    // Обновляем локально
    product.quantity = newQuantity;
  } catch (error) {
    console.error("Ошибка обновления количества:", error);
  }
}

// Удаление товара из корзины
async function removeProduct(product) {
  try {
    // Удаляем товар через API
    await api.delete(`/cart/product/${product.productColorSizeId}`);
    // Удаляем из локального списка
    products.value = products.value.filter(
      (p) => p.productColorSizeId !== product.productColorSizeId
    );
  } catch (error) {
    console.error("Ошибка удаления товара:", error);
  }
}

// Загружаем корзину при монтировании компонента
onMounted(() => {
  loadCart();
});
</script>


<style scoped>
/* Контейнер корзины */
.cart-items-container {
  max-width: 900px;
  margin: 0 auto;
  background-color: #1a1a2e;
  padding: 25px 35px;
  border-radius: 16px;
  box-sizing: border-box;
  color: #f7f7f7;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}

/* Сообщения загрузки и пустой корзины */
.loading,
.empty {
  text-align: center;
  font-size: 1.4rem;
  color: #999;
  padding: 50px 0;
}

/* Список товаров - вертикальный стек */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Карточка товара с градиентом и тенями */
.product-card {
  display: flex;
  background: linear-gradient(135deg, #2a2a40 0%, #1e1e32 100%);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s;
  padding: 20px 25px;
  gap: 30px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.07);
  outline-offset: 4px;
}

.product-card:hover,
.product-card:focus-within {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 15px 35px rgba(255, 133, 193, 0.3);
  border-color: rgba(255, 133, 193, 0.5);
}

/* Контейнер для фото с плавным увеличением */
.product-image-container {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
  transition: box-shadow 0.3s ease;
  position: relative;
}

.product-card:hover .product-image-container {
  box-shadow: 0 6px 20px rgba(255, 133, 193, 0.6);
}

.product-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  border-radius: 14px;
}

.product-card:hover .product-photo {
  transform: scale(1.1);
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
  border-radius: 14px;
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
  border-radius: 14px;
}

.placeholder-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  text-align: center;
}

/* Информация о товаре */
.product-info {
  flex-grow: 1;
  color: #ddd;
  font-size: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding-left: 10px;
}

/* Заголовок товара с плавным изменением цвета */
.product-name {
  margin: 0;
  font-weight: 700;
  font-size: 1.3rem;
  color: #f7f7f7;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #ff85c1;
}

/* Выделение цвета и размера */
.highlight {
  color: #ff85c1;
  font-weight: 600;
}

/* Цены */
.price {
  font-weight: 600;
  color: #ff85c1;
}

.price-total {
  font-weight: 700;
  color: #ff85c1;
  font-size: 1.2rem;
}

/* Управление количеством и удаление */
.product-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
  flex-shrink: 0;
}

/* Контролы количества */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-controls button {
  width: 38px;
  height: 38px;
  background-color: #c84b9e;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 1.3rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.quantity-controls button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.quantity-controls button:hover:not(:disabled) {
  background-color: #ff85c1;
}

.quantity {
  min-width: 36px;
  text-align: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: #eee;
  user-select: text;
}

/* Кнопка удаления с эффектом свечения */
.remove-btn {
  background-color: transparent;
  border: 2px solid #ff85c1;
  padding: 9px 20px;
  border-radius: 12px;
  color: #ff85c1;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, box-shadow 0.4s;
  user-select: none;
}

.remove-btn:hover {
  background-color: #ff85c1;
  color: #1a1a2e;
  box-shadow: 0 0 12px #ff85c1aa, 0 0 25px #ff85c1bb;
}

/* Адаптивность */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image-container {
    width: 100%;
    height: 250px;
  }

  .product-info {
    padding-left: 0;
    margin-top: 15px;
  }

  .product-controls {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin-top: 15px;
  }
}
</style>

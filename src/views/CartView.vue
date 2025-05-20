<template>
  <div class="cart-container">
    <!-- Левая часть: список товаров -->
    <div class="left-side">
      <CartItems :products="cart.products" @update="fetchCart" />
    </div>

    <!-- Правая часть: оформление заказа -->
    <div class="right-side">
      <CartCheckout :totalCost="cart.total_cost" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/api";

import CartItems from '@/components/cart/CartItems.vue'
import CartCheckout from '@/components/cart/CartCheckout.vue'

const cart = ref({
  products: [],
  total_cost: 0,
});

// Загрузка корзины с сервера
async function fetchCart() {
  try {
    const response = await api.get("/cart");
    if (response.data.products && Array.isArray(response.data.products)) {
      cart.value = response.data;
    } else {
      console.error("В ответе API нет массива products");
    }
  } catch (error) {
    console.error("Ошибка загрузки корзины:", error);
  }
}

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.cart-container {
  display: flex;
  gap: 3rem; /* Увеличенный отступ между корзиной и оформлением */
  padding: 2rem;
  min-height: 80vh;
  color: white;
  box-sizing: border-box;
  align-items: flex-start;
  justify-content: flex-start; /* Выравниваем по левому краю */
}

.left-side {
  flex: 1 1 0;
  max-width: 70%; /* Шире корзина */
  min-width: 0; /* Важно для flex-grow корректной работы */
}

.right-side {
  flex: 0 0 28%; /* Фиксированная ширина оформления */
  min-width: 280px;
  max-width: 28%;
}

/* Адаптив для мобильных */
@media (max-width: 768px) {
  .cart-container {
    flex-direction: column;
  }
  .left-side,
  .right-side {
    max-width: 100%;
    flex: none;
    width: 100%;
  }
}
</style>
